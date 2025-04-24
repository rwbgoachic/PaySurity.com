/*
  # Add archived organizations table and offboarding functionality

  1. New Tables
    - `archived_organizations`: Stores archived organization data
      - Inherits structure from organizations table
      - Adds archival metadata (reason, archived_by, etc.)

  2. Functions
    - `archive_organization`: Moves organization data to archive
    - `restore_organization`: Restores archived organization

  3. Security
    - Enable RLS on archived_organizations
    - Add policies for super admins only
*/

-- Create archived organizations table
CREATE TABLE IF NOT EXISTS archived_organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  business_line_id uuid REFERENCES business_lines(id),
  subdomain text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  service_data jsonb DEFAULT '{}'::jsonb,
  global_user_id uuid REFERENCES auth.users(id),
  archived_at timestamptz NOT NULL DEFAULT now(),
  archived_by uuid REFERENCES auth.users(id),
  archive_reason text,
  grace_period_end timestamptz
);

-- Enable RLS
ALTER TABLE archived_organizations ENABLE ROW LEVEL SECURITY;

-- Create policy for super admins
CREATE POLICY "Super admins can manage archived organizations"
  ON archived_organizations
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

-- Function to archive organization
CREATE OR REPLACE FUNCTION archive_organization(
  p_organization_id uuid,
  p_archive_reason text,
  p_grace_period_days int DEFAULT 30
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org record;
BEGIN
  -- Get organization data
  SELECT * INTO v_org FROM organizations WHERE id = p_organization_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Organization not found';
  END IF;

  -- Insert into archived_organizations
  INSERT INTO archived_organizations (
    id, name, business_line_id, subdomain, created_at, 
    updated_at, service_data, global_user_id, archived_by,
    archive_reason, grace_period_end
  )
  VALUES (
    v_org.id, v_org.name, v_org.business_line_id, v_org.subdomain,
    v_org.created_at, v_org.updated_at, v_org.service_data,
    v_org.global_user_id, auth.uid(), p_archive_reason,
    now() + (p_grace_period_days || ' days')::interval
  );

  -- Update organization status
  UPDATE organizations
  SET archived_at = now()
  WHERE id = p_organization_id;

  -- Create audit log
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, new_data
  )
  VALUES (
    auth.uid(),
    'ARCHIVE',
    'organizations',
    p_organization_id,
    jsonb_build_object(
      'reason', p_archive_reason,
      'grace_period_days', p_grace_period_days
    )
  );
END;
$$;

-- Function to restore archived organization
CREATE OR REPLACE FUNCTION restore_organization(
  p_organization_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update organization status
  UPDATE organizations
  SET archived_at = NULL
  WHERE id = p_organization_id;

  -- Remove from archived_organizations
  DELETE FROM archived_organizations
  WHERE id = p_organization_id;

  -- Create audit log
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, new_data
  )
  VALUES (
    auth.uid(),
    'RESTORE',
    'organizations',
    p_organization_id,
    jsonb_build_object('restored_at', now())
  );
END;
$$;