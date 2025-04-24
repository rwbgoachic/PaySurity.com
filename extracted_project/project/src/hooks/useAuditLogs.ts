import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Database } from '../types/supabase';

type AuditLog = Database['public']['Tables']['audit_logs']['Row'];

export function useAuditLogs(organizationId?: string) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAuditLogs() {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*, user:auth.users(email)')
        .order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setAuditLogs(data || []);
    } catch (error) {
      toast.error('Failed to fetch audit logs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAuditLogs();
  }, [organizationId]);

  return {
    auditLogs,
    loading,
    refetch: fetchAuditLogs,
  };
}