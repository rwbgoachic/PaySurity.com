/*
  # FAQ Schema and Functions Setup

  1. Tables
    - `faqs` table with embedding support
    - Indexes for performance
    - RLS policies for security

  2. Functions
    - Embedding update trigger
    - Similarity search
    - Text normalization
*/

-- Drop existing objects to ensure clean setup
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public read access to FAQs" ON faqs;
    DROP POLICY IF EXISTS "Allow admin write access to FAQs" ON faqs;
    DROP TRIGGER IF EXISTS update_faq_embedding_trigger ON faqs;
    DROP FUNCTION IF EXISTS update_faq_embedding();
    DROP FUNCTION IF EXISTS match_faqs(float[], float, int);
    DROP FUNCTION IF EXISTS normalize_faq_text(text);
EXCEPTION 
    WHEN undefined_object OR undefined_table THEN 
        NULL;
END $$;

-- Create FAQs table
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
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_created_at ON faqs(created_at);
CREATE INDEX IF NOT EXISTS idx_faqs_embedding ON faqs USING gin(embedding);

-- Function to update FAQ embeddings
CREATE OR REPLACE FUNCTION update_faq_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for embedding updates
CREATE TRIGGER update_faq_embedding_trigger
  BEFORE INSERT OR UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_embedding();

-- Function for similarity search
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
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.category,
    f.question,
    f.answer,
    1 - (f.embedding <-> query_embedding) as similarity
  FROM faqs f
  WHERE f.embedding IS NOT NULL
  AND 1 - (f.embedding <-> query_embedding) > match_threshold
  ORDER BY f.embedding <-> query_embedding ASC
  LIMIT match_count;
END;
$$;

-- Function to normalize FAQ text
CREATE OR REPLACE FUNCTION normalize_faq_text(input_text text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN trim(regexp_replace(lower(input_text), '\s+', ' ', 'g'));
END;
$$;