import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { organization_id, service_type, action } = await req.json();

    // Verify user has admin access
    const { data: userAccess, error: accessError } = await supabase
      .from('organization_users')
      .select('*, roles!inner(*)')
      .eq('organization_id', organization_id)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (accessError || !userAccess?.roles?.permissions?.all) {
      throw new Error('Unauthorized');
    }

    let result;
    
    switch (action) {
      case 'enable':
        result = await supabase
          .from('service_access')
          .upsert({
            organization_id,
            service_type,
            enabled: true,
            updated_at: new Date().toISOString(),
          });
        break;
        
      case 'disable':
        result = await supabase
          .from('service_access')
          .upsert({
            organization_id,
            service_type,
            enabled: false,
            updated_at: new Date().toISOString(),
          });
        break;
        
      default:
        throw new Error('Invalid action');
    }

    if (result.error) throw result.error;

    // Log the action
    await supabase.from('service_logs').insert({
      organization_id,
      service_type,
      event_type: action.toUpperCase(),
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === 'Unauthorized' ? 403 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});