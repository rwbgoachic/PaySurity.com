/*
  # Add RLS policies for data modification

  This migration adds the necessary RLS policies to allow authenticated users to:
  - Create organizations and become owners
  - Manage organization users
  - Manage locations
  - Update organization details

  1. Organizations Policies
    - Allow creation (authenticated users)
    - Allow updates (organization admins)
    - Allow deletion (organization owners)

  2. Locations Policies
    - Allow creation (organization admins)
    - Allow updates (organization admins)
    - Allow deletion (organization admins)

  3. Organization Users Policies
    - Allow creation (organization admins)
    - Allow updates (organization admins)
    - Allow deletion (organization admins)
*/

-- Organizations Policies
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations"
  ON organizations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Organization admins can update organizations" ON organizations;
CREATE POLICY "Organization admins can update organizations"
  ON organizations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = organizations.id
      AND ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
      OR (r.permissions->>'manage_organization')::boolean = true
    )
  );

DROP POLICY IF EXISTS "Organization owners can delete organizations" ON organizations;
CREATE POLICY "Organization owners can delete organizations"
  ON organizations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = organizations.id
      AND ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

-- Locations Policies
DROP POLICY IF EXISTS "Organization admins can create locations" ON locations;
CREATE POLICY "Organization admins can create locations"
  ON locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = locations.organization_id
      AND ou.user_id = auth.uid()
      AND ((r.permissions->>'all')::boolean = true
      OR (r.permissions->>'manage_locations')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Organization admins can update locations" ON locations;
CREATE POLICY "Organization admins can update locations"
  ON locations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = locations.organization_id
      AND ou.user_id = auth.uid()
      AND ((r.permissions->>'all')::boolean = true
      OR (r.permissions->>'manage_locations')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Organization admins can delete locations" ON locations;
CREATE POLICY "Organization admins can delete locations"
  ON locations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = locations.organization_id
      AND ou.user_id = auth.uid()
      AND ((r.permissions->>'all')::boolean = true
      OR (r.permissions->>'manage_locations')::boolean = true)
    )
  );

-- Organization Users Policies
DROP POLICY IF EXISTS "Organization admins can create organization users" ON organization_users;
CREATE POLICY "Organization admins can create organization users"
  ON organization_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = organization_users.organization_id
      AND ou.user_id = auth.uid()
      AND ((r.permissions->>'all')::boolean = true
      OR (r.permissions->>'manage_users')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Organization admins can update organization users" ON organization_users;
CREATE POLICY "Organization admins can update organization users"
  ON organization_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = organization_users.organization_id
      AND ou.user_id = auth.uid()
      AND ((r.permissions->>'all')::boolean = true
      OR (r.permissions->>'manage_users')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Organization admins can delete organization users" ON organization_users;
CREATE POLICY "Organization admins can delete organization users"
  ON organization_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.organization_id = organization_users.organization_id
      AND ou.user_id = auth.uid()
      AND ((r.permissions->>'all')::boolean = true
      OR (r.permissions->>'manage_users')::boolean = true)
    )
  );

-- Function to automatically create an owner user when an organization is created
CREATE OR REPLACE FUNCTION create_organization_owner()
RETURNS TRIGGER AS $$
DECLARE
  owner_role_id uuid;
BEGIN
  -- Get the owner role ID
  SELECT id INTO owner_role_id FROM roles WHERE name = 'Owner' LIMIT 1;
  
  -- Create organization_user entry for the creator as owner
  INSERT INTO organization_users (user_id, organization_id, role_id)
  VALUES (auth.uid(), NEW.id, owner_role_id);
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically assign owner role
DROP TRIGGER IF EXISTS on_organization_created ON organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_organization_owner();