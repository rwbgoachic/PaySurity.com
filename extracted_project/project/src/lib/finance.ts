import { supabase } from './supabase';
import Decimal from 'decimal.js';

// Configure Decimal.js for 4 decimal places
Decimal.set({ precision: 20, rounding: 4 });

export interface CashflowData {
  incomingPayments: Decimal;
  outgoingPayments: Decimal;
  fees: Decimal;
  balance: Decimal;
  projectedBalance: Decimal;
  threshold: Decimal;
}

export class CashflowManager {
  static calculateThreshold(monthlyPayouts: number, monthlyFees: number): Decimal {
    // Default threshold: 3 days of operational buffer
    const dailyOperations = new Decimal(monthlyPayouts)
      .plus(monthlyFees)
      .dividedBy(30);
    
    return dailyOperations.times(3).toDecimalPlaces(4);
  }

  static async getCashflowData(organizationId: string): Promise<CashflowData> {
    try {
      // Get organization settings
      const { data: org } = await supabase
        .from('organizations')
        .select('cashflow_threshold')
        .eq('id', organizationId)
        .single();

      // Get transaction stats
      const { data: stats } = await supabase
        .from('transaction_stats')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('time_window', '30d');

      // Calculate incoming and outgoing
      let incoming = new Decimal(0);
      let outgoing = new Decimal(0);
      
      if (stats) {
        stats.forEach(stat => {
          const amount = new Decimal(stat.mean_amount).times(stat.sample_size);
          if (['pos', 'invoice'].includes(stat.service_type)) {
            incoming = incoming.plus(amount);
          } else if (['payroll', 'subscription'].includes(stat.service_type)) {
            outgoing = outgoing.plus(amount);
          }
        });
      }

      // Estimate fees (2.5% of incoming)
      const fees = incoming.times(0.025).toDecimalPlaces(4);
      
      // Calculate balance
      const balance = incoming.minus(outgoing).minus(fees).toDecimalPlaces(4);
      
      // Calculate projected balance (7-day projection)
      const dailyNet = incoming.minus(outgoing).minus(fees).dividedBy(30);
      const projectedBalance = balance.plus(dailyNet.times(7)).toDecimalPlaces(4);
      
      // Use organization threshold or calculate default
      const threshold = org?.cashflow_threshold 
        ? new Decimal(org.cashflow_threshold)
        : this.calculateThreshold(outgoing.toNumber(), fees.toNumber());

      return {
        incomingPayments: incoming,
        outgoingPayments: outgoing,
        fees,
        balance,
        projectedBalance,
        threshold,
      };
    } catch (error) {
      console.error('Error calculating cashflow:', error);
      throw error;
    }
  }

  static async checkCashflowThreshold(
    organizationId: string,
    currentValue: Decimal,
    threshold: Decimal
  ): Promise<void> {
    if (currentValue.lessThan(threshold)) {
      try {
        const { error } = await supabase
          .from('cashflow_alerts')
          .insert({
            organization_id: organizationId,
            alert_type: 'THRESHOLD_BREACH',
            threshold: threshold.toFixed(4),
            current_value: currentValue.toFixed(4),
          })
          .select()
          .single();

        if (error) throw error;

        // Get organization settings for email notification
        const { data: org } = await supabase
          .from('organizations')
          .select('alert_email')
          .eq('id', organizationId)
          .single();

        if (org?.alert_email) {
          // Log alert notification
          await supabase.from('service_logs').insert({
            organization_id: organizationId,
            service_type: 'cashflow',
            event_type: 'ALERT_TRIGGERED',
            event_data: {
              threshold: threshold.toFixed(4),
              current_value: currentValue.toFixed(4),
              recipient: org.alert_email
            }
          });
        }
      } catch (error) {
        console.error('Error creating cashflow alert:', error);
      }
    }
  }
}