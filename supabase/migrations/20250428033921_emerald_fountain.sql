/*
  # Merchant onboarding schema

  1. New Tables
    - `merchant_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `business_name` (text)
      - `business_type` (text)
      - `tax_id` (text)
      - `address` (text)
      - `city` (text)
      - `state` (text)
      - `zip_code` (text)
      - `phone` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `merchant_documents`
      - `id` (uuid, primary key)
      - `merchant_id` (uuid, references merchant_profiles)
      - `document_type` (text)
      - `document_url` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for merchants to manage their own data
    - Add policies for admins to manage all data

  3. Changes
    - Added IF NOT EXISTS to all policy creations
    - Updated policy checks to use profiles table for role verification
    - Added proper foreign key references
*/

-- Create merchant_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS merchant_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type text NOT NULL,
  tax_id text,
  address text,
  city text,
  state text,
  zip_code text,
  phone text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create merchant_documents table if it doesn't exist
CREATE TABLE IF NOT EXISTS merchant_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchant_profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('tax_form', 'id_proof', 'business_license')),
  document_url text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE merchant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Merchants can view own profile" ON merchant_profiles;
  DROP POLICY IF EXISTS "Merchants can insert own profile" ON merchant_profiles;
  DROP POLICY IF EXISTS "Merchants can update own profile" ON merchant_profiles;
  DROP POLICY IF EXISTS "Merchants can view own documents" ON merchant_documents;
  DROP POLICY IF EXISTS "Merchants can insert own documents" ON merchant_documents;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create new policies
CREATE POLICY "Merchants can view own profile"
  ON merchant_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Merchants can insert own profile"
  ON merchant_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Merchants can update own profile"
  ON merchant_profiles
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Merchants can view own documents"
  ON merchant_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM merchant_profiles
      WHERE merchant_profiles.id = merchant_documents.merchant_id
      AND merchant_profiles.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Merchants can insert own documents"
  ON merchant_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchant_profiles
      WHERE merchant_profiles.id = merchant_documents.merchant_id
      AND merchant_profiles.user_id = auth.uid()
    )
  );

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION handle_merchant_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_merchant_profiles_updated_at ON merchant_profiles;
CREATE TRIGGER update_merchant_profiles_updated_at
  BEFORE UPDATE ON merchant_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_merchant_updated_at();