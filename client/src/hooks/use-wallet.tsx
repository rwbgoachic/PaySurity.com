import { 
  useQuery, 
  useMutation, 
  UseQueryResult, 
  UseMutationResult 
} from '@tanstack/react-query';
import { getQueryFn, apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

// Types from schema
interface Wallet {
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

interface Transaction {
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

interface BankAccount {
  id: number;
  userId: number;
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  isActive: boolean;
  createdAt: string;
}

interface FundRequest {
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

// Create wallet input type
interface CreateWalletInput {
  balance?: string;
  monthlyLimit?: string;
  dailyLimit?: string;
  weeklyLimit?: string;
  walletType: string;
  isMain?: boolean;
  parentWalletId?: number;
  autoRefill?: boolean;
  refillAmount?: string;
  refillFrequency?: string;
  categoryRestrictions?: string;
  merchantRestrictions?: string;
  requiresApproval?: boolean;
  taxAdvantaged?: boolean;
}

// Create transaction input type
interface CreateTransactionInput {
  walletId: number;
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
  isPersonal?: boolean;
  needsApproval?: boolean;
  approvalStatus?: string;
  receiptImageUrl?: string;
}

// Create bank account input type
interface CreateBankAccountInput {
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  isActive?: boolean;
}

// Create fund request input type
interface CreateFundRequestInput {
  approverId?: number;
  amount: string;
  reason?: string;
  urgency: string;
  status?: string;
}

// Update wallet limits input type
interface UpdateWalletLimitsInput {
  walletId: number;
  dailyLimit?: string;
  weeklyLimit?: string;
  monthlyLimit?: string;
}

export function useWallets(): UseQueryResult<Wallet[], Error> {
  return useQuery({
    queryKey: ['/api/wallets'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useWallet(walletId: number): UseQueryResult<Wallet, Error> {
  return useQuery({
    queryKey: ['/api/wallets', walletId],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!walletId,
  });
}

export function useCreateWallet(): UseMutationResult<Wallet, Error, CreateWalletInput> {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (walletData: CreateWalletInput) => {
      const res = await apiRequest('POST', '/api/wallets', walletData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      toast({
        title: 'Wallet created',
        description: 'Your new wallet has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create wallet',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateWalletLimits(): UseMutationResult<Wallet, Error, UpdateWalletLimitsInput> {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ walletId, ...limitsData }: UpdateWalletLimitsInput) => {
      const res = await apiRequest('PATCH', `/api/wallets/${walletId}/limits`, limitsData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallets', data.id] });
      toast({
        title: 'Wallet limits updated',
        description: 'Your wallet spending limits have been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update wallet limits',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useTransactions(walletId?: number): UseQueryResult<Transaction[], Error> {
  return useQuery({
    queryKey: walletId ? ['/api/transactions', { walletId }] : ['/api/transactions'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateTransaction(): UseMutationResult<Transaction, Error, CreateTransactionInput> {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (transactionData: CreateTransactionInput) => {
      const res = await apiRequest('POST', '/api/transactions', transactionData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallets', data.walletId] });
      toast({
        title: 'Transaction created',
        description: 'Your transaction has been processed successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to process transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useBankAccounts(): UseQueryResult<BankAccount[], Error> {
  return useQuery({
    queryKey: ['/api/bank-accounts'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateBankAccount(): UseMutationResult<BankAccount, Error, CreateBankAccountInput> {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (bankAccountData: CreateBankAccountInput) => {
      const res = await apiRequest('POST', '/api/bank-accounts', bankAccountData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-accounts'] });
      toast({
        title: 'Bank account added',
        description: 'Your bank account has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add bank account',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useFundRequests(): UseQueryResult<FundRequest[], Error> {
  return useQuery({
    queryKey: ['/api/fund-requests'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
}

export function useCreateFundRequest(): UseMutationResult<FundRequest, Error, CreateFundRequestInput> {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (fundRequestData: CreateFundRequestInput) => {
      const res = await apiRequest('POST', '/api/fund-requests', fundRequestData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fund-requests'] });
      toast({
        title: 'Fund request submitted',
        description: 'Your fund request has been submitted for approval.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit fund request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Utility functions for working with wallet data
export const formatCurrency = (amount: string | number | null | undefined): string => {
  if (amount === null || amount === undefined) return '$0.00';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericAmount);
};

export const getTransactionStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getExpenseTypeIcon = (type: string | undefined): string => {
  if (!type) return 'receipt';
  
  switch (type.toLowerCase()) {
    case 'meals':
      return 'utensils';
    case 'transportation':
      return 'car';
    case 'entertainment':
      return 'film';
    case 'office_supplies':
      return 'briefcase';
    case 'marketing':
      return 'megaphone';
    case 'software':
      return 'code';
    case 'hardware':
      return 'server';
    case 'utilities':
      return 'plug';
    case 'rent':
      return 'home';
    case 'salary':
      return 'users';
    case 'taxes':
      return 'file-contract';
    case 'deposit':
      return 'hand-holding-usd';
    case 'allocation':
      return 'exchange-alt';
    case 'transfer':
      return 'exchange';
    case 'personal':
      return 'user';
    default:
      return 'receipt';
  }
};

export function useWebSocketTransactions(walletId?: number) {
  useEffect(() => {
    if (!walletId) return;
    
    // Connect to WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      // Subscribe to wallet channel for real-time updates
      socket.send(JSON.stringify({ 
        type: 'subscribe', 
        channel: `wallet-${walletId}` 
      }));
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'transaction') {
          // Invalidate queries to update UI with new transaction data
          queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
          queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
          queryClient.invalidateQueries({ queryKey: ['/api/wallets', walletId] });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    // Clean up on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          type: 'unsubscribe', 
          channel: `wallet-${walletId}` 
        }));
        socket.close();
      }
    };
  }, [walletId]);
}