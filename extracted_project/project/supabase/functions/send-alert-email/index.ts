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

    const { email, data } = await req.json();

    if (!email || !data) {
      throw new Error('Missing required parameters');
    }

    // In a real implementation, you would send an actual email here
    // For this example, we'll just log the alert to the service_logs table
    
    // Get the user making the request
    const { data: { user } } = await supabase.auth.getUser();

    // Find the organization associated with the email
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .eq('alert_email', email)
      .limit(1);

    const organizationId = orgs && orgs.length > 0 ? orgs[0].id : null;

    if (organizationId) {
      // Log the alert
      await supabase.from('service_logs').insert({
        organization_id: organizationId,
        service_type: 'alerts',
        event_type: `${data.type}_ALERT_EMAIL_SENT`,
        event_data: data,
        user_id: user?.id,
      });
    }

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
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});