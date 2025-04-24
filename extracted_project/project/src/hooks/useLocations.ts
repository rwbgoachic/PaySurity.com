import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Database } from '../types/supabase';

type Location = Database['public']['Tables']['locations']['Row'];

export function useLocations(organizationId: string) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchLocations() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name');

      if (error) throw error;

      setLocations(data || []);
    } catch (error) {
      toast.error('Failed to fetch locations');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createLocation(data: {
    name: string;
    address: string;
    organization_id: string;
  }) {
    try {
      const { error } = await supabase.from('locations').insert([data]);

      if (error) throw error;

      toast.success('Location created successfully');
      await fetchLocations();
    } catch (error) {
      toast.error('Failed to create location');
      console.error('Error:', error);
    }
  }

  async function updateLocation(
    id: string,
    data: {
      name: string;
      address: string;
    }
  ) {
    try {
      const { error } = await supabase
        .from('locations')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast.success('Location updated successfully');
      await fetchLocations();
    } catch (error) {
      toast.error('Failed to update location');
      console.error('Error:', error);
    }
  }

  async function deleteLocation(id: string) {
    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);

      if (error) throw error;

      toast.success('Location deleted successfully');
      await fetchLocations();
    } catch (error) {
      toast.error('Failed to delete location');
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    if (organizationId) {
      fetchLocations();
    }
  }, [organizationId]);

  return {
    locations,
    loading,
    createLocation,
    updateLocation,
    deleteLocation,
    refetch: fetchLocations,
  };
}