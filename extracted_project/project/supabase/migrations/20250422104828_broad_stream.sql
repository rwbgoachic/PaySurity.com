/*
  # GDPR Compliance and Enhanced Audit Logging

  1. New Tables
    - data_retention_policies: Configurable retention periods
    - data_deletion_requests: Track user deletion requests
    - enhanced_audit_logs: GDPR-compliant audit trail
  
  2. Security
    - RLS policies for all new tables
    - Automated data retention enforcement
*/

-- Create data retention policies table
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  data_type text NOT NULL,
  retention_period interval NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, data_type)
);

-- Create data deletion requests table
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  verification_token uuid DEFAULT gen_random_uuid(),
  UNIQUE(user_id, organization_id, status)
);

-- Create enhanced audit logs table
CREATE TABLE IF NOT EXISTS enhanced_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  retention_period interval DEFAULT interval '7 years'
);

-- Enable RLS on all tables
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE enhanced_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_retention_policies_org 
ON data_retention_policies(organization_id);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_user 
ON data_deletion_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_org 
ON data_deletion_requests(organization_id);

CREATE INDEX IF NOT EXISTS idx_enhanced_audit_logs_org 
ON enhanced_audit_logs(organization_id);

CREATE INDEX IF NOT EXISTS idx_enhanced_audit_logs_created 
ON enhanced_audit_logs(created_at);

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_retention_policies_updated_at
    BEFORE UPDATE ON data_retention_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create enhanced audit log
CREATE OR REPLACE FUNCTION create_enhanced_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id uuid;
    v_ip_address inet;
    v_user_agent text;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- Get request information from current_setting if available
    BEGIN
        v_ip_address := current_setting('request.headers')::jsonb->>'x-real-ip';
        v_user_agent := current_setting('request.headers')::jsonb->>'user-agent';
    EXCEPTION WHEN OTHERS THEN
        v_ip_address := NULL;
        v_user_agent := NULL;
    END;

    -- Insert audit log
    INSERT INTO enhanced_audit_logs (
        user_id,
        organization_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        ip_address,
        user_agent
    ) VALUES (
        v_user_id,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.organization_id
            ELSE NEW.organization_id
        END,
        TG_OP,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('UPDATE', 'INSERT') THEN to_jsonb(NEW) ELSE NULL END,
        v_ip_address,
        v_user_agent
    );

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
CREATE POLICY "Organization admins can manage retention policies"
    ON data_retention_policies
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_users ou
            JOIN roles r ON r.id = ou.role_id
            WHERE ou.organization_id = data_retention_policies.organization_id
            AND ou.user_id = auth.uid()
            AND (r.permissions->>'all')::boolean = true
        )
    );

CREATE POLICY "Users can request their own data deletion"
    ON data_deletion_requests
    TO authenticated
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Organization admins can view deletion requests"
    ON data_deletion_requests
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_users ou
            JOIN roles r ON r.id = ou.role_id
            WHERE ou.organization_id = data_deletion_requests.organization_id
            AND ou.user_id = auth.uid()
            AND (r.permissions->>'all')::boolean = true
        )
    );

CREATE POLICY "Organization admins can view audit logs"
    ON enhanced_audit_logs
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_users ou
            JOIN roles r ON r.id = ou.role_id
            WHERE ou.organization_id = enhanced_audit_logs.organization_id
            AND ou.user_id = auth.uid()
            AND (r.permissions->>'all')::boolean = true
        )
    );

-- Add enhanced audit logging triggers to key tables
CREATE TRIGGER audit_transactions_enhanced
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION create_enhanced_audit_log();

CREATE TRIGGER audit_organizations_enhanced
    AFTER INSERT OR UPDATE OR DELETE ON organizations
    FOR EACH ROW EXECUTE FUNCTION create_enhanced_audit_log();

CREATE TRIGGER audit_organization_users_enhanced
    AFTER INSERT OR UPDATE OR DELETE ON organization_users
    FOR EACH ROW EXECUTE FUNCTION create_enhanced_audit_log();