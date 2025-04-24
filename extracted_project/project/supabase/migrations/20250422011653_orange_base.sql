/*
  # Service Integration Schema

  1. Changes
    - Add service_type to business_lines
    - Add service-specific data columns to organizations
    - Create service access control tables
    - Update RLS policies for service isolation

  2. Security
    - Enable RLS on new tables
    - Add service-specific access policies
*/

-- Add service type to business_lines if not exists
ALTER TABLE business_lines 
ADD COLUMN IF NOT EXISTS service_type text NOT NULL DEFAULT 'standard';

-- Update existing business lines with correct service types
UPDATE business_lines
SET service_type = CASE
  WHEN slug IN ('restaurant-pos', 'grocery-pos') THEN 'pos'
  WHEN slug = 'payroll' THEN 'payroll'
  ELSE 'standard'
END
WHERE service_type = 'standard';

-- Add service-specific columns to organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS service_data jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS service_config jsonb DEFAULT '{}'::jsonb;

-- Create service access table
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

-- Enable RLS
ALTER TABLE service_access ENABLE ROW LEVEL SECURITY;

-- Create service access policies
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

-- Add service-specific FAQs
INSERT INTO faqs (category, question, answer) VALUES
-- Restaurant POS (BistroBeast)
('BistroBeast', 'How do I set up my restaurant menu?', 'Access the Menu Management section in BistroBeast, click "Add Menu Items", and follow the wizard to add categories, items, and pricing.'),
('BistroBeast', 'Can I manage multiple dining areas?', 'Yes, BistroBeast supports multiple dining areas. Go to Settings → Floor Plan to create and manage different sections of your restaurant.'),
('BistroBeast', 'How do I process a refund?', 'To process a refund in BistroBeast, find the order in Order History, click "Refund", select the items to refund, and choose the refund method.'),

-- Grocery POS (GrocerEase)
('GrocerEase', 'How do I manage inventory across multiple stores?', 'GrocerEase''s central inventory management allows you to view and manage stock across all locations. Access Inventory → Multi-Store View for a complete overview.'),
('GrocerEase', 'How do I set up automatic reordering?', 'In GrocerEase, go to Inventory → Reorder Rules to set minimum stock levels and preferred suppliers. The system will automatically generate purchase orders when stock is low.'),
('GrocerEase', 'Can I customize receipt formats?', 'Yes, customize your receipts in GrocerEase by going to Settings → Receipt Templates. You can add your logo, custom messages, and choose which information to display.'),

-- Payroll
('Payroll', 'How do I process payroll for multiple pay periods?', 'In the Payroll dashboard, select "Run Payroll", choose the pay period, review the calculated wages and deductions, and submit for processing.'),
('Payroll', 'How are tax calculations handled?', 'Our payroll system automatically calculates federal, state, and local taxes based on employee information and current tax rates. Tax tables are updated automatically.'),
('Payroll', 'Can I set up different pay rates for different shifts?', 'Yes, go to Employee Settings → Pay Rates to configure multiple pay rates. You can set different rates for regular hours, overtime, holidays, and specific shifts.')
ON CONFLICT (id) DO UPDATE 
SET 
  category = EXCLUDED.category,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer;