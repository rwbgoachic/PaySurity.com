import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import useApi from './useApi';
import { useNavigation } from '@react-navigation/native';

// Types
export type WalletType = 'parent' | 'child' | 'employer' | 'employee';

export interface WalletUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  role: string;
}

export interface Transaction {
  id: number;
  amount: number;
  currency: string;
  type: 'incoming' | 'outgoing';
  category: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  recipientName?: string;
  senderName?: string;
}

export interface PaymentMethod {
  id: number;
  type: 'card' | 'bank_account' | 'wallet';
  name: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
  brand?: string; // Visa, Mastercard, etc. for cards
  bankName?: string; // For bank accounts
}

export interface ChildAccount {
  id: number;
  firstName: string;
  lastName: string;
  profileImage?: string;
  balance: number;
  currency: string;
  allowance: number;
  allowanceFrequency: 'weekly' | 'biweekly' | 'monthly';
  nextAllowanceDate: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  category: string;
  imageUrl?: string;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'cancelled';
  parentContribution?: number;
  parentMatching?: number; // Percentage of matching
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  position: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  salary: number;
  currency: string;
  paymentFrequency: 'weekly' | 'biweekly' | 'monthly';
}

export interface Payroll {
  id: number;
  period: string;
  startDate: string;
  endDate: string;
  processedDate?: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  totalAmount: number;
  currency: string;
  employeeCount: number;
}

export interface Payslip {
  id: number;
  payPeriod: string;
  payDate: string;
  grossAmount: number;
  netAmount: number;
  currency: string;
  status: 'pending' | 'paid';
  employerName: string;
  deductions: {
    name: string;
    amount: number;
  }[];
  earnings: {
    name: string;
    amount: number;
  }[];
}

export interface Employer {
  id: number;
  name: string;
  logoUrl?: string;
  industry: string;
  position: string;
  department: string;
  joinedDate: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface ExpenseReport {
  id: number;
  title: string;
  description?: string;
  createdDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
  total: number;
  currency: string;
  items: {
    id: number;
    category: string;
    description: string;
    amount: number;
    date: string;
    receiptUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
  }[];
}

export interface TimeOffRequest {
  id: number;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes?: string;
  approverName?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  reward?: number;
  dueDate?: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  assignedBy?: string; 
  completedDate?: string;
  category?: string;
}

export interface WalletNotification {
  id: number;
  title: string;
  message: string;
  type: 'transaction' | 'system' | 'task' | 'reward' | 'allowance' | 'payroll' | 'expense';
  read: boolean;
  createdAt: string;
  action?: string;
  actionUrl?: string;
}

export interface WalletBalance {
  available: number;
  pending: number;
  currency: string;
  lastUpdated: string;
}

export interface Wallet {
  id: number;
  type: WalletType;
  user: WalletUser;
  balance: WalletBalance;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  notifications: WalletNotification[];
}

export interface ParentWallet extends Wallet {
  children: ChildAccount[];
  familySpending: {
    period: string;
    amount: number;
    breakdown: {
      category: string;
      amount: number;
      percentage: number;
    }[];
  };
}

export interface ChildWallet extends Wallet {
  allowance: {
    amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    nextDate: string;
  };
  savingsGoals: SavingsGoal[];
  tasks: Task[];
  parentInfo: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

export interface EmployerWallet extends Wallet {
  employees: Employee[];
  payrolls: Payroll[];
  businessSpending: {
    period: string;
    amount: number;
    breakdown: {
      category: string;
      amount: number;
      percentage: number;
    }[];
  };
  pendingApprovals: {
    expenseReports: number;
    timeOffRequests: number;
    employeeOnboarding: number;
  };
}

export interface EmployeeWallet extends Wallet {
  employers: Employer[];
  payslips: Payslip[];
  expenseReports: ExpenseReport[];
  timeOffRequests: TimeOffRequest[];
  benefits: {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'inactive';
    details?: string;
  }[];
}

export type WalletData = ParentWallet | ChildWallet | EmployerWallet | EmployeeWallet;

export interface WalletContextProps {
  currentWallet: WalletData | null;
  loading: boolean;
  error: string | null;
  setWalletType: (type: WalletType) => Promise<void>;
  refreshWallet: () => Promise<void>;
  sendMoney: (recipient: string, amount: number, note?: string) => Promise<boolean>;
  requestMoney: (from: string, amount: number, note?: string) => Promise<boolean>;
  addPaymentMethod: (paymentMethodData: Partial<PaymentMethod>) => Promise<boolean>;
  getTransactionHistory: (filters?: any) => Promise<Transaction[]>;
  markNotificationAsRead: (notificationId: number) => Promise<boolean>;
}

interface WalletProviderProps {
  children: ReactNode;
}

function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export const WalletContext = createContext<WalletContextProps | null>(null);

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [currentWallet, setCurrentWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const navigation = useNavigation();

  const setWalletType = async (type: WalletType): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call an API endpoint like /api/wallet/{type}
      // For now, we'll use mock data that's stored in a secure location
      const response = await api.get<WalletData>(`/wallet/${type}`);
      
      if (response) {
        setCurrentWallet(response);
      } else {
        setError('Failed to load wallet data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      Alert.alert('Error', `Failed to load wallet: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async (): Promise<void> => {
    if (!currentWallet) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<WalletData>(`/wallet/${currentWallet.type}`);
      
      if (response) {
        setCurrentWallet(response);
      } else {
        setError('Failed to refresh wallet data');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendMoney = async (recipient: string, amount: number, note?: string): Promise<boolean> => {
    if (!currentWallet) {
      setError('No wallet is currently active');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ success: boolean }>('/wallet/send', {
        walletId: currentWallet.id,
        recipient,
        amount,
        note,
      });

      if (response && response.success) {
        await refreshWallet();
        return true;
      } else {
        setError('Failed to send money');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      Alert.alert('Error', `Failed to send money: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestMoney = async (from: string, amount: number, note?: string): Promise<boolean> => {
    if (!currentWallet) {
      setError('No wallet is currently active');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ success: boolean }>('/wallet/request', {
        walletId: currentWallet.id,
        from,
        amount,
        note,
      });

      if (response && response.success) {
        await refreshWallet();
        return true;
      } else {
        setError('Failed to request money');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      Alert.alert('Error', `Failed to request money: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (paymentMethodData: Partial<PaymentMethod>): Promise<boolean> => {
    if (!currentWallet) {
      setError('No wallet is currently active');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ success: boolean }>('/wallet/payment-methods', {
        walletId: currentWallet.id,
        ...paymentMethodData,
      });

      if (response && response.success) {
        await refreshWallet();
        return true;
      } else {
        setError('Failed to add payment method');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      Alert.alert('Error', `Failed to add payment method: ${errorMessage}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTransactionHistory = async (filters?: any): Promise<Transaction[]> => {
    if (!currentWallet) {
      setError('No wallet is currently active');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<Transaction[]>('/wallet/transactions', {
        walletId: currentWallet.id,
        ...filters,
      });

      if (response) {
        return response;
      } else {
        setError('Failed to get transaction history');
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      Alert.alert('Error', `Failed to get transaction history: ${errorMessage}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: number): Promise<boolean> => {
    if (!currentWallet) {
      setError('No wallet is currently active');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<{ success: boolean }>('/wallet/notifications/read', {
        walletId: currentWallet.id,
        notificationId,
      });

      if (response && response.success) {
        // Update the notification in the current wallet state
        if (currentWallet && currentWallet.notifications) {
          const updatedWallet = { 
            ...currentWallet,
            notifications: currentWallet.notifications.map(notification => 
              notification.id === notificationId 
                ? { ...notification, read: true } 
                : notification
            ),
          };
          setCurrentWallet(updatedWallet);
        }
        return true;
      } else {
        setError('Failed to mark notification as read');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: WalletContextProps = {
    currentWallet,
    loading,
    error,
    setWalletType,
    refreshWallet,
    sendMoney,
    requestMoney,
    addPaymentMethod,
    getTransactionHistory,
    markNotificationAsRead,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};