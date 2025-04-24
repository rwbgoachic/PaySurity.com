/*
  # Add Service Management Tables

  1. New Tables
    - `service_access`: Tracks service enablement and configuration
    - `service_logs`: Audit trail for service-related events
    - `service_integrations`: External service provider integrations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create service_access table if not exists
CREATE TABLE IF NOT EXISTS service_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, service_type)
);

-- Create service_logs table
CREATE TABLE IF NOT EXISTS service_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

-- Create service_integrations table
CREATE TABLE IF NOT EXISTS service_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  provider text NOT NULL,
  credentials jsonb DEFAULT '{}'::jsonb,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, service_type, provider)
);

-- Enable RLS
ALTER TABLE service_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their service access" ON service_access;
    DROP POLICY IF EXISTS "Admins can manage service access" ON service_access;
    DROP POLICY IF EXISTS "Users can view their service logs" ON service_logs;
    DROP POLICY IF EXISTS "Users can view their service integrations" ON service_integrations;
    DROP POLICY IF EXISTS "Admins can manage service integrations" ON service_integrations;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Service Access Policies
CREATE POLICY "Users can view their service access"
  ON service_access
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = service_access.organization_id
      AND organization_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage service access"
  ON service_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = service_access.organization_id
      AND ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

-- Service Logs Policies
CREATE POLICY "Users can view their service logs"
  ON service_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = service_logs.organization_id
      AND organization_users.user_id = auth.uid()
    )
  );

-- Service Integrations Policies
CREATE POLICY "Users can view their service integrations"
  ON service_integrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = service_integrations.organization_id
      AND organization_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage service integrations"
  ON service_integrations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = service_integrations.organization_id
      AND ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

-- Add service-specific columns to organizations if not exists
DO $$ 
BEGIN
    ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS service_data jsonb DEFAULT '{}'::jsonb;

    ALTER TABLE organizations
    ADD COLUMN IF NOT EXISTS service_config jsonb DEFAULT '{}'::jsonb;
EXCEPTION
    WHEN duplicate_column THEN NULL;
END $$;

-- Update business_lines service types
UPDATE business_lines
SET service_type = CASE
  WHEN slug IN ('restaurant-pos', 'grocery-pos') THEN 'pos'
  WHEN slug = 'payroll' THEN 'payroll'
  ELSE 'standard'
END
WHERE service_type = 'standard';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_service_access_org ON service_access(organization_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_org ON service_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_service_integrations_org ON service_integrations(organization_id);

-- Add service-specific FAQs
INSERT INTO faqs (category, question, answer) VALUES
-- BistroBeast FAQs
('BistroBeast', 'How do I set up table management?', 'Access the Floor Plan section in BistroBeast, click "Edit Layout", and use the drag-and-drop interface to create your restaurant layout with tables, sections, and service areas.'),
('BistroBeast', 'Can I track server performance?', 'Yes, BistroBeast provides detailed server performance metrics including sales, tips, table turnover rates, and customer satisfaction scores in the Staff Reports section.'),
('BistroBeast', 'How do I handle split checks?', 'To split checks in BistroBeast, open the order, click "Split Bill", then either split by percentage, amount, or drag items to different checks.'),

-- GrocerEase FAQs
('GrocerEase', 'How does inventory tracking work?', 'GrocerEase uses real-time inventory tracking with barcode scanning. Each sale automatically updates stock levels, and you can set up automatic reorder points for each product.'),
('GrocerEase', 'Can I manage multiple suppliers?', 'Yes, GrocerEase supports multiple supplier management. Go to Inventory → Suppliers to add vendors, set preferred suppliers for products, and manage purchase orders.'),
('GrocerEase', 'How do I handle product recalls?', 'In case of a recall, use the Product Safety module to quickly identify affected inventory, automatically notify customers who purchased the item, and generate recall reports.'),

-- Payroll FAQs
('Payroll', 'How are overtime calculations handled?', 'The system automatically calculates overtime based on configured rules. You can set different overtime rates for regular overtime (>40 hours), double time, and holiday pay.'),
('Payroll', 'Can I automate tax filings?', 'Yes, our payroll system automatically handles federal, state, and local tax filings. It generates and submits all required forms (W-2s, 1099s, etc.) and maintains compliance records.'),
('Payroll', 'How do I handle contractor payments?', 'Manage contractor payments through the Contractor Portal. You can track 1099 workers, process payments, and maintain required documentation for tax purposes.')
ON CONFLICT (id) DO UPDATE 
SET 
  category = EXCLUDED.category,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer;