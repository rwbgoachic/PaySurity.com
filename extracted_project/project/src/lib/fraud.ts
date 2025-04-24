import Decimal from 'decimal.js';
import { supabase } from './supabase';

export interface TransactionData {
  id: string;
  amount: Decimal;
  organizationId: string;
  serviceType: string;
  createdAt: Date;
}

export class FraudDetection {
  private static readonly ANOMALY_THRESHOLD = 3; // Standard deviations
  private static readonly TIME_WINDOW = 30; // Days for rolling average

  static async detectAnomalies(transaction: TransactionData): Promise<boolean> {
    try {
      // Get historical transactions for the organization and service
      const { data: stats } = await supabase
        .from('transaction_stats')
        .select('mean_amount, std_dev')
        .eq('organization_id', transaction.organizationId)
        .eq('service_type', transaction.serviceType)
        .eq('time_window', '30d')
        .single();

      if (!stats) return false;

      // Calculate z-score
      const mean = new Decimal(stats.mean_amount);
      const stdDev = new Decimal(stats.std_dev);
      
      // Skip if stdDev is zero to avoid division by zero
      if (stdDev.isZero()) return false;
      
      const transactionAmount = transaction.amount;
      const zScore = transactionAmount.minus(mean).dividedBy(stdDev).abs();

      return zScore.greaterThan(this.ANOMALY_THRESHOLD);
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return false;
    }
  }

  static async flagTransaction(transactionId: string, reason: string): Promise<void> {
    try {
      // Get organization ID from transaction
      const { data: transaction } = await supabase
        .from('transactions')
        .select('organization_id')
        .eq('id', transactionId)
        .single();

      if (!transaction) throw new Error('Transaction not found');

      // Create fraud alert
      await supabase.from('fraud_alerts').insert({
        transaction_id: transactionId,
        organization_id: transaction.organization_id,
        reason,
      });
    } catch (error) {
      console.error('Error flagging transaction:', error);
    }
  }
}