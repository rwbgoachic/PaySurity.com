/*
  # Alert System Tables

  1. New Tables
    - `cashflow_alerts`: Stores cashflow threshold alerts
    - `fraud_alerts`: Stores fraud detection alerts
    - `transaction_stats`: Stores transaction statistics for fraud detection

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can view cashflow alerts" ON cashflow_alerts;
    DROP POLICY IF EXISTS "Admins can view fraud alerts" ON fraud_alerts;
    DROP POLICY IF EXISTS "Admins can view transaction stats" ON transaction_stats;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS cashflow_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  threshold decimal(16,4) NOT NULL,
  current_value decimal(16,4) NOT NULL,
  triggered_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS transaction_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  time_window text NOT NULL,
  mean_amount decimal(16,4) NOT NULL,
  std_dev decimal(16,4) NOT NULL,
  sample_size int NOT NULL,
  calculated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cashflow_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_stats ENABLE ROW LEVEL SECURITY;

-- Create new policies with ALL permissions
CREATE POLICY "Admins can manage cashflow alerts"
  ON cashflow_alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = cashflow_alerts.organization_id
      AND ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

CREATE POLICY "Admins can manage fraud alerts"
  ON fraud_alerts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = fraud_alerts.organization_id
      AND ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

CREATE POLICY "Admins can manage transaction stats"
  ON transaction_stats
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = transaction_stats.organization_id
      AND ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cashflow_alerts_org ON cashflow_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_org ON fraud_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_transaction_stats_org ON transaction_stats(organization_id);

-- Add organization settings columns if they don't exist
DO $$
BEGIN
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS cashflow_threshold decimal(16,4);
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS alert_email text;
    ALTER TABLE organizations ADD COLUMN IF NOT EXISTS alert_threshold decimal(16,4);
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;