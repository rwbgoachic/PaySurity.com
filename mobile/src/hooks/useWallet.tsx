import React, { useState, useContext, createContext, useCallback } from 'react';
import { Alert } from 'react-native';
import useApi from './useApi';
import { useNavigation } from '@react-navigation/native';

// Types
export type WalletRole = 'parent' | 'child' | 'employer' | 'employee';

export type WalletStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type AllowanceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'transfer' 
  | 'payment' 
  | 'allowance' 
  | 'payroll';

export type TransactionStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type RequestStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled';

export type SavingsGoalStatus = 
  | 'active' 
  | 'completed' 
  | 'cancelled';

export interface WalletInfo {
  id: number;
  userId: number;
  role: WalletRole;
  status: WalletStatus;
  balance: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  
  // Parent/Child specific
  parentId?: number;
  allowance?: string;
  allowanceFrequency?: AllowanceFrequency;
  nextAllowanceDate?: string;
  
  // Employer/Employee specific
  employerId?: number;
  payFrequency?: 'weekly' | 'biweekly' | 'monthly';
  nextPayDate?: string;
  payrollId?: number;
}

export interface Transaction {
  id: number;
  walletId: number;
  toWalletId?: number;
  fromWalletId?: number;
  type: TransactionType;
  status: TransactionStatus;
  amount: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  metadata?: any;
}

export interface SavingsGoal {
  id: number;
  walletId: number;
  name: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  status: SavingsGoalStatus;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  iconName?: string;
  metadata?: any;
}

export interface FundRequest {
  id: number;
  requesterId: number;
  requesteeId: number;
  amount: string;
  reason: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  rejectionReason?: string;
  metadata?: any;
}

// Context interface
interface WalletContextType {
  currentWallet: WalletInfo | null;
  setCurrentWallet: (wallet: WalletInfo | null) => void;
  loading: boolean;
  error: Error | null;
  getWalletInfo: () => Promise<WalletInfo>;
  getTransactions: () => Promise<Transaction[]>;
  getSavingsGoals: () => Promise<SavingsGoal[]>;
  createTransaction: (data: Partial<Transaction>) => Promise<Transaction>;
  createSavingsGoal: (data: Partial<SavingsGoal>) => Promise<SavingsGoal>;
  updateSavingsGoal: (goalId: number, data: Partial<SavingsGoal>) => Promise<SavingsGoal>;
  requestFunds: (amount: string, reason: string, targetUserId: number) => Promise<FundRequest>;
  approveFundRequest: (requestId: number) => Promise<Transaction>;
  rejectFundRequest: (requestId: number, reason?: string) => Promise<FundRequest>;
  transferToSavingsGoal: (goalId: number, amount: string) => Promise<{transaction: Transaction, goal: SavingsGoal}>;
  formatCurrency: (amount: string | number) => string;
  navigateToWallet: (role: WalletRole) => void;
  handleError: (error: any, message?: string) => void;
}

// Create the context
const WalletContext = createContext<WalletContextType | null>(null);

// Provider component
export const WalletProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { loading, error, get, post, put, patch, delete: del } = useApi();
  const [currentWallet, setCurrentWallet] = useState<WalletInfo | null>(null);
  const navigation = useNavigation();
  
  // Helper function to format currency
  const formatCurrency = useCallback((amount: string | number): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numericAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  }, []);
  
  // Helper function to handle errors
  const handleError = useCallback((error: any, message?: string) => {
    console.error(error);
    Alert.alert(
      'Error',
      message || 'Something went wrong. Please try again.',
      [{ text: 'OK' }]
    );
  }, []);
  
  // Function to get wallet info
  const getWalletInfo = useCallback(async (): Promise<WalletInfo> => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll return mock data
      const mockWalletInfo: WalletInfo = {
        id: 1,
        userId: 123,
        role: 'parent', // This would come from the API
        status: 'active',
        balance: '1250.75',
        name: 'John Doe',
        email: 'john@example.com',
        phoneNumber: '555-1234',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setCurrentWallet(mockWalletInfo);
      return mockWalletInfo;
    } catch (error) {
      handleError(error, 'Failed to load wallet information');
      throw error;
    }
  }, [handleError]);
  
  // Function to get transactions
  const getTransactions = useCallback(async (): Promise<Transaction[]> => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll return mock data
      const mockTransactions: Transaction[] = [
        {
          id: 1,
          walletId: currentWallet?.id || 1,
          type: 'deposit',
          status: 'completed',
          amount: '500.00',
          description: 'Initial deposit',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          walletId: currentWallet?.id || 1,
          type: 'withdrawal',
          status: 'completed',
          amount: '150.00',
          description: 'ATM withdrawal',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          walletId: currentWallet?.id || 1,
          toWalletId: 101, // Child's wallet
          type: 'transfer',
          status: 'completed',
          amount: '50.00',
          description: 'Weekly allowance to Emma',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 4,
          walletId: currentWallet?.id || 1,
          type: 'payment',
          status: 'completed',
          amount: '75.25',
          description: 'Grocery shopping',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 5,
          walletId: currentWallet?.id || 1,
          toWalletId: 102, // Child's wallet
          type: 'transfer',
          status: 'completed',
          amount: '40.00',
          description: 'Weekly allowance to Jacob',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      return mockTransactions;
    } catch (error) {
      handleError(error, 'Failed to load transactions');
      throw error;
    }
  }, [currentWallet, handleError]);
  
  // Function to get savings goals
  const getSavingsGoals = useCallback(async (): Promise<SavingsGoal[]> => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll return mock data
      const mockSavingsGoals: SavingsGoal[] = [
        {
          id: 1,
          walletId: currentWallet?.id || 1,
          name: 'Vacation Fund',
          description: 'Saving for summer vacation',
          targetAmount: '1500.00',
          currentAmount: '750.00',
          status: 'active',
          deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          iconName: 'beach',
        },
        {
          id: 2,
          walletId: currentWallet?.id || 1,
          name: 'New Laptop',
          description: 'Saving for a new laptop',
          targetAmount: '1200.00',
          currentAmount: '300.00',
          status: 'active',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          iconName: 'laptop',
        },
      ];
      
      return mockSavingsGoals;
    } catch (error) {
      handleError(error, 'Failed to load savings goals');
      throw error;
    }
  }, [currentWallet, handleError]);
  
  // Function to create a transaction
  const createTransaction = useCallback(async (data: Partial<Transaction>): Promise<Transaction> => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll return mock data
      const mockTransaction: Transaction = {
        id: 100, // Would be assigned by the server
        walletId: currentWallet?.id || 1,
        toWalletId: data.toWalletId,
        fromWalletId: data.fromWalletId,
        type: data.type || 'transfer',
        status: 'completed',
        amount: data.amount || '0.00',
        description: data.description || 'Transaction',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      
      return mockTransaction;
    } catch (error) {
      handleError(error, 'Failed to create transaction');
      throw error;
    }
  }, [currentWallet, handleError]);
  
  // Function to create a savings goal
  const createSavingsGoal = useCallback(async (data: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll return mock data
      const mockSavingsGoal: SavingsGoal = {
        id: 100, // Would be assigned by the server
        walletId: currentWallet?.id || 1,
        name: data.name || 'New Goal',
        description: data.description || '',
        targetAmount: data.targetAmount || '0.00',
        currentAmount: data.currentAmount || '0.00',
        status: 'active',
        deadline: data.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        iconName: data.iconName,
      };
      
      return mockSavingsGoal;
    } catch (error) {
      handleError(error, 'Failed to create savings goal');
      throw error;
    }
  }, [currentWallet, handleError]);
  
  // Function to update a savings goal
  const updateSavingsGoal = useCallback(async (goalId: number, data: Partial<SavingsGoal>): Promise<SavingsGoal> => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll return mock data
      const mockSavingsGoal: SavingsGoal = {
        id: goalId,
        walletId: currentWallet?.id || 1,
        name: data.name || 'Updated Goal',
        description: data.description || '',
        targetAmount: data.targetAmount || '1000.00',
        currentAmount: data.currentAmount || '500.00',
        status: data.status || 'active',
        deadline: data.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        iconName: data.iconName,
      };
      
      return mockSavingsGoal;
    } catch (error) {
      handleError(error, 'Failed to update savings goal');
      throw error;
    }
  }, [currentWallet, handleError]);
  
  // Function to request funds
  const requestFunds = useCallback(async (amount: string, reason: string, targetUserId: number): Promise<FundRequest> => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll return mock data
      const mockFundRequest: FundRequest = {
        id: 100, // Would be assigned by the server
        requesterId: currentWallet?.userId || 0,
        requesteeId: targetUserId,
        amount: amount,
        reason: reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return mockFundRequest;
    } catch (error) {
      handleError(error, 'Failed to request funds');
      throw error;
    }
  }, [currentWallet, handleError]);
  
  // Function to approve a fund request
  const approveFundRequest = useCallback(async (requestId: number): Promise<Transaction> => {
    try {
      // In a real app, this would call the API to approve the request
      // and create a transaction
      // For demo purposes, we'll return mock data
      const mockTransaction: Transaction = {
        id: 100, // Would be assigned by the server
        walletId: currentWallet?.id || 1,
        toWalletId: 101, // The requester's wallet
        type: 'transfer',
        status: 'completed',
        amount: '25.00', // This would come from the request
        description: 'Approved fund request',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };
      
      return mockTransaction;
    } catch (error) {
      handleError(error, 'Failed to approve fund request');
      throw error;
    }
  }, [currentWallet, handleError]);
  
  // Function to reject a fund request
  const rejectFundRequest = useCallback(async (requestId: number, reason?: string): Promise<FundRequest> => {
    try {
      // In a real app, this would call the API
      // For demo purposes, we'll return mock data
      const mockFundRequest: FundRequest = {
        id: requestId,
        requesterId: 101, // Child's userId
        requesteeId: currentWallet?.userId || 0,
        amount: '25.00',
        reason: 'School supplies',
        status: 'rejected',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'Request denied',
      };
      
      return mockFundRequest;
    } catch (error) {
      handleError(error, 'Failed to reject fund request');
      throw error;
    }
  }, [currentWallet, handleError]);
  
  // Function to transfer funds to a savings goal
  const transferToSavingsGoal = useCallback(async (goalId: number, amount: string): Promise<{transaction: Transaction, goal: SavingsGoal}> => {
    try {
      // In a real app, this would call the API to create a transaction
      // and update the savings goal
      // For demo purposes, we'll return mock data
      const mockTransaction: Transaction = {
        id: 100, // Would be assigned by the server
        walletId: currentWallet?.id || 1,
        type: 'transfer',
        status: 'completed',
        amount: amount,
        description: 'Transfer to savings goal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        metadata: { goalId },
      };
      
      const mockSavingsGoal: SavingsGoal = {
        id: goalId,
        walletId: currentWallet?.id || 1,
        name: 'Savings Goal',
        description: 'Updated savings goal',
        targetAmount: '1000.00',
        currentAmount: '500.00', // This would be updated based on the amount
        status: 'active',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return { transaction: mockTransaction, goal: mockSavingsGoal };
    } catch (error) {
      handleError(error, 'Failed to transfer funds to savings goal');
      throw error;
    }
  }, [currentWallet, handleError]);
  
  // Function to navigate to a specific wallet type
  const navigateToWallet = useCallback((role: WalletRole) => {
    switch (role) {
      case 'parent':
        navigation.navigate('ParentWalletScreen' as never);
        break;
      case 'child':
        navigation.navigate('ChildWalletScreen' as never);
        break;
      case 'employer':
        navigation.navigate('EmployerWalletScreen' as never);
        break;
      case 'employee':
        navigation.navigate('EmployeeWalletScreen' as never);
        break;
      default:
        navigation.navigate('WalletRouter' as never);
        break;
    }
  }, [navigation]);
  
  return (
    <WalletContext.Provider
      value={{
        currentWallet,
        setCurrentWallet,
        loading,
        error,
        getWalletInfo,
        getTransactions,
        getSavingsGoals,
        createTransaction,
        createSavingsGoal,
        updateSavingsGoal,
        requestFunds,
        approveFundRequest,
        rejectFundRequest,
        transferToSavingsGoal,
        formatCurrency,
        navigateToWallet,
        handleError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default useWallet;