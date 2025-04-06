import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { api } from '../services/api';
import { useNavigation } from '@react-navigation/native';

// Types from schema
export interface Wallet {
  id: number;
  userId: number;
  balance: string;
  monthlyLimit?: string;
  dailyLimit?: string;
  weeklyLimit?: string;
  walletType: string;
  isMain: boolean;
  parentWalletId?: number;
  autoRefill: boolean;
  refillAmount?: string;
  refillFrequency?: string;
  categoryRestrictions?: string;
  merchantRestrictions?: string;
  requiresApproval: boolean;
  taxAdvantaged: boolean;
  createdAt: string;
}

export interface Transaction {
  id: number;
  walletId: number;
  userId: number;
  amount: string;
  type: string;
  method: string;
  merchantName?: string;
  merchantPhone?: string;
  merchantCity?: string;
  merchantState?: string;
  merchantCountry?: string;
  sourceOfFunds?: string;
  expenseType?: string;
  isPersonal: boolean;
  needsApproval: boolean;
  approvalStatus: string;
  approvedBy?: number;
  approvalDate?: string;
  rejectionReason?: string;
  receiptImageUrl?: string;
  date: string;
  createdAt: string;
}

export interface BankAccount {
  id: number;
  userId: number;
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  isActive: boolean;
  createdAt: string;
}

export interface FundRequest {
  id: number;
  requesterId: number;
  approverId?: number;
  amount: string;
  reason?: string;
  urgency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Use wallets hook
export const useWallets = () => {
  const [data, setData] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/wallets');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWallets();
  }, []);
  
  return { data, isLoading, error, refetch: fetchWallets };
};

// Use transactions hook
export const useTransactions = (walletId?: number) => {
  const [data, setData] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const url = walletId ? `/api/transactions?walletId=${walletId}` : '/api/transactions';
      const response = await api.get(url);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTransactions();
  }, [walletId]);
  
  return { data, isLoading, error, refetch: fetchTransactions };
};

// Create wallet function
export const createWallet = async (walletData: Partial<Wallet>) => {
  const response = await api.post('/api/wallets', walletData);
  return response.data;
};

// Update wallet function
export const updateWallet = async (walletId: number, walletData: Partial<Wallet>) => {
  const response = await api.patch(`/api/wallets/${walletId}`, walletData);
  return response.data;
};

// Create transaction function
export const createTransaction = async (transactionData: Partial<Transaction>) => {
  const response = await api.post('/api/transactions', transactionData);
  return response.data;
};

// Role-based wallet navigation hook
export const useRoleBasedWallet = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  const navigateToRoleWallet = () => {
    if (!user) return;
    
    switch (user.role) {
      case 'parent':
        // @ts-ignore
        navigation.navigate('ParentWallet');
        break;
      case 'child':
        // @ts-ignore
        navigation.navigate('ChildWallet');
        break;
      case 'employer':
        // @ts-ignore
        navigation.navigate('EmployerWallet');
        break;
      case 'employee':
        // @ts-ignore
        navigation.navigate('EmployeeWallet');
        break;
      default:
        // Fall back to the generic wallet
        // @ts-ignore
        navigation.navigate('WalletDashboard');
    }
  };
  
  return { navigateToRoleWallet, userRole: user?.role };
};

// Format currency utility
export const formatCurrency = (amount: string | number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericAmount);
};

// Get transaction icon based on type
export const getTransactionIcon = (type: string): string => {
  switch (type) {
    case 'incoming':
      return 'cash-plus';
    case 'outgoing':
      return 'cash-minus';
    default:
      return 'cash';
  }
};

// Get transaction method icon
export const getMethodIcon = (method: string): string => {
  switch (method) {
    case 'wallet':
      return 'wallet';
    case 'credit_card':
      return 'credit-card';
    case 'ach':
      return 'bank';
    case 'wire':
      return 'bank-transfer';
    default:
      return 'cash';
  }
};