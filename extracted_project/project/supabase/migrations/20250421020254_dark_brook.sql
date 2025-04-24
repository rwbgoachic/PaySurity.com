/*
  # Create core tables and policies

  1. New Functions
    - `update_updated_at_column()` - Trigger function to automatically update `updated_at`

  2. New Tables
    - `organizations`
      - `id` (uuid, primary key)
      - `name` (text)
      - `business_line_id` (uuid, foreign key)
      - `subdomain` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `locations`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, foreign key)
      - `name` (text)
      - `address` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text)
      - `permissions` (jsonb)
      - `created_at` (timestamp)
    
    - `organization_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `organization_id` (uuid, foreign key)
      - `role_id` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business_line_id uuid REFERENCES business_lines(id),
  subdomain text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create organizations trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_organizations_updated_at'
  ) THEN
    CREATE TRIGGER update_organizations_updated_at
      BEFORE UPDATE ON organizations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create organizations RLS policy
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
CREATE POLICY "Users can view their organizations"
  ON organizations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = organizations.id
      AND organization_users.user_id = auth.uid()
    )
  );

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create locations trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_locations_updated_at'
  ) THEN
    CREATE TRIGGER update_locations_updated_at
      BEFORE UPDATE ON locations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create locations RLS policy
DROP POLICY IF EXISTS "Users can view locations of their organizations" ON locations;
CREATE POLICY "Users can view locations of their organizations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users
      WHERE organization_users.organization_id = locations.organization_id
      AND organization_users.user_id = auth.uid()
    )
  );

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create roles RLS policy
DROP POLICY IF EXISTS "Allow read access to roles for authenticated users" ON roles;
CREATE POLICY "Allow read access to roles for authenticated users"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create organization_users table
CREATE TABLE IF NOT EXISTS organization_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Create organization_users trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_organization_users_updated_at'
  ) THEN
    CREATE TRIGGER update_organization_users_updated_at
      BEFORE UPDATE ON organization_users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create organization_users RLS policy
DROP POLICY IF EXISTS "Users can view organization members" ON organization_users;
CREATE POLICY "Users can view organization members"
  ON organization_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      WHERE ou.organization_id = organization_users.organization_id
      AND ou.user_id = auth.uid()
    )
  );

-- Insert default roles
INSERT INTO roles (name, permissions) VALUES
  ('Owner', '{"all": true}'::jsonb),
  ('Admin', '{"manage_users": true, "manage_locations": true}'::jsonb),
  ('Member', '{"view_only": true}'::jsonb)
ON CONFLICT DO NOTHING;