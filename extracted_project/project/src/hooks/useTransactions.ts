import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { FraudDetection } from '../lib/fraud';
import Decimal from 'decimal.js';

export interface Transaction {
  id: string;
  organization_id: string;
  service_type: string;
  amount: string;
  created_at: string;
}

export interface TransactionStats {
  id: string;
  organization_id: string;
  service_type: string;
  time_window: string;
  mean_amount: string;
  std_dev: string;
  sample_size: number;
  calculated_at: string;
}

export function useTransactions(organizationId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organizationId) {
      fetchTransactions();
      fetchStats();
    }
  }, [organizationId]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('transaction_stats')
        .select('*')
        .eq('organization_id', organizationId)
        .order('time_window', { ascending: true });

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
    }
  };

  const createTransaction = async (data: {
    service_type: string;
    amount: number | string;
  }) => {
    try {
      // Convert amount to Decimal to ensure precision
      const amount = new Decimal(data.amount).toFixed(4);
      
      // Create transaction
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          organization_id: organizationId,
          service_type: data.service_type,
          amount,
        })
        .select()
        .single();

      if (error) throw error;

      // Check for fraud
      if (transaction) {
        const transactionData = {
          id: transaction.id,
          amount: new Decimal(transaction.amount),
          organizationId: transaction.organization_id,
          serviceType: transaction.service_type,
          createdAt: new Date(transaction.created_at),
        };

        const isAnomalous = await FraudDetection.detectAnomalies(transactionData);
        
        if (isAnomalous) {
          await FraudDetection.flagTransaction(
            transaction.id,
            'Amount significantly deviates from historical patterns'
          );
          toast.warning('Transaction flagged for review due to unusual amount');
        }
      }

      toast.success('Transaction recorded successfully');
      fetchTransactions();
      fetchStats();
      
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to record transaction');
      throw error;
    }
  };

  return {
    transactions,
    stats,
    loading,
    createTransaction,
    refetch: fetchTransactions,
  };
}