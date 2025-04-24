import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Database } from '../types/supabase';

type BusinessLine = Database['public']['Tables']['business_lines']['Row'];

export function useBusinessLines() {
  const [businessLines, setBusinessLines] = useState<BusinessLine[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBusinessLines() {
    try {
      const { data, error } = await supabase
        .from('business_lines')
        .select('*')
        .order('name');

      if (error) throw error;

      setBusinessLines(data || []);
    } catch (error) {
      toast.error('Failed to fetch business lines');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBusinessLines();
  }, []);

  return {
    businessLines,
    loading,
    refetch: fetchBusinessLines,
  };
}