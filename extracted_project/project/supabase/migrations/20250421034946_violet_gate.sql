-- Add service_type to business_lines if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_lines' AND column_name = 'service_type'
  ) THEN
    ALTER TABLE business_lines ADD COLUMN service_type text NOT NULL DEFAULT 'standard';
  END IF;
END $$;

-- Add service-specific data columns to organizations if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'service_data'
  ) THEN
    ALTER TABLE organizations ADD COLUMN service_data jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'global_user_id'
  ) THEN
    ALTER TABLE organizations ADD COLUMN global_user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Create audit_logs table if not exists
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  organization_id uuid REFERENCES organizations(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create audit_logs policy if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_logs' 
    AND policyname = 'Super admins can view all audit logs'
  ) THEN
    CREATE POLICY "Super admins can view all audit logs"
      ON audit_logs
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM organization_users ou
          JOIN roles r ON r.id = ou.role_id
          WHERE ou.user_id = auth.uid()
          AND (r.permissions->>'all')::boolean = true
        )
      );
  END IF;
END $$;

-- Create or replace audit log function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    organization_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    auth.uid(),
    CASE 
      WHEN TG_TABLE_NAME = 'organizations' THEN 
        CASE TG_OP
          WHEN 'DELETE' THEN OLD.id
          ELSE NEW.id
        END
      ELSE
        CASE TG_OP
          WHEN 'DELETE' THEN OLD.organization_id
          ELSE NEW.organization_id
        END
    END,
    TG_OP,
    TG_TABLE_NAME,
    CASE TG_OP
      WHEN 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Add audit triggers to tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'audit_organizations_trigger'
  ) THEN
    CREATE TRIGGER audit_organizations_trigger
      AFTER INSERT OR UPDATE OR DELETE ON organizations
      FOR EACH ROW EXECUTE FUNCTION create_audit_log();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'audit_locations_trigger'
  ) THEN
    CREATE TRIGGER audit_locations_trigger
      AFTER INSERT OR UPDATE OR DELETE ON locations
      FOR EACH ROW EXECUTE FUNCTION create_audit_log();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'audit_organization_users_trigger'
  ) THEN
    CREATE TRIGGER audit_organization_users_trigger
      AFTER INSERT OR UPDATE OR DELETE ON organization_users
      FOR EACH ROW EXECUTE FUNCTION create_audit_log();
  END IF;
END $$;

-- Update business_lines service types
UPDATE business_lines
SET service_type = CASE
  WHEN slug IN ('restaurant-pos', 'grocery-pos') THEN 'pos'
  WHEN slug IN ('digital-wallet-business', 'digital-wallet-family') THEN 'wallet'
  WHEN slug IN ('dentistry', 'chiropractic') THEN 'healthcare'
  WHEN slug = 'legal' THEN 'legal'
  WHEN slug = 'payroll' THEN 'payroll'
  ELSE 'standard'
END
WHERE service_type = 'standard';

-- Add indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_global_user_id ON organizations(global_user_id);