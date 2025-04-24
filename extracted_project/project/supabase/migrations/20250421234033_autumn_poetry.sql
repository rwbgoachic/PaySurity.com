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
    WHEN undefined_table THEN 
        NULL;
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
  ON faqs
  USING (
    EXISTS (
      SELECT 1 FROM organization_users ou
      JOIN roles r ON r.id = ou.role_id
      WHERE ou.user_id = auth.uid()
      AND (r.permissions->>'all')::boolean = true
    )
  );

-- Drop existing functions and triggers if they exist
DROP TRIGGER IF EXISTS update_faq_embedding_trigger ON faqs;
DROP FUNCTION IF EXISTS update_faq_embedding();
DROP FUNCTION IF EXISTS match_faqs(float[], float, int);

-- Function to update FAQ embeddings
CREATE OR REPLACE FUNCTION update_faq_embedding()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This would be called by an Edge Function that generates embeddings
  -- For now, we'll just update the timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for embedding updates
CREATE TRIGGER update_faq_embedding_trigger
  BEFORE INSERT OR UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_embedding();

-- Create function for similarity search using dot product
CREATE OR REPLACE FUNCTION match_faqs(
  query_embedding float[],
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  category text,
  question text,
  answer text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.category,
    f.question,
    f.answer,
    (f.embedding <-> query_embedding) * -1 as similarity
  FROM faqs f
  WHERE f.embedding IS NOT NULL
  AND (f.embedding <-> query_embedding) * -1 > match_threshold
  ORDER BY f.embedding <-> query_embedding
  LIMIT match_count;
END;
$$;