/*
  # Add Cashflow and Fraud Prevention Tables

  1. New Tables
    - `cashflow_alerts`: Stores cashflow alert configurations and history
    - `fraud_alerts`: Stores detected fraudulent transactions
    - `transaction_stats`: Stores rolling statistics for fraud detection

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create cashflow_alerts table
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

-- Create fraud_alerts table
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

-- Create transaction_stats table
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

-- Create policies
CREATE POLICY "Admins can view cashflow alerts"
  ON cashflow_alerts
  FOR SELECT
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

CREATE POLICY "Admins can view fraud alerts"
  ON fraud_alerts
  FOR SELECT
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

CREATE POLICY "Admins can view transaction stats"
  ON transaction_stats
  FOR SELECT
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cashflow_alerts_org ON cashflow_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_org ON fraud_alerts(organization_id);
CREATE INDEX IF NOT EXISTS idx_transaction_stats_org ON transaction_stats(organization_id);

-- Add organization settings columns
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS cashflow_threshold decimal(16,4),
ADD COLUMN IF NOT EXISTS alert_email text,
ADD COLUMN IF NOT EXISTS alert_threshold decimal(16,4);