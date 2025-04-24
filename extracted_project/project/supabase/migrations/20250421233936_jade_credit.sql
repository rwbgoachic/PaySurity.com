/*
  # Add FAQs table for chatbot training

  1. New Tables
    - `faqs`: Stores FAQ content
      - Categories and questions/answers
      - Embeddings stored as float array for semantic search

  2. Security
    - Enable RLS
    - Public read access
    - Admin-only write access
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read access to FAQs" ON faqs;
  DROP POLICY IF EXISTS "Allow admin write access to FAQs" ON faqs;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Create FAQs table if it doesn't exist
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  embedding float[] DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to FAQs"
  ON faqs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin write access to FAQs"
  ON faqs FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1 
      FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs (category);
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON faqs (created_at);

-- Function to update FAQ embeddings
CREATE OR REPLACE FUNCTION update_faq_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This will be called by an Edge Function to update embeddings
  -- For now, just update the timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_faq_embedding_trigger ON faqs;

-- Create trigger for embedding updates
CREATE TRIGGER update_faq_embedding_trigger
  BEFORE INSERT OR UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_embedding();

-- Function for similarity search using dot product
CREATE OR REPLACE FUNCTION match_faqs(
  query_embedding float[],
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  category text,
  question text,
  answer text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    id,
    category,
    question,
    answer,
    (embedding <-> query_embedding) * -1 as similarity
  FROM faqs
  WHERE embedding IS NOT NULL
  AND (embedding <-> query_embedding) * -1 > match_threshold
  ORDER BY embedding <-> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to clean and normalize FAQ text
CREATE OR REPLACE FUNCTION normalize_faq_text(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN trim(regexp_replace(lower(input_text), '\s+', ' ', 'g'));
END;
$$;

-- Add some initial FAQ categories
DO $$
BEGIN
  INSERT INTO faqs (category, question, answer) VALUES
  ('Onboarding', 'How do I verify my account?', 'Click the verification link sent to your email and follow the instructions to complete the verification process.'),
  ('Billing', 'How do I update my payment method?', 'Go to Settings → Billing → Payment Methods and click "Add New Method" to update your payment information.'),
  ('Security', 'How do I enable two-factor authentication?', 'Navigate to Settings → Security and click "Enable 2FA". Follow the prompts to set up using your preferred authentication method.'),
  ('General', 'What payment methods do you accept?', 'We accept all major credit cards, ACH transfers, and digital wallets including Apple Pay and Google Pay.'),
  ('Support', 'How do I contact customer support?', 'You can reach our support team 24/7 via email at support@paysurity.com or through the chat widget in your dashboard.')
  ON CONFLICT (id) DO NOTHING;
END;
$$;