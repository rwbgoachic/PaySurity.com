/*
  # Create business lines table and seed data

  1. New Tables
    - `business_lines`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `slug` (text, unique, not null)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `business_lines` table
    - Add policy for authenticated users to read business lines

  3. Initial Data
    - Insert predefined business lines
*/

-- Create business_lines table
CREATE TABLE IF NOT EXISTS business_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE business_lines ENABLE ROW LEVEL SECURITY;

-- Create policy for reading business lines if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'business_lines' 
    AND policyname = 'Allow read access to all authenticated users'
  ) THEN
    CREATE POLICY "Allow read access to all authenticated users"
      ON business_lines
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Insert initial business lines
INSERT INTO business_lines (name, slug) VALUES
  ('Merchant Services', 'merchants'),
  ('Restaurant Management POS', 'restaurant-pos'),
  ('Grocery Store Management POS', 'grocery-pos'),
  ('Payroll Solution', 'payroll'),
  ('Dentistry Practice Management', 'dentistry'),
  ('Chiropractic Practice Management', 'chiropractic'),
  ('Law Practice Management', 'legal'),
  ('Digital Wallet for Employers', 'digital-wallet-business'),
  ('Digital Wallet for Families', 'digital-wallet-family')
ON CONFLICT (slug) DO NOTHING;