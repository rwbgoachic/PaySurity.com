import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if a user exists
export async function checkUserExists(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}

// Helper function to create a new organization
export async function createOrganization(data: {
  name: string;
  business_line_id: string;
  subdomain: string;
  user_id: string;
}) {
  const { data: org, error } = await supabase
    .from('organizations')
    .insert([data])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return org;
}

// Helper function to create organization user
export async function createOrganizationUser(data: {
  user_id: string;
  organization_id: string;
  role_id: string;
}) {
  const { error } = await supabase
    .from('organization_users')
    .insert([data]);

  if (error) {
    throw error;
  }
}

// Helper function to get user's organizations
export async function getUserOrganizations(userId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      *,
      business_line:business_lines(*),
      locations(*)
    `)
    .eq('global_user_id', userId);

  if (error) {
    throw error;
  }

  return data;
}

// Helper function to archive organization
export async function archiveOrganization(organizationId: string) {
  const { error } = await supabase
    .from('organizations')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', organizationId);

  if (error) {
    throw error;
  }
}