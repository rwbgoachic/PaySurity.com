import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import useApi from './useApi';

// Transaction type definition
export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'allowance' | 'payment_received';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  fromAccountId?: number;
  toAccountId?: number;
  metadata?: Record<string, any>;
  paymentMethod?: string;
  direction: 'incoming' | 'outgoing';
}

// Wallet account type definition
export interface WalletAccount {
  id: number;
  userId: number;
  name: string;
  type: 'primary' | 'savings' | 'checking' | 'business' | 'child' | 'employee';
  balance: number;
  currency: string;
  isDefault: boolean;
  status: 'active' | 'frozen' | 'closed';
  createdAt: string;
  updatedAt: string;
}

// Card type definition
export interface Card {
  id: number;
  userId: number;
  cardNumber: string; // Last 4 digits only for security
  cardType: string;
  expiryDate: string;
  isDefault: boolean;
  status: 'active' | 'blocked' | 'expired';
  cardholderName: string;
  billingAddress?: BillingAddress;
}

// Payment method type definition
export interface PaymentMethod {
  id: number;
  userId: number;
  type: 'card' | 'bank_account' | 'wallet';
  name: string;
  isDefault: boolean;
  status: 'active' | 'inactive';
  details: {
    last4?: string;
    brand?: string;
    expMonth?: number;
    expYear?: number;
    bankName?: string;
    accountType?: string;
  };
}

// Billing address type definition
export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// Wallet user type definition
export interface WalletUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'parent' | 'child' | 'employer' | 'employee';
  status: 'active' | 'pending' | 'suspended';
  profilePicture?: string;
  preferredCurrency: string;
  phone?: string;
  createdAt: string;
  settings: {
    notifications: boolean;
    twoFactorEnabled: boolean;
    autoPayEnabled: boolean;
  };
}

// Child account type definition
export interface ChildAccount {
  id: number;
  userId: number;
  childId: number;
  childName: string;
  status: 'active' | 'pending' | 'suspended';
  allowance: {
    amount: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    nextDate: string;
  };
  spendingLimits: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  balance: number;
}

// Employee account type definition
export interface EmployeeAccount {
  id: number;
  userId: number;
  employeeId: number;
  employeeName: string;
  status: 'active' | 'pending' | 'suspended';
  department: string;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'contract';
  payrollInfo: {
    salary: number;
    payFrequency: 'weekly' | 'biweekly' | 'monthly';
    nextPayday: string;
  };
  balance: number;
}

// Savings goal type definition
export interface SavingsGoal {
  id: number;
  userId: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
  status: 'active' | 'completed' | 'cancelled';
  category: string;
  description?: string;
}

// Recurring payment type definition
export interface RecurringPayment {
  id: number;
  userId: number;
  name: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  nextDate: string;
  status: 'active' | 'paused' | 'cancelled';
  paymentMethod: string;
  category: string;
  recipientName: string;
  recipientAccount: string;
}

// Task type definition
export interface Task {
  id: number;
  name: string;
  reward: string;
  status: 'pending' | 'completed' | 'approved' | 'rejected';
  dueDate?: string;
  completedDate?: string;
}

// Payroll entry type definition
export interface PayrollEntry {
  id: number;
  userId: number;
  employerId: number;
  employeeId: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  hoursWorked: number;
  regularPay: number;
  overtimePay: number;
  bonuses: number;
  commissions: number;
  grossAmount: number;
  taxWithholdings: number;
  otherWithholdings: number;
  netAmount: number;
  status: 'pending' | 'processed' | 'cancelled';
  notes: string;
}

// Wallet context data interface
interface WalletContextData {
  // User and Account Information
  currentUser: WalletUser | null;
  accounts: WalletAccount[];
  selectedAccount: WalletAccount | null;
  cards: Card[];
  paymentMethods: PaymentMethod[];
  
  // Parental Controls and Child Management
  childAccounts: ChildAccount[];
  childTasks: Record<number, Task[]>;
  childTransactions: Record<number, Transaction[]>;
  
  // Employer and Employee Management
  employeeAccounts: EmployeeAccount[];
  payrollEntries: PayrollEntry[];
  employeeTransactions: Record<number, Transaction[]>;
  
  // Transaction and Financial Data
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  recurringPayments: RecurringPayment[];
  savingsGoals: SavingsGoal[];
  
  // Loading and Error States
  isLoading: boolean;
  error: string | null;
  
  // Account Selection
  selectAccount: (accountId: number) => void;
  
  // Transaction Operations
  sendMoney: (recipientId: number, amount: number, description: string) => Promise<boolean>;
  requestMoney: (fromUserId: number, amount: number, description: string) => Promise<boolean>;
  depositFunds: (amount: number, method: string, description: string) => Promise<boolean>;
  withdrawFunds: (amount: number, method: string, description: string) => Promise<boolean>;
  
  // Card Management
  addCard: (cardDetails: Omit<Card, 'id' | 'userId'>) => Promise<boolean>;
  removeCard: (cardId: number) => Promise<boolean>;
  updateCardStatus: (cardId: number, status: Card['status']) => Promise<boolean>;
  
  // Child Account Management
  addChildAccount: (childDetails: Omit<ChildAccount, 'id' | 'userId'>) => Promise<boolean>;
  updateChildAllowance: (childId: number, allowance: ChildAccount['allowance']) => Promise<boolean>;
  updateChildSpendingLimits: (childId: number, limits: ChildAccount['spendingLimits']) => Promise<boolean>;
  assignTaskToChild: (childId: number, task: Omit<Task, 'id'>) => Promise<boolean>;
  approveChildTask: (childId: number, taskId: number) => Promise<boolean>;
  
  // Employee Account Management
  addEmployeeAccount: (employeeDetails: Omit<EmployeeAccount, 'id' | 'userId'>) => Promise<boolean>;
  processPayroll: (payrollDetails: Omit<PayrollEntry, 'id'>) => Promise<boolean>;
  updateEmployeeStatus: (employeeId: number, status: EmployeeAccount['status']) => Promise<boolean>;
  
  // Savings Goals
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'currentAmount'>) => Promise<boolean>;
  updateSavingsGoal: (goalId: number, amount: number) => Promise<boolean>;
  completeSavingsGoal: (goalId: number) => Promise<boolean>;
  
  // Recurring Payments
  addRecurringPayment: (payment: Omit<RecurringPayment, 'id' | 'userId'>) => Promise<boolean>;
  updateRecurringPaymentStatus: (paymentId: number, status: RecurringPayment['status']) => Promise<boolean>;
  deleteRecurringPayment: (paymentId: number) => Promise<boolean>;
  
  // Reload Data
  refreshWalletData: () => Promise<void>;
}

// Create the context
const WalletContext = createContext<WalletContextData | null>(null);

// Provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const api = useApi();
  
  // State
  const [currentUser, setCurrentUser] = useState<WalletUser | null>(null);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<WalletAccount | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [childAccounts, setChildAccounts] = useState<ChildAccount[]>([]);
  const [childTasks, setChildTasks] = useState<Record<number, Task[]>>({});
  const [childTransactions, setChildTransactions] = useState<Record<number, Transaction[]>>({});
  const [employeeAccounts, setEmployeeAccounts] = useState<EmployeeAccount[]>([]);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [employeeTransactions, setEmployeeTransactions] = useState<Record<number, Transaction[]>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  
  // Fetch account data
  const fetchWalletData = useCallback(async () => {
    try {
      // Fetch user data
      const userData = await api.get<WalletUser>('/api/wallet/user');
      
      if (userData) {
        setCurrentUser(userData);
        
        // Fetch accounts
        const accountsData = await api.get<WalletAccount[]>('/api/wallet/accounts');
        if (accountsData) {
          setAccounts(accountsData);
          
          // Set default selected account
          const defaultAccount = accountsData.find(account => account.isDefault) || accountsData[0];
          setSelectedAccount(defaultAccount);
        }
        
        // Fetch payment methods and cards
        const cardsData = await api.get<Card[]>('/api/wallet/cards');
        if (cardsData) setCards(cardsData);
        
        const paymentMethodsData = await api.get<PaymentMethod[]>('/api/wallet/payment-methods');
        if (paymentMethodsData) setPaymentMethods(paymentMethodsData);
        
        // Fetch transactions
        const transactionsData = await api.get<Transaction[]>('/api/wallet/transactions');
        if (transactionsData) {
          setTransactions(transactionsData);
          setPendingTransactions(transactionsData.filter(t => t.status === 'pending'));
        }
        
        // Fetch recurring payments
        const recurringPaymentsData = await api.get<RecurringPayment[]>('/api/wallet/recurring-payments');
        if (recurringPaymentsData) setRecurringPayments(recurringPaymentsData);
        
        // Fetch savings goals
        const savingsGoalsData = await api.get<SavingsGoal[]>('/api/wallet/savings-goals');
        if (savingsGoalsData) setSavingsGoals(savingsGoalsData);
        
        // Role-specific data
        if (userData.role === 'parent' || userData.role === 'employer') {
          // Fetch child accounts for parents
          if (userData.role === 'parent') {
            const childAccountsData = await api.get<ChildAccount[]>('/api/wallet/child-accounts');
            if (childAccountsData) {
              setChildAccounts(childAccountsData);
              
              // Fetch child-specific data
              const tasksPromises = childAccountsData.map(async (child: ChildAccount) => {
                const tasks = await api.get<Task[]>(`/api/wallet/child/${child.childId}/tasks`);
                return { childId: child.childId, tasks: tasks || [] };
              });
              
              const transactionsPromises = childAccountsData.map(async (child: ChildAccount) => {
                const transactions = await api.get<Transaction[]>(`/api/wallet/child/${child.childId}/transactions`);
                return { childId: child.childId, transactions: transactions || [] };
              });
              
              const tasksResults = await Promise.all(tasksPromises);
              const transactionsResults = await Promise.all(transactionsPromises);
              
              const tasksMap: Record<number, Task[]> = {};
              const transactionsMap: Record<number, Transaction[]> = {};
              
              tasksResults.forEach(result => {
                tasksMap[result.childId] = result.tasks;
              });
              
              transactionsResults.forEach(result => {
                transactionsMap[result.childId] = result.transactions;
              });
              
              setChildTasks(tasksMap);
              setChildTransactions(transactionsMap);
            }
          }
          
          // Fetch employee accounts for employers
          if (userData.role === 'employer') {
            const employeeAccountsData = await api.get<EmployeeAccount[]>('/api/wallet/employee-accounts');
            if (employeeAccountsData) {
              setEmployeeAccounts(employeeAccountsData);
              
              // Fetch payroll entries
              const payrollData = await api.get<PayrollEntry[]>('/api/wallet/payroll');
              if (payrollData) setPayrollEntries(payrollData);
              
              // Fetch employee-specific transactions
              const transactionsPromises = employeeAccountsData.map(async (employee: EmployeeAccount) => {
                const transactions = await api.get<Transaction[]>(`/api/wallet/employee/${employee.employeeId}/transactions`);
                return { employeeId: employee.employeeId, transactions: transactions || [] };
              });
              
              const transactionsResults = await Promise.all(transactionsPromises);
              const transactionsMap: Record<number, Transaction[]> = {};
              
              transactionsResults.forEach(result => {
                transactionsMap[result.employeeId] = result.transactions;
              });
              
              setEmployeeTransactions(transactionsMap);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  }, [api]);
  
  // Initial data fetch
  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);
  
  // Select account
  const selectAccount = useCallback((accountId: number) => {
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      setSelectedAccount(account);
    }
  }, [accounts]);
  
  // Transaction operations
  const sendMoney = useCallback(async (recipientId: number, amount: number, description: string): Promise<boolean> => {
    const result = await api.post<{ success: boolean; transaction: Transaction }>('/api/wallet/send-money', {
      recipientId,
      amount,
      description,
      accountId: selectedAccount?.id,
    });
    
    if (result?.success) {
      // Update local data
      setTransactions(prev => [result.transaction, ...prev]);
      
      // Update selected account balance
      if (selectedAccount) {
        setSelectedAccount({
          ...selectedAccount,
          balance: selectedAccount.balance - amount,
        });
        
        // Update accounts list
        setAccounts(prev => prev.map(acc => 
          acc.id === selectedAccount.id 
            ? { ...acc, balance: acc.balance - amount } 
            : acc
        ));
      }
      
      return true;
    }
    
    return false;
  }, [api, selectedAccount]);
  
  const requestMoney = useCallback(async (fromUserId: number, amount: number, description: string): Promise<boolean> => {
    const result = await api.post<{ success: boolean; transaction: Transaction }>('/api/wallet/request-money', {
      fromUserId,
      amount,
      description,
      accountId: selectedAccount?.id,
    });
    
    if (result?.success) {
      // Update pending transactions
      setPendingTransactions(prev => [result.transaction, ...prev]);
      
      return true;
    }
    
    return false;
  }, [api, selectedAccount]);
  
  const depositFunds = useCallback(async (amount: number, method: string, description: string): Promise<boolean> => {
    const result = await api.post<{ success: boolean; transaction: Transaction }>('/api/wallet/deposit', {
      amount,
      method,
      description,
      accountId: selectedAccount?.id,
    });
    
    if (result?.success) {
      // Update local data
      setTransactions(prev => [result.transaction, ...prev]);
      
      // Update selected account balance
      if (selectedAccount) {
        setSelectedAccount({
          ...selectedAccount,
          balance: selectedAccount.balance + amount,
        });
        
        // Update accounts list
        setAccounts(prev => prev.map(acc => 
          acc.id === selectedAccount.id 
            ? { ...acc, balance: acc.balance + amount } 
            : acc
        ));
      }
      
      return true;
    }
    
    return false;
  }, [api, selectedAccount]);
  
  const withdrawFunds = useCallback(async (amount: number, method: string, description: string): Promise<boolean> => {
    const result = await api.post<{ success: boolean; transaction: Transaction }>('/api/wallet/withdraw', {
      amount,
      method,
      description,
      accountId: selectedAccount?.id,
    });
    
    if (result?.success) {
      // Update local data
      setTransactions(prev => [result.transaction, ...prev]);
      
      // Update selected account balance
      if (selectedAccount) {
        setSelectedAccount({
          ...selectedAccount,
          balance: selectedAccount.balance - amount,
        });
        
        // Update accounts list
        setAccounts(prev => prev.map(acc => 
          acc.id === selectedAccount.id 
            ? { ...acc, balance: acc.balance - amount } 
            : acc
        ));
      }
      
      return true;
    }
    
    return false;
  }, [api, selectedAccount]);
  
  // Card management
  const addCard = useCallback(async (cardDetails: Omit<Card, 'id' | 'userId'>): Promise<boolean> => {
    const result = await api.post<{ success: boolean; card: Card }>('/api/wallet/cards', cardDetails);
    
    if (result?.success) {
      setCards(prev => [...prev, result.card]);
      return true;
    }
    
    return false;
  }, [api]);
  
  const removeCard = useCallback(async (cardId: number): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/api/wallet/cards/${cardId}`);
    
    if (result?.success) {
      setCards(prev => prev.filter(card => card.id !== cardId));
      return true;
    }
    
    return false;
  }, [api]);
  
  const updateCardStatus = useCallback(async (cardId: number, status: Card['status']): Promise<boolean> => {
    const result = await api.patch<{ success: boolean; card: Card }>(`/api/wallet/cards/${cardId}`, { status });
    
    if (result?.success) {
      setCards(prev => prev.map(card => 
        card.id === cardId ? result.card : card
      ));
      return true;
    }
    
    return false;
  }, [api]);
  
  // Child account management
  const addChildAccount = useCallback(async (childDetails: Omit<ChildAccount, 'id' | 'userId'>): Promise<boolean> => {
    const result = await api.post<{ success: boolean; childAccount: ChildAccount }>('/api/wallet/child-accounts', childDetails);
    
    if (result?.success) {
      setChildAccounts(prev => [...prev, result.childAccount]);
      return true;
    }
    
    return false;
  }, [api]);
  
  const updateChildAllowance = useCallback(async (childId: number, allowance: ChildAccount['allowance']): Promise<boolean> => {
    const result = await api.patch<{ success: boolean; childAccount: ChildAccount }>(
      `/api/wallet/child-accounts/${childId}/allowance`,
      { allowance }
    );
    
    if (result?.success) {
      setChildAccounts(prev => prev.map(child => 
        child.childId === childId ? result.childAccount : child
      ));
      return true;
    }
    
    return false;
  }, [api]);
  
  const updateChildSpendingLimits = useCallback(async (childId: number, limits: ChildAccount['spendingLimits']): Promise<boolean> => {
    const result = await api.patch<{ success: boolean; childAccount: ChildAccount }>(
      `/api/wallet/child-accounts/${childId}/spending-limits`,
      { limits }
    );
    
    if (result?.success) {
      setChildAccounts(prev => prev.map(child => 
        child.childId === childId ? result.childAccount : child
      ));
      return true;
    }
    
    return false;
  }, [api]);
  
  const assignTaskToChild = useCallback(async (childId: number, task: Omit<Task, 'id'>): Promise<boolean> => {
    const result = await api.post<{ success: boolean; task: Task }>(`/api/wallet/child/${childId}/tasks`, task);
    
    if (result?.success) {
      setChildTasks(prev => ({
        ...prev,
        [childId]: [...(prev[childId] || []), result.task]
      }));
      return true;
    }
    
    return false;
  }, [api]);
  
  const approveChildTask = useCallback(async (childId: number, taskId: number): Promise<boolean> => {
    const result = await api.post<{
      success: boolean;
      task: Task;
      transaction?: Transaction;
      childAccount?: ChildAccount;
    }>(`/api/wallet/child/${childId}/tasks/${taskId}/approve`, {});
    
    if (result?.success) {
      // Update task status
      setChildTasks(prev => ({
        ...prev,
        [childId]: prev[childId].map(task => 
          task.id === taskId ? result.task : task
        )
      }));
      
      // If a transaction was created, update child transactions
      if (result.transaction) {
        setChildTransactions(prev => ({
          ...prev,
          [childId]: [result.transaction!, ...(prev[childId] || [])]
        }));
      }
      
      // If child account balance was updated
      if (result.childAccount) {
        setChildAccounts(prev => prev.map(child => 
          child.childId === childId ? result.childAccount! : child
        ));
      }
      
      return true;
    }
    
    return false;
  }, [api]);
  
  // Employee account management
  const addEmployeeAccount = useCallback(async (employeeDetails: Omit<EmployeeAccount, 'id' | 'userId'>): Promise<boolean> => {
    const result = await api.post<{ success: boolean; employeeAccount: EmployeeAccount }>(
      '/api/wallet/employee-accounts',
      employeeDetails
    );
    
    if (result?.success) {
      setEmployeeAccounts(prev => [...prev, result.employeeAccount]);
      return true;
    }
    
    return false;
  }, [api]);
  
  const processPayroll = useCallback(async (payrollDetails: Omit<PayrollEntry, 'id'>): Promise<boolean> => {
    const result = await api.post<{
      success: boolean;
      payrollEntry: PayrollEntry;
      transactions: Transaction[];
    }>('/api/wallet/process-payroll', payrollDetails);
    
    if (result?.success) {
      // Update payroll entries
      setPayrollEntries(prev => [...prev, result.payrollEntry]);
      
      // Update transactions for the affected employee
      if (result.transactions.length > 0) {
        const employeeId = result.payrollEntry.employeeId;
        setEmployeeTransactions(prev => ({
          ...prev,
          [employeeId]: [...result.transactions, ...(prev[employeeId] || [])]
        }));
      }
      
      return true;
    }
    
    return false;
  }, [api]);
  
  const updateEmployeeStatus = useCallback(async (employeeId: number, status: EmployeeAccount['status']): Promise<boolean> => {
    const result = await api.patch<{ success: boolean; employeeAccount: EmployeeAccount }>(
      `/api/wallet/employee-accounts/${employeeId}/status`,
      { status }
    );
    
    if (result?.success) {
      setEmployeeAccounts(prev => prev.map(employee => 
        employee.employeeId === employeeId ? result.employeeAccount : employee
      ));
      return true;
    }
    
    return false;
  }, [api]);
  
  // Savings goals
  const addSavingsGoal = useCallback(async (
    goal: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt' | 'currentAmount'>
  ): Promise<boolean> => {
    const result = await api.post<{ success: boolean; savingsGoal: SavingsGoal }>(
      '/api/wallet/savings-goals',
      { ...goal, currentAmount: 0 }
    );
    
    if (result?.success) {
      setSavingsGoals(prev => [...prev, result.savingsGoal]);
      return true;
    }
    
    return false;
  }, [api]);
  
  const updateSavingsGoal = useCallback(async (goalId: number, amount: number): Promise<boolean> => {
    const result = await api.post<{
      success: boolean;
      savingsGoal: SavingsGoal;
      transaction?: Transaction;
    }>(`/api/wallet/savings-goals/${goalId}/contribute`, { amount });
    
    if (result?.success) {
      // Update savings goal
      setSavingsGoals(prev => prev.map(goal => 
        goal.id === goalId ? result.savingsGoal : goal
      ));
      
      // If a transaction was created (funds transferred from account to goal)
      if (result.transaction) {
        setTransactions(prev => [result.transaction!, ...prev]);
        
        // Update selected account balance
        if (selectedAccount) {
          setSelectedAccount({
            ...selectedAccount,
            balance: selectedAccount.balance - amount,
          });
          
          // Update accounts list
          setAccounts(prev => prev.map(acc => 
            acc.id === selectedAccount.id 
              ? { ...acc, balance: acc.balance - amount } 
              : acc
          ));
        }
      }
      
      return true;
    }
    
    return false;
  }, [api, selectedAccount]);
  
  const completeSavingsGoal = useCallback(async (goalId: number): Promise<boolean> => {
    const result = await api.post<{ success: boolean; savingsGoal: SavingsGoal }>(
      `/api/wallet/savings-goals/${goalId}/complete`,
      {}
    );
    
    if (result?.success) {
      setSavingsGoals(prev => prev.map(goal => 
        goal.id === goalId ? result.savingsGoal : goal
      ));
      return true;
    }
    
    return false;
  }, [api]);
  
  // Recurring payments
  const addRecurringPayment = useCallback(async (payment: Omit<RecurringPayment, 'id' | 'userId'>): Promise<boolean> => {
    const result = await api.post<{ success: boolean; recurringPayment: RecurringPayment }>(
      '/api/wallet/recurring-payments',
      payment
    );
    
    if (result?.success) {
      setRecurringPayments(prev => [...prev, result.recurringPayment]);
      return true;
    }
    
    return false;
  }, [api]);
  
  const updateRecurringPaymentStatus = useCallback(async (
    paymentId: number, 
    status: RecurringPayment['status']
  ): Promise<boolean> => {
    const result = await api.patch<{ success: boolean; recurringPayment: RecurringPayment }>(
      `/api/wallet/recurring-payments/${paymentId}/status`,
      { status }
    );
    
    if (result?.success) {
      setRecurringPayments(prev => prev.map(payment => 
        payment.id === paymentId ? result.recurringPayment : payment
      ));
      return true;
    }
    
    return false;
  }, [api]);
  
  const deleteRecurringPayment = useCallback(async (paymentId: number): Promise<boolean> => {
    const result = await api.del<{ success: boolean }>(`/api/wallet/recurring-payments/${paymentId}`);
    
    if (result?.success) {
      setRecurringPayments(prev => prev.filter(payment => payment.id !== paymentId));
      return true;
    }
    
    return false;
  }, [api]);
  
  // Provide the context value
  const value: WalletContextData = {
    // State
    currentUser,
    accounts,
    selectedAccount,
    cards,
    paymentMethods,
    childAccounts,
    childTasks,
    childTransactions,
    employeeAccounts,
    payrollEntries,
    employeeTransactions,
    transactions,
    pendingTransactions,
    recurringPayments,
    savingsGoals,
    isLoading: api.isLoading,
    error: api.error,
    
    // Actions
    selectAccount,
    sendMoney,
    requestMoney,
    depositFunds,
    withdrawFunds,
    addCard,
    removeCard,
    updateCardStatus,
    addChildAccount,
    updateChildAllowance,
    updateChildSpendingLimits,
    assignTaskToChild,
    approveChildTask,
    addEmployeeAccount,
    processPayroll,
    updateEmployeeStatus,
    addSavingsGoal,
    updateSavingsGoal,
    completeSavingsGoal,
    addRecurringPayment,
    updateRecurringPaymentStatus,
    deleteRecurringPayment,
    refreshWalletData: fetchWalletData,
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use wallet context
export const useWallet = (): WalletContextData => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Utility function to generate mock data for development
export const generateMockWalletData = (userId: number = 1, role: WalletUser['role'] = 'parent'): WalletContextData => {
  // Generate a mock user
  const user: WalletUser = {
    id: userId,
    email: 'user@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: role,
    status: 'active',
    preferredCurrency: 'USD',
    createdAt: new Date().toISOString(),
    settings: {
      notifications: true,
      twoFactorEnabled: false,
      autoPayEnabled: true,
    },
  };
  
  // Generate mock accounts
  const accounts: WalletAccount[] = [
    {
      id: 1,
      userId: userId,
      name: 'Primary Account',
      type: 'primary',
      balance: 4325.75,
      currency: 'USD',
      isDefault: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      userId: userId,
      name: 'Savings Account',
      type: 'savings',
      balance: 8750.50,
      currency: 'USD',
      isDefault: false,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
  
  // Generate mock transactions
  const transactions: Transaction[] = [
    {
      id: 1,
      userId: userId,
      amount: 125.50,
      description: 'Grocery shopping',
      category: 'Food',
      date: new Date().toISOString(),
      type: 'payment',
      status: 'completed',
      reference: 'TX12345678',
      fromAccountId: 1,
      direction: 'outgoing',
    },
    {
      id: 2,
      userId: userId,
      amount: 2500.00,
      description: 'Salary',
      category: 'Income',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'deposit',
      status: 'completed',
      reference: 'TX87654321',
      toAccountId: 1,
      direction: 'incoming',
    },
    {
      id: 3,
      userId: userId,
      amount: 500.00,
      description: 'Transfer to savings',
      category: 'Transfer',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'transfer',
      status: 'completed',
      reference: 'TX11223344',
      fromAccountId: 1,
      toAccountId: 2,
      direction: 'outgoing',
    }
  ];
  
  // Role-specific mock data
  let childAccounts: ChildAccount[] = [];
  let childTasks: Record<number, Task[]> = {};
  let childTransactions: Record<number, Transaction[]> = {};
  let employeeAccounts: EmployeeAccount[] = [];
  let payrollEntries: PayrollEntry[] = [];
  let employeeTransactions: Record<number, Transaction[]> = {};
  
  if (role === 'parent') {
    childAccounts = [
      {
        id: 1,
        userId: userId,
        childId: 100,
        childName: 'Emma',
        status: 'active',
        allowance: {
          amount: 25.00,
          frequency: 'weekly',
          nextDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        spendingLimits: {
          daily: 10.00,
          weekly: 50.00,
          monthly: 150.00,
        },
        balance: 45.75,
      },
      {
        id: 2,
        userId: userId,
        childId: 101,
        childName: 'Liam',
        status: 'active',
        allowance: {
          amount: 20.00,
          frequency: 'weekly',
          nextDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        spendingLimits: {
          daily: 8.00,
          weekly: 40.00,
          monthly: 120.00,
        },
        balance: 62.25,
      }
    ];
    
    childTasks = {
      100: [
        {
          id: 1,
          name: 'Clean room',
          reward: '$5.00',
          status: 'pending',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          name: 'Homework',
          reward: '$3.00',
          status: 'completed',
          completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ],
      101: [
        {
          id: 3,
          name: 'Take out trash',
          reward: '$2.00',
          status: 'pending',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ]
    };
    
    childTransactions = {
      100: [
        {
          id: 101,
          userId: 100,
          amount: 5.00,
          description: 'Weekly allowance',
          category: 'Allowance',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'allowance',
          status: 'completed',
          reference: 'TX-CHILD-001',
          direction: 'incoming',
        }
      ],
      101: [
        {
          id: 102,
          userId: 101,
          amount: 5.00,
          description: 'Weekly allowance',
          category: 'Allowance',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'allowance',
          status: 'completed',
          reference: 'TX-CHILD-002',
          direction: 'incoming',
        }
      ]
    };
  } else if (role === 'employer') {
    employeeAccounts = [
      {
        id: 1,
        userId: userId,
        employeeId: 201,
        employeeName: 'John Smith',
        status: 'active',
        department: 'Engineering',
        position: 'Software Developer',
        employmentType: 'full-time',
        payrollInfo: {
          salary: 75000,
          payFrequency: 'biweekly',
          nextPayday: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        balance: 0,
      },
      {
        id: 2,
        userId: userId,
        employeeId: 202,
        employeeName: 'Sarah Johnson',
        status: 'active',
        department: 'Marketing',
        position: 'Marketing Manager',
        employmentType: 'full-time',
        payrollInfo: {
          salary: 85000,
          payFrequency: 'biweekly',
          nextPayday: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        balance: 0,
      }
    ];
    
    payrollEntries = [
      {
        id: 1,
        userId: userId,
        employerId: userId,
        employeeId: 201,
        payPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        payPeriodEnd: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        payDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        hoursWorked: 80,
        regularPay: 2884.62,
        overtimePay: 0,
        bonuses: 0,
        commissions: 0,
        grossAmount: 2884.62,
        taxWithholdings: 721.15,
        otherWithholdings: 288.46,
        netAmount: 1875.01,
        status: 'processed',
        notes: '',
      }
    ];
    
    employeeTransactions = {
      201: [
        {
          id: 201,
          userId: 201,
          amount: 1875.01,
          description: 'Payroll',
          category: 'Income',
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'deposit',
          status: 'completed',
          reference: 'PR-001',
          direction: 'incoming',
        }
      ],
      202: []
    };
  }
  
  // Generate mock cards
  const cards: Card[] = [
    {
      id: 1,
      userId: userId,
      cardNumber: '****4321',
      cardType: 'Visa',
      expiryDate: '12/25',
      isDefault: true,
      status: 'active',
      cardholderName: 'TEST USER',
      billingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      },
    }
  ];
  
  // Generate mock payment methods
  const paymentMethods: PaymentMethod[] = [
    {
      id: 1,
      userId: userId,
      type: 'card',
      name: 'Visa ending in 4321',
      isDefault: true,
      status: 'active',
      details: {
        last4: '4321',
        brand: 'visa',
        expMonth: 12,
        expYear: 25,
      },
    },
    {
      id: 2,
      userId: userId,
      type: 'bank_account',
      name: 'Chase Checking',
      isDefault: false,
      status: 'active',
      details: {
        last4: '6789',
        bankName: 'Chase',
        accountType: 'checking',
      },
    }
  ];
  
  // Generate mock recurring payments
  const recurringPayments: RecurringPayment[] = [
    {
      id: 1,
      userId: userId,
      name: 'Netflix Subscription',
      amount: 15.99,
      frequency: 'monthly',
      nextDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      paymentMethod: 'Visa ending in 4321',
      category: 'Entertainment',
      recipientName: 'Netflix, Inc.',
      recipientAccount: 'PAYEE-NETFLIX',
    },
    {
      id: 2,
      userId: userId,
      name: 'Gym Membership',
      amount: 45.00,
      frequency: 'monthly',
      nextDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      paymentMethod: 'Chase Checking',
      category: 'Health',
      recipientName: 'Fitness Center',
      recipientAccount: 'PAYEE-FITNESS',
    }
  ];
  
  // Generate mock savings goals
  const savingsGoals: SavingsGoal[] = [
    {
      id: 1,
      userId: userId,
      name: 'Vacation Fund',
      targetAmount: 2000.00,
      currentAmount: 750.00,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      category: 'Travel',
      description: 'Saving for summer vacation',
    },
    {
      id: 2,
      userId: userId,
      name: 'Emergency Fund',
      targetAmount: 10000.00,
      currentAmount: 5000.00,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      category: 'Emergency',
      description: '6 months of expenses',
    }
  ];
  
  // Return the mock data
  return {
    currentUser: user,
    accounts,
    selectedAccount: accounts[0],
    cards,
    paymentMethods,
    childAccounts,
    childTasks,
    childTransactions,
    employeeAccounts,
    payrollEntries,
    employeeTransactions,
    transactions,
    pendingTransactions: [],
    recurringPayments,
    savingsGoals,
    isLoading: false,
    error: null,
    
    // Mock implementations of actions
    selectAccount: () => {},
    sendMoney: async () => true,
    requestMoney: async () => true,
    depositFunds: async () => true,
    withdrawFunds: async () => true,
    addCard: async () => true,
    removeCard: async () => true,
    updateCardStatus: async () => true,
    addChildAccount: async () => true,
    updateChildAllowance: async () => true,
    updateChildSpendingLimits: async () => true,
    assignTaskToChild: async () => true,
    approveChildTask: async () => true,
    addEmployeeAccount: async () => true,
    processPayroll: async () => true,
    updateEmployeeStatus: async () => true,
    addSavingsGoal: async () => true,
    updateSavingsGoal: async () => true,
    completeSavingsGoal: async () => true,
    addRecurringPayment: async () => true,
    updateRecurringPaymentStatus: async () => true,
    deleteRecurringPayment: async () => true,
    refreshWalletData: async () => {},
  };
};