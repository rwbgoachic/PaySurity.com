import React, { createContext, useState, useContext, useCallback, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import useApi from './useApi';
import { useNavigation } from '@react-navigation/native';

// Transaction types
export type TransactionType = 
  | 'deposit' 
  | 'withdrawal' 
  | 'transfer' 
  | 'payment' 
  | 'payment_received' 
  | 'expense_reimbursement' 
  | 'payroll'
  | 'allowance'
  | 'reward';

// Transaction status
export type TransactionStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'canceled';

// Transaction model
export interface Transaction {
  id: number;
  type: TransactionType;
  amount: string;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  fromWalletId?: number;
  toWalletId?: number;
  metadata?: any;
}

// Wallet model
export interface Wallet {
  id: number;
  userId: number;
  name: string;
  type: 'parent' | 'child' | 'employer' | 'employee';
  balance: string;
  currency: string;
  status: 'active' | 'inactive' | 'frozen';
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

// Family connection model (parent-child relationship)
export interface FamilyConnection {
  id: number;
  parentWalletId: number;
  childWalletId: number;
  status: 'active' | 'pending' | 'inactive';
  allowanceAmount?: string;
  allowanceFrequency?: 'weekly' | 'biweekly' | 'monthly';
  allowanceNextDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Business connection model (employer-employee relationship)
export interface BusinessConnection {
  id: number;
  employerWalletId: number;
  employeeWalletId: number;
  status: 'active' | 'pending' | 'inactive';
  salaryAmount?: string;
  salaryFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'hourly';
  salaryNextDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Savings goal model for child wallet
export interface SavingsGoal {
  id: number;
  walletId: number;
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline?: string;
  status: 'active' | 'completed' | 'canceled';
  createdAt: string;
  updatedAt: string;
  metadata?: any;
}

// Task model for child wallet
export interface ChildTask {
  id: number;
  walletId: number;
  name: string;
  description: string;
  reward: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  dueDate?: string;
  completedDate?: string;
  approvedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Payroll model for employer wallet
export interface Payroll {
  id: number;
  employerWalletId: number;
  totalAmount: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed';
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

// Payslip model for employee wallet
export interface Payslip {
  id: number;
  employeeWalletId: number;
  payrollId: number;
  grossAmount: string;
  netAmount: string;
  deductions: string;
  taxes: string;
  hoursWorked?: string;
  rate?: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// Expense report model for employee wallet
export interface ExpenseReport {
  id: number;
  employeeWalletId: number;
  employerWalletId: number;
  totalAmount: string;
  description: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submittedDate?: string;
  processedDate?: string;
  createdAt: string;
  updatedAt: string;
  items: ExpenseItem[];
}

// Expense item model
export interface ExpenseItem {
  id: number;
  expenseReportId: number;
  amount: string;
  category: string;
  description: string;
  date: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Time entry model for employee wallet
export interface TimeEntry {
  id: number;
  employeeWalletId: number;
  employerWalletId: number;
  date: string;
  hoursWorked: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  processedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Time off request model for employee wallet
export interface TimeOffRequest {
  id: number;
  employeeWalletId: number;
  employerWalletId: number;
  startDate: string;
  endDate: string;
  reason: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  processedDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Context interface
export interface WalletContextProps {
  currentWallet: Wallet | null;
  loading: boolean;
  error: string | null;
  setWalletType: (type: 'parent' | 'child' | 'employer' | 'employee') => Promise<Wallet>;
  getCurrentWalletInfo: () => Promise<Wallet | null>;
  getTransactions: (options?: { limit?: number; offset?: number; type?: TransactionType }) => Promise<Transaction[]>;
  getTransaction: (id: number) => Promise<Transaction>;
  sendMoney: (toWalletId: number, amount: string, description: string) => Promise<Transaction>;
  requestMoney: (fromWalletId: number, amount: string, description: string) => Promise<Transaction>;
  depositFunds: (amount: string, paymentMethodId: number, description: string) => Promise<Transaction>;
  withdrawFunds: (amount: string, bankAccountId: number, description: string) => Promise<Transaction>;
  getFamilyConnections: () => Promise<FamilyConnection[]>;
  getBusinessConnections: () => Promise<BusinessConnection[]>;
  addChild: (email: string, name: string) => Promise<FamilyConnection>;
  addEmployee: (email: string, name: string, role: string) => Promise<BusinessConnection>;
  formatCurrency: (amount: string) => string;
  
  // Child wallet specific methods
  getSavingsGoals?: () => Promise<SavingsGoal[]>;
  createSavingsGoal?: (name: string, targetAmount: string, deadline?: string) => Promise<SavingsGoal>;
  contributeSavingsGoal?: (goalId: number, amount: string) => Promise<SavingsGoal>;
  getChildTasks?: () => Promise<ChildTask[]>;
  submitTaskCompletion?: (taskId: number) => Promise<ChildTask>;
  
  // Parent wallet specific methods
  getChildren?: () => Promise<FamilyConnection[]>;
  setAllowance?: (childWalletId: number, amount: string, frequency: 'weekly' | 'biweekly' | 'monthly') => Promise<FamilyConnection>;
  createChildTask?: (childWalletId: number, name: string, description: string, reward: string, dueDate?: string) => Promise<ChildTask>;
  approveChildTask?: (taskId: number) => Promise<ChildTask>;
  
  // Employer wallet specific methods
  getEmployees?: () => Promise<BusinessConnection[]>;
  createPayroll?: (payPeriodStart: string, payPeriodEnd: string, payDate: string) => Promise<Payroll>;
  processPayroll?: (payrollId: number) => Promise<Payroll>;
  getPayrolls?: () => Promise<Payroll[]>;
  getExpenseReports?: () => Promise<ExpenseReport[]>;
  reviewExpenseReport?: (reportId: number, status: 'approved' | 'rejected') => Promise<ExpenseReport>;
  
  // Employee wallet specific methods
  getPayslips?: () => Promise<Payslip[]>;
  createExpenseReport?: (description: string) => Promise<ExpenseReport>;
  addExpenseItem?: (reportId: number, amount: string, category: string, description: string, date: string, receiptUrl?: string) => Promise<ExpenseItem>;
  submitExpenseReport?: (reportId: number) => Promise<ExpenseReport>;
  submitTimeEntry?: (date: string, hoursWorked: string, description: string) => Promise<TimeEntry>;
  requestTimeOff?: (startDate: string, endDate: string, reason: string, type: 'vacation' | 'sick' | 'personal' | 'other') => Promise<TimeOffRequest>;
}

// Create context
export const WalletContext = createContext<WalletContextProps | null>(null);

// Provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [walletLoading, setWalletLoading] = useState<boolean>(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  
  const api = useApi();
  const navigation = useNavigation();
  
  // Initialize wallet on mount
  useEffect(() => {
    // Try to load wallet info from local storage or API
    getCurrentWalletInfo();
  }, []);
  
  const getCurrentWalletInfo = async (): Promise<Wallet | null> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, we'll simulate API call
      // In production, this would call: api.get('/wallets/current')
      
      if (currentWallet) {
        return currentWallet;
      }
      
      // Simulate API delay
      setTimeout(() => {
        setWalletLoading(false);
      }, 500);
      
      return null;
    } catch (error: any) {
      setWalletError(error.message);
      return null;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const setWalletType = async (type: 'parent' | 'child' | 'employer' | 'employee'): Promise<Wallet> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.post('/wallets', { type })
      
      // Mock wallet creation
      const mockWallet: Wallet = {
        id: 1,
        userId: 1,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Wallet`,
        type,
        balance: "1000.00",
        currency: "USD",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCurrentWallet(mockWallet);
      return mockWallet;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const getTransactions = async (options?: { limit?: number; offset?: number; type?: TransactionType }): Promise<Transaction[]> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.get('/transactions', options)
      
      // Mock transactions
      const transactions: Transaction[] = [
        {
          id: 1,
          type: "deposit",
          amount: "500.00",
          description: "Initial deposit",
          status: "completed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: "transfer",
          amount: "50.00",
          description: "Transfer to Sarah",
          status: "completed",
          fromWalletId: 1,
          toWalletId: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          type: "payment",
          amount: "35.50",
          description: "Coffee shop payment",
          status: "completed",
          fromWalletId: 1,
          toWalletId: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return transactions;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const getTransaction = async (id: number): Promise<Transaction> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.get(`/transactions/${id}`)
      
      // Mock transaction
      const mockTransaction: Transaction = {
        id,
        type: "transfer",
        amount: "50.00",
        description: "Transfer to Sarah",
        status: "completed",
        fromWalletId: 1,
        toWalletId: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockTransaction;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const sendMoney = async (toWalletId: number, amount: string, description: string): Promise<Transaction> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.post('/transactions/send', { toWalletId, amount, description })
      
      // Mock transaction
      const mockTransaction: Transaction = {
        id: Date.now(),
        type: "transfer",
        amount,
        description,
        status: "completed",
        fromWalletId: currentWallet?.id,
        toWalletId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockTransaction;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const requestMoney = async (fromWalletId: number, amount: string, description: string): Promise<Transaction> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.post('/transactions/request', { fromWalletId, amount, description })
      
      // Mock transaction
      const mockTransaction: Transaction = {
        id: Date.now(),
        type: "transfer",
        amount,
        description,
        status: "pending",
        fromWalletId,
        toWalletId: currentWallet?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockTransaction;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const depositFunds = async (amount: string, paymentMethodId: number, description: string): Promise<Transaction> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.post('/transactions/deposit', { amount, paymentMethodId, description })
      
      // Mock transaction
      const mockTransaction: Transaction = {
        id: Date.now(),
        type: "deposit",
        amount,
        description,
        status: "completed",
        toWalletId: currentWallet?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockTransaction;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const withdrawFunds = async (amount: string, bankAccountId: number, description: string): Promise<Transaction> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.post('/transactions/withdraw', { amount, bankAccountId, description })
      
      // Mock transaction
      const mockTransaction: Transaction = {
        id: Date.now(),
        type: "withdrawal",
        amount,
        description,
        status: "completed",
        fromWalletId: currentWallet?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockTransaction;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const getFamilyConnections = async (): Promise<FamilyConnection[]> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.get('/family-connections')
      
      // Mock family connections
      const mockConnections: FamilyConnection[] = [
        {
          id: 1,
          parentWalletId: 1,
          childWalletId: 2,
          status: "active",
          allowanceAmount: "25.00",
          allowanceFrequency: "weekly",
          allowanceNextDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockConnections;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const getBusinessConnections = async (): Promise<BusinessConnection[]> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.get('/business-connections')
      
      // Mock business connections
      const mockConnection: BusinessConnection = {
        id: 1,
        employerWalletId: 1,
        employeeWalletId: 2,
        status: "active",
        salaryAmount: "4000.00",
        salaryFrequency: "biweekly",
        salaryNextDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [mockConnection];
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const addChild = async (email: string, name: string): Promise<FamilyConnection> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.post('/family-connections', { email, name })
      
      // Mock family connection
      const mockConnection: FamilyConnection = {
        id: Date.now(),
        parentWalletId: currentWallet?.id || 0,
        childWalletId: Date.now() + 1,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockConnection;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  const addEmployee = async (email: string, name: string, role: string): Promise<BusinessConnection> => {
    try {
      setWalletLoading(true);
      
      // For demo purposes, simulating API call
      // In production, this would call: api.post('/business-connections', { email, name, role })
      
      // Mock business connection
      const mockConnection: BusinessConnection = {
        id: Date.now(),
        employerWalletId: currentWallet?.id || 0,
        employeeWalletId: Date.now() + 1,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return mockConnection;
    } catch (error: any) {
      setWalletError(error.message);
      throw error;
    } finally {
      setWalletLoading(false);
    }
  };
  
  // Format currency based on wallet settings
  const formatCurrency = (amount: string): string => {
    const currency = currentWallet?.currency || 'USD';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency, 
      minimumFractionDigits: 2 
    }).format(parseFloat(amount));
  };
  
  const contextValue: WalletContextProps = {
    currentWallet,
    loading: walletLoading || api.loading,
    error: walletError || api.error,
    setWalletType,
    getCurrentWalletInfo,
    getTransactions,
    getTransaction,
    sendMoney,
    requestMoney,
    depositFunds,
    withdrawFunds,
    getFamilyConnections,
    getBusinessConnections,
    addChild,
    addEmployee,
    formatCurrency,
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
};

export default useWallet;