import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  email: string;
  role: string;
  organizations: {
    id: string;
    name: string;
  }[];
}

export function useUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    try {
      const { data: organizationUsers, error: ouError } = await supabase
        .from('organization_users')
        .select(`
          user_id,
          organization:organizations(id, name),
          role:roles(name)
        `);

      if (ouError) throw ouError;

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const usersWithRoles = authUsers.users.map(user => ({
        id: user.id,
        email: user.email || '',
        role: organizationUsers?.find(ou => ou.user_id === user.id)?.role?.name || 'No Role',
        organizations: organizationUsers
          ?.filter(ou => ou.user_id === user.id)
          .map(ou => ou.organization) || []
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function inviteUser(data: {
    email: string;
    role: string;
    organizationId: string;
  }) {
    try {
      // First, create the user in Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.email,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Then, get the role ID
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', data.role)
        .single();

      if (roleError) throw roleError;

      // Finally, create the organization user
      const { error: ouError } = await supabase.from('organization_users').insert([
        {
          user_id: authData.user.id,
          organization_id: data.organizationId,
          role_id: roleData.id,
        },
      ]);

      if (ouError) throw ouError;

      toast.success('User invited successfully');
      await fetchUsers();
    } catch (error) {
      toast.error('Failed to invite user');
      console.error('Error:', error);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    inviteUser,
    refetch: fetchUsers,
  };
}