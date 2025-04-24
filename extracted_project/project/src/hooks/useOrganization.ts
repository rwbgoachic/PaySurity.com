import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface Organization {
  id: string;
  name: string;
  business_line_id: string | null;
  subdomain: string | null;
  created_at: string | null;
  updated_at: string | null;
  service_data: any;
  service_config: any;
  cashflow_threshold: string | null;
  alert_email: string | null;
  alert_threshold: string | null;
  business_line?: {
    id: string;
    name: string;
    service_type: string;
  };
}

export function useOrganization(organizationId?: string) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrganization();
    }
  }, [user, organizationId]);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('organizations')
        .select(`
          *,
          business_line:business_lines(*)
        `);
      
      if (organizationId) {
        query = query.eq('id', organizationId);
      } else {
        // Get the first organization the user belongs to
        const { data: orgUsers } = await supabase
          .from('organization_users')
          .select('organization_id')
          .eq('user_id', user?.id)
          .limit(1);
        
        if (orgUsers && orgUsers.length > 0) {
          query = query.eq('id', orgUsers[0].organization_id);
        }
      }
      
      const { data, error } = await query.single();

      if (error) throw error;
      setOrganization(data);
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    try {
      if (!organization) return;
      
      const { data, error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', organization.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setOrganization(data);
      toast.success('Organization updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error('Failed to update organization');
      throw error;
    }
  };

  return {
    organization,
    loading,
    updateOrganization,
    refetch: fetchOrganization,
  };
}