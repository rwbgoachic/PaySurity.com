/*
  # Create onboarding tables

  1. New Tables
    - `onboarding_status`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `status` (text)
      - `step` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `verification_tokens`
      - `id` (uuid, primary key)
      - `email` (text)
      - `phone` (text)
      - `token` (text)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create onboarding_status table
CREATE TABLE IF NOT EXISTS onboarding_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  step text NOT NULL DEFAULT 'verification',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  phone text,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Policies for onboarding_status
CREATE POLICY "Users can view their organization's onboarding status"
  ON onboarding_status
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = onboarding_status.organization_id
      AND organization_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can update onboarding status"
  ON onboarding_status
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = onboarding_status.organization_id
      AND ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

-- Policies for verification_tokens
CREATE POLICY "Users can view their own verification tokens"
  ON verification_tokens
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

-- Add archived_at column to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for onboarding_status
CREATE TRIGGER update_onboarding_status_updated_at
  BEFORE UPDATE ON onboarding_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();