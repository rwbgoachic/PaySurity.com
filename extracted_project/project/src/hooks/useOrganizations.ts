import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Database } from '../types/supabase';

type Organization = Database['public']['Tables']['organizations']['Row'] & {
  business_line: Database['public']['Tables']['business_lines']['Row'];
  locations: Database['public']['Tables']['locations']['Row'][];
};

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrganizations() {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          business_line:business_lines(*),
          locations(*)
        `);

      if (error) throw error;

      setOrganizations(data || []);
    } catch (error) {
      toast.error('Failed to fetch organizations');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createOrganization(data: {
    name: string;
    business_line_id: string;
    subdomain: string;
  }) {
    try {
      const { error } = await supabase.from('organizations').insert([data]);

      if (error) throw error;

      toast.success('Organization created successfully');
      await fetchOrganizations();
    } catch (error) {
      toast.error('Failed to create organization');
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    fetchOrganizations();
  }, []);

  return {
    organizations,
    loading,
    createOrganization,
    refetch: fetchOrganizations,
  };
}