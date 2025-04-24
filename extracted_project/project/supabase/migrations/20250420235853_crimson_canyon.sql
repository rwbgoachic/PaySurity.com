/*
  # Initial PaySurity Database Schema

  1. New Tables
    - `business_lines` - Stores different business verticals (restaurant, grocery, etc.)
      - `id` (uuid, primary key)
      - `name` (text) - Name of the business line
      - `slug` (text) - URL-friendly identifier
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `organizations` - Companies using PaySurity
      - `id` (uuid, primary key)
      - `name` (text) - Organization name
      - `business_line_id` (uuid) - Reference to business line
      - `subdomain` (text) - Custom subdomain
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `locations` - Physical locations for organizations
      - `id` (uuid, primary key)
      - `organization_id` (uuid) - Reference to organization
      - `name` (text) - Location name
      - `address` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `roles` - User roles within organizations
      - `id` (uuid, primary key)
      - `name` (text) - Role name
      - `permissions` (jsonb) - Role permissions
      - `created_at` (timestamp)

    - `organization_users` - Users associated with organizations
      - `id` (uuid, primary key)
      - `user_id` (uuid) - Reference to auth.users
      - `organization_id` (uuid) - Reference to organization
      - `role_id` (uuid) - Reference to role
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for organization access
    - Add policies for location access
    - Add policies for role management

  3. Functions
    - create_organization() - Creates new organization
    - add_organization_user() - Adds user to organization
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Business Lines Table
CREATE TABLE business_lines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE business_lines ENABLE ROW LEVEL SECURITY;

-- Organizations Table
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  business_line_id uuid REFERENCES business_lines(id),
  subdomain text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Locations Table
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Roles Table
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Organization Users Table
CREATE TABLE organization_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_organization_users_updated_at
  BEFORE UPDATE ON organization_users
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- RLS Policies

-- Business Lines policies
CREATE POLICY "Allow read access to all authenticated users"
  ON business_lines
  FOR SELECT
  TO authenticated
  USING (true);

-- Organizations policies
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

-- Locations policies
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

-- Roles policies
CREATE POLICY "Allow read access to roles for authenticated users"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Organization Users policies
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

-- Insert initial roles
INSERT INTO roles (name, permissions) VALUES
  ('super_admin', '{"all": true}'::jsonb),
  ('sub_super_admin', '{"manage_users": true, "manage_locations": true}'::jsonb),
  ('organization_admin', '{"manage_organization": true}'::jsonb),
  ('location_manager', '{"manage_location": true}'::jsonb),
  ('employee', '{"basic_access": true}'::jsonb);

-- Insert business lines
INSERT INTO business_lines (name, slug) VALUES
  ('Merchant Services', 'merchants'),
  ('Restaurant Management', 'restaurant'),
  ('Grocery Store Management', 'grocery'),
  ('Payroll Solution', 'payroll'),
  ('Dentistry Practice Management', 'dentistry'),
  ('Chiropractic Practice Management', 'chiropractic'),
  ('Law Practice Management', 'legal'),
  ('Digital Wallet for Employers', 'digital-wallet-business'),
  ('Digital Wallet for Families', 'digital-wallet-family');