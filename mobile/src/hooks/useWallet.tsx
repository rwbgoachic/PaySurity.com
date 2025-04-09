import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { useAuth } from './useAuth';

// Define wallet data types
export type Transaction = {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  status: 'completed' | 'pending' | 'failed';
  merchantLogo?: string;
  merchantName?: string;
  recipientId?: string;
  recipientName?: string;
  senderId?: string;
  senderName?: string;
  description?: string;
};

export type PaymentMethod = {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  cardType?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  bankName?: string;
  accountNumber?: string;
  walletProvider?: string;
  isDefault: boolean;
};

export type Wallet = {
  id: string;
  type: 'personal' | 'business' | 'parent' | 'child' | 'employer' | 'employee';
  balance: number;
  currencyCode: string;
  name: string;
  isDefault: boolean;
};

export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  avatarUrl?: string;
  isFrequent: boolean;
};

// Wallet Context type
type WalletContextType = {
  wallets: Wallet[];
  selectedWalletId: string | null;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  fetchWallets: () => Promise<void>;
  fetchTransactions: (walletId?: string, limit?: number) => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchContacts: () => Promise<void>;
  selectWallet: (walletId: string) => void;
  refreshWallet: () => Promise<void>;
  sendMoney: (data: SendMoneyParams) => Promise<Transaction>;
  requestMoney: (data: RequestMoneyParams) => Promise<Transaction>;
  addPaymentMethod: (data: AddPaymentMethodParams) => Promise<PaymentMethod>;
  removePaymentMethod: (id: string) => Promise<void>;
  makeDefaultPaymentMethod: (id: string) => Promise<void>;
  makeDefaultWallet: (id: string) => Promise<void>;
};

// Parameter types for wallet operations
type SendMoneyParams = {
  amount: number;
  recipientId: string;
  paymentMethodId: string;
  description?: string;
  walletId?: string;
};

type RequestMoneyParams = {
  amount: number;
  senderId: string;
  description?: string;
  walletId?: string;
};

type AddPaymentMethodParams = {
  type: 'card' | 'bank' | 'wallet';
  cardDetails?: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
  };
  bankDetails?: {
    accountNumber: string;
    routingNumber: string;
    accountHolderName: string;
    bankName: string;
  };
  walletDetails?: {
    provider: string;
    email: string;
  };
};

// Create the Wallet Context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Wallet Provider Props
type WalletProviderProps = {
  children: ReactNode;
};

// Wallet Provider Component
export const WalletProvider = ({ children }: WalletProviderProps) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for testing
  const mockWallets: Wallet[] = [
    {
      id: '1',
      type: 'personal',
      balance: 5782.45,
      currencyCode: 'USD',
      name: 'Personal Wallet',
      isDefault: true,
    },
    {
      id: '2',
      type: 'business',
      balance: 12345.67,
      currencyCode: 'USD',
      name: 'Business Wallet',
      isDefault: false,
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: '2023-07-20T14:30:00Z',
      title: 'Grocery Store',
      amount: 85.43,
      type: 'expense',
      category: 'shopping',
      status: 'completed',
      merchantName: 'Whole Foods',
    },
    {
      id: '2',
      date: '2023-07-18T09:15:00Z',
      title: 'Salary Deposit',
      amount: 2500.00,
      type: 'income',
      category: 'salary',
      status: 'completed',
      senderName: 'Company Inc.',
    },
    {
      id: '3',
      date: '2023-07-15T20:45:00Z',
      title: 'Restaurant',
      amount: 67.80,
      type: 'expense',
      category: 'food',
      status: 'completed',
      merchantName: 'Italian Bistro',
    },
    {
      id: '4',
      date: '2023-07-12T13:20:00Z',
      title: 'Uber Ride',
      amount: 24.50,
      type: 'expense',
      category: 'transport',
      status: 'completed',
      merchantName: 'Uber',
    },
    {
      id: '5',
      date: '2023-07-10T11:00:00Z',
      title: 'Transfer to Savings',
      amount: 500.00,
      type: 'transfer',
      category: 'transfer',
      status: 'completed',
      recipientName: 'Savings Account',
    },
  ];

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      cardType: 'visa',
      cardNumber: '4111111111111111',
      cardHolder: 'John Doe',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      cardType: 'mastercard',
      cardNumber: '5555555555554444',
      cardHolder: 'John Doe',
      expiryDate: '10/24',
      isDefault: false,
    },
    {
      id: '3',
      type: 'bank',
      bankName: 'Chase Bank',
      accountNumber: '****5678',
      isDefault: false,
    },
  ];

  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+12345678901',
      relationship: 'family',
      isFrequent: true,
    },
    {
      id: '2',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      phone: '+12345678902',
      relationship: 'friend',
      isFrequent: true,
    },
    {
      id: '3',
      name: 'Alice Brown',
      email: 'alice@example.com',
      phone: '+12345678903',
      relationship: 'coworker',
      isFrequent: false,
    },
    {
      id: '4',
      name: 'Company Inc.',
      email: 'payroll@company.com',
      relationship: 'business',
      isFrequent: true,
    },
  ];

  // Initialize wallet data
  useEffect(() => {
    if (user) {
      fetchWallets();
    }
  }, [user]);

  // Fetch user wallets
  const fetchWallets = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, fetch from API
      // const response = await api.get('/api/wallets');
      // const walletsData = response.data;
      
      // Using mock data for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      const walletsData = mockWallets;
      
      setWallets(walletsData);
      
      // Set selected wallet to default or first in list
      const defaultWallet = walletsData.find(wallet => wallet.isDefault);
      setSelectedWalletId(defaultWallet?.id || walletsData[0]?.id || null);
      
      // Load transactions for selected wallet
      if (defaultWallet?.id || walletsData[0]?.id) {
        fetchTransactions(defaultWallet?.id || walletsData[0]?.id);
      }
      
    } catch (err: any) {
      console.error('Error fetching wallets:', err);
      setError(err.message || 'Failed to load wallets');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transactions for a wallet
  const fetchTransactions = async (walletId?: string, limit = 20) => {
    if (!user) return;
    
    const targetWalletId = walletId || selectedWalletId;
    if (!targetWalletId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, fetch from API
      // const response = await api.get(`/api/wallets/${targetWalletId}/transactions?limit=${limit}`);
      // const transactionsData = response.data;
      
      // Using mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      const transactionsData = mockTransactions;
      
      setTransactions(transactionsData);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, fetch from API
      // const response = await api.get('/api/payment-methods');
      // const methodsData = response.data;
      
      // Using mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      const methodsData = mockPaymentMethods;
      
      setPaymentMethods(methodsData);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      setError(err.message || 'Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch contacts
  const fetchContacts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, fetch from API
      // const response = await api.get('/api/contacts');
      // const contactsData = response.data;
      
      // Using mock data for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      const contactsData = mockContacts;
      
      setContacts(contactsData);
    } catch (err: any) {
      console.error('Error fetching contacts:', err);
      setError(err.message || 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  // Select a wallet
  const selectWallet = (walletId: string) => {
    setSelectedWalletId(walletId);
    fetchTransactions(walletId);
  };

  // Refresh wallet data
  const refreshWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchWallets();
      if (selectedWalletId) {
        await fetchTransactions(selectedWalletId);
      }
      await fetchPaymentMethods();
      await fetchContacts();
    } catch (err: any) {
      console.error('Error refreshing wallet data:', err);
      setError(err.message || 'Failed to refresh wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  // Send money
  const sendMoney = async (data: SendMoneyParams): Promise<Transaction> => {
    if (!user) throw new Error('User not authenticated');
    
    const walletId = data.walletId || selectedWalletId;
    if (!walletId) throw new Error('No wallet selected');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, send to API
      // const response = await api.post(`/api/wallets/${walletId}/send`, data);
      // const transactionData = response.data;
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock transaction
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        date: new Date().toISOString(),
        title: `Payment to ${data.recipientId}`,
        amount: data.amount,
        type: 'expense',
        category: 'transfer',
        status: 'completed',
        recipientId: data.recipientId,
        description: data.description,
      };
      
      // Update local state
      setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
      
      // Update wallet balance
      setWallets(prevWallets =>
        prevWallets.map(wallet =>
          wallet.id === walletId
            ? { ...wallet, balance: wallet.balance - data.amount }
            : wallet
        )
      );
      
      return newTransaction;
    } catch (err: any) {
      console.error('Error sending money:', err);
      setError(err.message || 'Failed to send money');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Request money
  const requestMoney = async (data: RequestMoneyParams): Promise<Transaction> => {
    if (!user) throw new Error('User not authenticated');
    
    const walletId = data.walletId || selectedWalletId;
    if (!walletId) throw new Error('No wallet selected');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, send to API
      // const response = await api.post(`/api/wallets/${walletId}/request`, data);
      // const transactionData = response.data;
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock transaction
      const newTransaction: Transaction = {
        id: `tx_${Date.now()}`,
        date: new Date().toISOString(),
        title: `Request from ${data.senderId}`,
        amount: data.amount,
        type: 'income',
        category: 'transfer',
        status: 'pending',
        senderId: data.senderId,
        description: data.description,
      };
      
      // Update local state
      setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
      
      return newTransaction;
    } catch (err: any) {
      console.error('Error requesting money:', err);
      setError(err.message || 'Failed to request money');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Add payment method
  const addPaymentMethod = async (data: AddPaymentMethodParams): Promise<PaymentMethod> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, send to API
      // const response = await api.post('/api/payment-methods', data);
      // const paymentMethodData = response.data;
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock payment method
      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: data.type,
        isDefault: paymentMethods.length === 0,
      };
      
      if (data.type === 'card' && data.cardDetails) {
        newPaymentMethod.cardType = detectCardType(data.cardDetails.cardNumber);
        newPaymentMethod.cardNumber = data.cardDetails.cardNumber;
        newPaymentMethod.cardHolder = data.cardDetails.cardHolder;
        newPaymentMethod.expiryDate = data.cardDetails.expiryDate;
      } else if (data.type === 'bank' && data.bankDetails) {
        newPaymentMethod.bankName = data.bankDetails.bankName;
        newPaymentMethod.accountNumber = `****${data.bankDetails.accountNumber.slice(-4)}`;
      } else if (data.type === 'wallet' && data.walletDetails) {
        newPaymentMethod.walletProvider = data.walletDetails.provider;
      }
      
      // Update local state
      setPaymentMethods(prevMethods => [...prevMethods, newPaymentMethod]);
      
      return newPaymentMethod;
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      setError(err.message || 'Failed to add payment method');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove payment method
  const removePaymentMethod = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, send to API
      // await api.delete(`/api/payment-methods/${id}`);
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setPaymentMethods(prevMethods => prevMethods.filter(method => method.id !== id));
      
    } catch (err: any) {
      console.error('Error removing payment method:', err);
      setError(err.message || 'Failed to remove payment method');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Make payment method default
  const makeDefaultPaymentMethod = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, send to API
      // await api.patch(`/api/payment-methods/${id}/default`);
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setPaymentMethods(prevMethods =>
        prevMethods.map(method => ({
          ...method,
          isDefault: method.id === id,
        }))
      );
      
    } catch (err: any) {
      console.error('Error setting default payment method:', err);
      setError(err.message || 'Failed to set default payment method');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Make wallet default
  const makeDefaultWallet = async (id: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, send to API
      // await api.patch(`/api/wallets/${id}/default`);
      
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setWallets(prevWallets =>
        prevWallets.map(wallet => ({
          ...wallet,
          isDefault: wallet.id === id,
        }))
      );
      
      // Select this wallet
      setSelectedWalletId(id);
      
    } catch (err: any) {
      console.error('Error setting default wallet:', err);
      setError(err.message || 'Failed to set default wallet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function to detect card type from number
  const detectCardType = (cardNumber: string): string => {
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^(6011|65|64[4-9])/.test(cleanNumber)) return 'discover';
    
    return 'default';
  };

  const value = {
    wallets,
    selectedWalletId,
    transactions,
    paymentMethods,
    contacts,
    isLoading,
    error,
    fetchWallets,
    fetchTransactions,
    fetchPaymentMethods,
    fetchContacts,
    selectWallet,
    refreshWallet,
    sendMoney,
    requestMoney,
    addPaymentMethod,
    removePaymentMethod,
    makeDefaultPaymentMethod,
    makeDefaultWallet,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

// Hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};