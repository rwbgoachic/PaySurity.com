/*
  # Transaction Monitoring System

  1. New Tables
    - `transactions` - Stores all financial transactions
    - `transaction_stats` - Stores statistical analysis for monitoring

  2. Functions
    - `calculate_transaction_stats` - Calculates statistics for given time window
    - `update_transaction_stats` - Trigger function to update stats on transaction changes

  3. Security
    - Enable RLS on all tables
    - Add policies for organization access
*/

-- Create transactions table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'transactions') THEN
    CREATE TABLE transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
      service_type text NOT NULL,
      amount decimal(16,4) NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    -- Enable RLS on transactions
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

    -- Create indexes
    CREATE INDEX idx_transactions_org_service
    ON transactions(organization_id, service_type);

    CREATE INDEX idx_transactions_created_at
    ON transactions(created_at);

    -- Add RLS policies
    CREATE POLICY "Users can view transactions for their organizations"
      ON transactions FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM organization_users
          WHERE organization_users.organization_id = transactions.organization_id
          AND organization_users.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create transaction_stats table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'transaction_stats') THEN
    CREATE TABLE transaction_stats (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
      service_type text NOT NULL,
      time_window text NOT NULL,
      mean_amount decimal(16,4) NOT NULL,
      std_dev decimal(16,4) NOT NULL,
      sample_size int NOT NULL,
      calculated_at timestamptz DEFAULT now(),
      UNIQUE(organization_id, service_type, time_window)
    );

    -- Enable RLS on transaction_stats
    ALTER TABLE transaction_stats ENABLE ROW LEVEL SECURITY;

    -- Create indexes
    CREATE INDEX idx_transaction_stats_org_service
    ON transaction_stats(organization_id, service_type);

    CREATE INDEX idx_transaction_stats_window
    ON transaction_stats(time_window);

    -- Add RLS policies
    CREATE POLICY "Users can view transaction stats for their organizations"
      ON transaction_stats FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM organization_users
          WHERE organization_users.organization_id = transaction_stats.organization_id
          AND organization_users.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Function to calculate transaction statistics
CREATE OR REPLACE FUNCTION calculate_transaction_stats(
  p_organization_id uuid,
  p_service_type text,
  p_time_window interval
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mean decimal(16,4);
  v_std_dev decimal(16,4);
  v_sample_size int;
  v_window_text text;
BEGIN
  -- Calculate window text (e.g., '24h', '7d', '30d')
  v_window_text := CASE 
    WHEN p_time_window = interval '1 day' THEN '24h'
    WHEN p_time_window = interval '7 days' THEN '7d'
    WHEN p_time_window = interval '30 days' THEN '30d'
    ELSE '24h'
  END;

  -- Calculate statistics
  SELECT 
    COALESCE(AVG(amount), 0)::decimal(16,4),
    COALESCE(STDDEV(amount), 0)::decimal(16,4),
    COUNT(*)
  INTO v_mean, v_std_dev, v_sample_size
  FROM transactions
  WHERE organization_id = p_organization_id
    AND service_type = p_service_type
    AND created_at >= NOW() - p_time_window;

  -- Insert or update stats
  INSERT INTO transaction_stats (
    organization_id,
    service_type,
    time_window,
    mean_amount,
    std_dev,
    sample_size,
    calculated_at
  ) VALUES (
    p_organization_id,
    p_service_type,
    v_window_text,
    v_mean,
    v_std_dev,
    v_sample_size,
    NOW()
  )
  ON CONFLICT (organization_id, service_type, time_window) 
  DO UPDATE SET
    mean_amount = EXCLUDED.mean_amount,
    std_dev = EXCLUDED.std_dev,
    sample_size = EXCLUDED.sample_size,
    calculated_at = EXCLUDED.calculated_at;
END;
$$;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_transaction_stats() CASCADE;

-- Create trigger function
CREATE OR REPLACE FUNCTION update_transaction_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update 24h stats
  PERFORM calculate_transaction_stats(
    NEW.organization_id,
    NEW.service_type,
    interval '1 day'
  );
  
  -- Update 30d stats
  PERFORM calculate_transaction_stats(
    NEW.organization_id,
    NEW.service_type,
    interval '30 days'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER update_transaction_stats_trigger
  AFTER INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_stats();