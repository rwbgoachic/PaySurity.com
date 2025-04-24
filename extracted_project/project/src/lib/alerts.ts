import { supabase } from './supabase';
import Decimal from 'decimal.js';

export interface CashflowAlert {
  id: string;
  organizationId: string;
  alertType: string;
  threshold: Decimal;
  currentValue: Decimal;
  triggeredAt: Date;
  resolvedAt?: Date;
}

export interface FraudAlert {
  id: string;
  organizationId: string;
  transactionId: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export class AlertManager {
  static async checkCashflowThreshold(
    organizationId: string,
    currentValue: Decimal,
    threshold: Decimal
  ): Promise<void> {
    if (currentValue.lessThan(threshold)) {
      await supabase.from('cashflow_alerts').insert({
        organization_id: organizationId,
        alert_type: 'THRESHOLD_BREACH',
        threshold: threshold.toFixed(4),
        current_value: currentValue.toFixed(4),
      });

      // Get organization settings for email notification
      const { data: org } = await supabase
        .from('organizations')
        .select('alert_email')
        .eq('id', organizationId)
        .single();

      if (org?.alert_email) {
        await this.sendAlertEmail(org.alert_email, {
          type: 'CASHFLOW',
          threshold: threshold.toFixed(4),
          currentValue: currentValue.toFixed(4),
        });
      }
    }
  }

  static async flagFraudulentTransaction(
    organizationId: string,
    transactionId: string,
    reason: string
  ): Promise<void> {
    await supabase.from('fraud_alerts').insert({
      organization_id: organizationId,
      transaction_id: transactionId,
      reason,
    });

    // Get organization settings for email notification
    const { data: org } = await supabase
      .from('organizations')
      .select('alert_email')
      .eq('id', organizationId)
      .single();

    if (org?.alert_email) {
      await this.sendAlertEmail(org.alert_email, {
        type: 'FRAUD',
        transactionId,
        reason,
      });
    }
  }

  private static async sendAlertEmail(
    email: string,
    data: { type: string; [key: string]: string }
  ): Promise<void> {
    await supabase.functions.invoke('send-alert-email', {
      body: { email, data },
    });
  }
}