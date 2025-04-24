/*
  # Final Launch Requirements

  1. Timezone Support
    - Add timezone handling for offline transactions
    - Store timezone info in transactions table
  
  2. Data Retention
    - Add retention enforcement function
    - Add cleanup function for expired data
*/

-- Add timezone support to transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS local_created_at timestamptz;

-- Function to enforce data retention policies
CREATE OR REPLACE FUNCTION enforce_data_retention()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_policy RECORD;
  v_table_name text;
  v_sql text;
BEGIN
  FOR v_policy IN 
    SELECT * FROM data_retention_policies
    WHERE data_type IN ('transactions', 'audit_logs', 'enhanced_audit_logs')
  LOOP
    v_table_name := v_policy.data_type;
    
    -- Build and execute deletion query
    v_sql := format(
      'DELETE FROM %I WHERE organization_id = %L AND created_at < NOW() - interval %L',
      v_table_name,
      v_policy.organization_id,
      v_policy.retention_period::text
    );
    
    -- Log deletion in audit trail
    INSERT INTO enhanced_audit_logs (
      organization_id,
      action,
      table_name,
      record_id,
      new_data
    ) VALUES (
      v_policy.organization_id,
      'RETENTION_CLEANUP',
      v_table_name,
      v_policy.id,
      jsonb_build_object(
        'retention_period', v_policy.retention_period,
        'cleanup_time', now()
      )
    );
    
    -- Execute cleanup
    EXECUTE v_sql;
  END LOOP;
END;
$$;

-- Function to handle timezone conversion for transactions
CREATE OR REPLACE FUNCTION handle_transaction_timezone()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Set local_created_at based on timezone
  IF NEW.timezone IS NOT NULL THEN
    NEW.local_created_at := NEW.created_at AT TIME ZONE NEW.timezone;
  ELSE
    NEW.local_created_at := NEW.created_at;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for timezone handling
CREATE TRIGGER transaction_timezone_trigger
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_transaction_timezone();

-- Update transaction stats function to use local time
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

  -- Calculate statistics using local_created_at
  SELECT 
    COALESCE(AVG(amount), 0)::decimal(16,4),
    COALESCE(STDDEV(amount), 0)::decimal(16,4),
    COUNT(*)
  INTO v_mean, v_std_dev, v_sample_size
  FROM transactions
  WHERE organization_id = p_organization_id
    AND service_type = p_service_type
    AND local_created_at >= NOW() - p_time_window;

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