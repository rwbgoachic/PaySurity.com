import { serve } from "npm:@supabase/functions-js";
import { createClient } from "npm:@supabase/supabase-js";
import Decimal from "npm:decimal.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    // Get organizations to monitor
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, cashflow_threshold, alert_threshold, alert_email')
      .is('archived_at', null);

    if (orgsError) throw orgsError;

    const alerts = [];

    for (const org of orgs || []) {
      // Skip if no thresholds are set
      if (!org.cashflow_threshold && !org.alert_threshold) continue;

      // Check cashflow
      if (org.cashflow_threshold) {
        const { data: cashflow } = await supabase
          .from('transaction_stats')
          .select('mean_amount')
          .eq('organization_id', org.id)
          .eq('time_window', '24h')
          .single();

        if (cashflow) {
          const currentValue = new Decimal(cashflow.mean_amount);
          const threshold = new Decimal(org.cashflow_threshold);

          if (currentValue.lessThan(threshold)) {
            // Create cashflow alert
            const { data: alertData, error: alertError } = await supabase
              .from('cashflow_alerts')
              .insert({
                organization_id: org.id,
                alert_type: 'LOW_BALANCE',
                threshold: threshold.toFixed(4),
                current_value: currentValue.toFixed(4),
              })
              .select()
              .single();

            if (!alertError && alertData) {
              alerts.push({
                type: 'cashflow',
                organization_id: org.id,
                alert: alertData
              });
            }
          }
        }
      }

      // Check for fraud
      const { data: stats } = await supabase
        .from('transaction_stats')
        .select('mean_amount, std_dev')
        .eq('organization_id', org.id)
        .eq('time_window', '30d')
        .single();

      if (stats && stats.std_dev > 0) {
        const { data: recentTx } = await supabase
          .from('transactions')
          .select('id, amount')
          .eq('organization_id', org.id)
          .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        if (recentTx && recentTx.length > 0) {
          for (const tx of recentTx) {
            const amount = new Decimal(tx.amount);
            const mean = new Decimal(stats.mean_amount);
            const stdDev = new Decimal(stats.std_dev);
            
            // Skip if stdDev is zero to avoid division by zero
            if (stdDev.isZero()) continue;
            
            const zScore = amount.minus(mean).dividedBy(stdDev).abs();

            // Alert if transaction is more than 3 standard deviations from the mean
            if (zScore.greaterThan(3)) {
              const { data: fraudAlert, error: fraudError } = await supabase
                .from('fraud_alerts')
                .insert({
                  organization_id: org.id,
                  transaction_id: tx.id,
                  reason: `Amount exceeds 3σ threshold (z-score: ${zScore.toFixed(4)})`,
                })
                .select()
                .single();

              if (!fraudError && fraudAlert) {
                alerts.push({
                  type: 'fraud',
                  organization_id: org.id,
                  alert: fraudAlert
                });
              }
            }
          }
        }
      }
    }

    // Send email notifications for alerts if needed
    if (alerts.length > 0) {
      for (const alert of alerts) {
        const { data: org } = await supabase
          .from('organizations')
          .select('name, alert_email')
          .eq('id', alert.organization_id)
          .single();

        if (org && org.alert_email) {
          // Log the alert notification
          await supabase.from('service_logs').insert({
            organization_id: alert.organization_id,
            service_type: 'risk-monitor',
            event_type: `${alert.type.toUpperCase()}_ALERT_SENT`,
            event_data: { alert: alert.alert, recipient: org.alert_email }
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        alerts_generated: alerts.length
      }),
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
      JSON.stringify({ error: 'Failed to process risk monitoring' }),
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