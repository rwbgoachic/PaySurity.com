import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import useApi from './useApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Account entity
export interface Account {
  id: number;
  type: string;
  name: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

// Transaction entity
export interface Transaction {
  id: number;
  accountId: number;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  category?: string;
  merchant?: string;
  date: string;
}

// Contact entity
export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  avatarUrl?: string;
}

// Child entity
export interface Child {
  id: number;
  name: string;
  age?: number;
  avatarUrl?: string;
  accountId: number;
  allowance?: number;
  allowanceFrequency?: 'weekly' | 'biweekly' | 'monthly';
  allowanceNextDate?: string;
}

// Family Group entity
export interface FamilyGroup {
  id: number;
  name: string;
  parentUserId: number;
  secondaryParentUserId?: number;
  createdAt: string;
  updatedAt: string;
}

// Family Member entity
export interface FamilyMember {
  id: number;
  familyGroupId: number;
  userId: number;
  role: 'parent' | 'child' | 'guardian';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Spending Rules entity
export interface SpendingRules {
  id: number;
  childId: number;
  dailyLimit: string;
  weeklyLimit: string;
  monthlyLimit: string;
  perTransactionLimit: string;
  blockedCategories: string[];
  blockedMerchants: string[];
  requireApprovalAmount: string;
  requireApprovalForAll: boolean;
  allowOnlinePurchases: boolean;
  allowInStorePurchases: boolean;
  allowWithdrawals: boolean;
  withdrawalLimit: string;
  createdAt: string;
  updatedAt: string;
}

// Spending Request entity
export interface SpendingRequest {
  id: number;
  childId: number;
  amount: string;
  merchantName: string;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Employee entity
export interface Employee {
  id: number;
  name: string;
  position?: string;
  department?: string;
  employeeId?: string;
  avatarUrl?: string;
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  hireDate?: string;
  accountId: number;
}

// Savings goal entity
export interface SavingsGoal {
  id: number;
  name: string;
  target: number;
  current: number;
  currency: string;
  deadline?: string;
  category?: string;
  accountId: number;
}

// Task entity (for parent-child wallet)
export interface Task {
  id: number;
  name: string;
  reward: string;
  status: 'pending' | 'completed' | 'expired';
  dueDate?: string;
  completedDate?: string;
}

// Payroll entity
export interface Payroll {
  id: number;
  employeeId: number;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  status: 'draft' | 'pending' | 'processed' | 'failed';
  grossAmount: number;
  netAmount: number;
  taxes: number;
  deductions: number;
  currency: string;
}

// Payslip entity
export interface Payslip {
  id: number;
  employeeId: number;
  payrollId: number;
  date: string;
  amount: number;
  status: 'pending' | 'available' | 'disbursed';
  downloadUrl?: string;
}

// Benefit entity
export interface Benefit {
  id: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending';
  enrollmentDate?: string;
  coverageStart?: string;
  coverageEnd?: string;
  cost?: number;
  employerContribution?: number;
  employeeContribution?: number;
}

// Time entry entity
export interface TimeEntry {
  id: number;
  employeeId: number;
  date: string;
  hoursWorked: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

// Expense report entity
export interface ExpenseReport {
  id: number;
  employeeId: number;
  date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed';
  totalAmount: number;
  currency: string;
  purpose?: string;
  approverName?: string;
  reimbursementDate?: string;
}

// Time off request entity
export interface RequestTimeOff {
  id: number;
  employeeId: number;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  approverName?: string;
}

// User profile entity
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  avatarUrl?: string;
  preferences?: {
    notifications?: boolean;
    darkMode?: boolean;
    language?: string;
    currency?: string;
  };
}

// Wallet context state interface
interface WalletContextState {
  isLoading: boolean;
  error: string | null;
  currentUser: UserProfile | null;
  userRoles: string[];
  accounts: Account[];
  transactions: Transaction[];
  contacts: Contact[];
  children: Child[];
  employees: Employee[];
  savingsGoals: SavingsGoal[];
  tasks: Task[];
  payrolls: Payroll[];
  payslips: Payslip[];
  benefits: Benefit[];
  timeEntries: TimeEntry[];
  expenseReports: ExpenseReport[];
  timeOffRequests: RequestTimeOff[];
  loadWalletData: () => Promise<void>;
  refreshWalletData: () => Promise<void>;
  getAccountById: (id: number) => Account | undefined;
  getTransactionsByAccountId: (accountId: number) => Transaction[];
  getSavingsGoalsByAccountId: (accountId: number) => SavingsGoal[];
  clearWalletError: () => void;
  
  // Parent wallet functions
  addChild: (childData: Omit<Child, 'id' | 'accountId'>) => Promise<Child | null>;
  updateChildAllowance: (childId: number, amount: number, frequency: Child['allowanceFrequency']) => Promise<boolean>;
  addTaskForChild: (childId: number, taskData: Omit<Task, 'id'>) => Promise<Task | null>;
  
  // Family wallet system functions
  getFamilyGroups: () => Promise<FamilyGroup[]>;
  createFamilyGroup: (groupData: Omit<FamilyGroup, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FamilyGroup | null>;
  getFamilyMembers: (groupId: number) => Promise<FamilyMember[]>;
  addFamilyMember: (member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FamilyMember | null>;
  getSpendingRules: (childId: number) => Promise<SpendingRules | null>;
  updateSpendingRules: (childId: number, rules: Partial<Omit<SpendingRules, 'id' | 'childId' | 'createdAt' | 'updatedAt'>>) => Promise<SpendingRules | null>;
  getSpendingRequests: (childId?: number) => Promise<SpendingRequest[]>;
  createSpendingRequest: (request: Omit<SpendingRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<SpendingRequest | null>;
  approveSpendingRequest: (requestId: number) => Promise<boolean>;
  rejectSpendingRequest: (requestId: number, notes?: string) => Promise<boolean>;
  
  // Employer wallet functions
  addEmployee: (employeeData: Omit<Employee, 'id' | 'accountId' | 'status'>) => Promise<Employee | null>;
  runPayroll: (payrollData: Omit<Payroll, 'id' | 'status'>) => Promise<Payroll | null>;
  approveTimeEntry: (timeEntryId: number) => Promise<boolean>;
  approveExpenseReport: (expenseReportId: number) => Promise<boolean>;
  approveTimeOffRequest: (requestId: number) => Promise<boolean>;
  
  // Common wallet functions
  createSavingsGoal: (goalData: Omit<SavingsGoal, 'id'>) => Promise<SavingsGoal | null>;
  updateSavingsGoal: (goalId: number, amount: number) => Promise<boolean>;
  createAccount: (accountData: Omit<Account, 'id' | 'balance' | 'lastUpdated'>) => Promise<Account | null>;
  transferMoney: (fromAccountId: number, toAccountId: number, amount: number, description?: string) => Promise<Transaction | null>;
  makePayment: (fromAccountId: number, toMerchant: string, amount: number, category?: string, description?: string) => Promise<Transaction | null>;
  
  // Child wallet functions
  completeTask: (taskId: number) => Promise<boolean>;
  
  // Employee wallet functions
  submitTimeEntry: (timeEntryData: Omit<TimeEntry, 'id' | 'status'>) => Promise<TimeEntry | null>;
  submitExpenseReport: (expenseData: Omit<ExpenseReport, 'id' | 'status' | 'approverName' | 'reimbursementDate'>) => Promise<ExpenseReport | null>;
  requestTimeOff: (requestData: Omit<RequestTimeOff, 'id' | 'status' | 'approverName'>) => Promise<RequestTimeOff | null>;
}

// Create context
export const WalletContext = createContext<WalletContextState | null>(null);

// Provider component
export const WalletProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [childAccounts, setChildAccounts] = useState<Child[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expenseReports, setExpenseReports] = useState<ExpenseReport[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<RequestTimeOff[]>([]);
  
  // Family wallet system state
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [spendingRules, setSpendingRules] = useState<SpendingRules[]>([]);
  const [spendingRequests, setSpendingRequests] = useState<SpendingRequest[]>([]);
  
  const api = useApi();
  
  // Clear error
  const clearWalletError = useCallback(() => {
    setError(null);
  }, []);
  
  // Helpers
  const getAccountById = useCallback((id: number): Account | undefined => {
    return accounts.find(account => account.id === id);
  }, [accounts]);
  
  const getTransactionsByAccountId = useCallback((accountId: number): Transaction[] => {
    return transactions.filter(transaction => transaction.accountId === accountId);
  }, [transactions]);
  
  const getSavingsGoalsByAccountId = useCallback((accountId: number): SavingsGoal[] => {
    return savingsGoals.filter(goal => goal.accountId === accountId);
  }, [savingsGoals]);
  
  // Load wallet data
  const loadWalletData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load user data
      const userData = await api.get<UserProfile>('/api/wallet/user');
      if (userData) {
        setCurrentUser(userData);
        
        // Determine user roles based on user data
        const roles: string[] = [];
        
        // Check if parent role
        const childrenData = await api.get<Child[]>('/api/wallet/children');
        if (childrenData && childrenData.length > 0) {
          roles.push('parent');
          setChildAccounts(childrenData);
        }
        
        // Check if child role
        const parentData = await api.get<{ isChild: boolean }>('/api/wallet/is-child');
        if (parentData && parentData.isChild) {
          roles.push('child');
        }
        
        // Check if employer role
        const employeesData = await api.get<Employee[]>('/api/wallet/employees');
        if (employeesData && employeesData.length > 0) {
          roles.push('employer');
          setEmployees(employeesData);
        }
        
        // Check if employee role
        const employerData = await api.get<{ isEmployee: boolean }>('/api/wallet/is-employee');
        if (employerData && employerData.isEmployee) {
          roles.push('employee');
        }
        
        setUserRoles(roles);
      }
      
      // Load accounts
      const accountsData = await api.get<Account[]>('/api/wallet/accounts');
      if (accountsData) {
        setAccounts(accountsData);
      }
      
      // Load transactions
      const transactionsData = await api.get<Transaction[]>('/api/wallet/transactions');
      if (transactionsData) {
        setTransactions(transactionsData);
      }
      
      // Load contacts
      const contactsData = await api.get<Contact[]>('/api/wallet/contacts');
      if (contactsData) {
        setContacts(contactsData);
      }
      
      // Load savings goals
      const savingsGoalsData = await api.get<SavingsGoal[]>('/api/wallet/savings-goals');
      if (savingsGoalsData) {
        setSavingsGoals(savingsGoalsData);
      }
      
      // Load tasks (if parent or child)
      if (roles.includes('parent') || roles.includes('child')) {
        const tasksData = await api.get<Task[]>('/api/wallet/tasks');
        if (tasksData) {
          setTasks(tasksData);
        }
      }
      
      // Load employer/employee data
      if (roles.includes('employer') || roles.includes('employee')) {
        // Load payrolls
        const payrollsData = await api.get<Payroll[]>('/api/wallet/payrolls');
        if (payrollsData) {
          setPayrolls(payrollsData);
        }
        
        // Load payslips
        const payslipsData = await api.get<Payslip[]>('/api/wallet/payslips');
        if (payslipsData) {
          setPayslips(payslipsData);
        }
        
        // Load benefits
        const benefitsData = await api.get<Benefit[]>('/api/wallet/benefits');
        if (benefitsData) {
          setBenefits(benefitsData);
        }
        
        // Load time entries
        const timeEntriesData = await api.get<TimeEntry[]>('/api/wallet/time-entries');
        if (timeEntriesData) {
          setTimeEntries(timeEntriesData);
        }
        
        // Load expense reports
        const expenseReportsData = await api.get<ExpenseReport[]>('/api/wallet/expense-reports');
        if (expenseReportsData) {
          setExpenseReports(expenseReportsData);
        }
        
        // Load time off requests
        const timeOffRequestsData = await api.get<RequestTimeOff[]>('/api/wallet/time-off-requests');
        if (timeOffRequestsData) {
          setTimeOffRequests(timeOffRequestsData);
        }
      }
      
      // Cache wallet data
      await AsyncStorage.setItem('wallet_data_timestamp', new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
      console.error('Error loading wallet data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);
  
  // Refresh wallet data
  const refreshWalletData = useCallback(async () => {
    await loadWalletData();
  }, [loadWalletData]);
  
  // Check if wallet data needs refreshing on mount
  useEffect(() => {
    const checkDataRefresh = async () => {
      const lastUpdated = await AsyncStorage.getItem('wallet_data_timestamp');
      
      // If no data or data is older than 1 hour, refresh
      if (!lastUpdated) {
        loadWalletData();
        return;
      }
      
      const lastUpdatedDate = new Date(lastUpdated);
      const currentDate = new Date();
      const hourDiff = (currentDate.getTime() - lastUpdatedDate.getTime()) / (1000 * 60 * 60);
      
      if (hourDiff > 1) {
        loadWalletData();
      }
    };
    
    checkDataRefresh();
  }, [loadWalletData]);
  
  // Parent wallet functions
  const addChild = useCallback(async (childData: Omit<Child, 'id' | 'accountId'>): Promise<Child | null> => {
    try {
      const newChild = await api.post<Child>('/api/wallet/children', childData);
      
      if (newChild && !userRoles.includes('parent')) {
        setUserRoles(prev => [...prev, 'parent']);
      }
      
      if (newChild) {
        setChildAccounts(prev => [...prev, newChild]);
      }
      
      return newChild;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add child');
      return null;
    }
  }, [api, userRoles]);
  
  const updateChildAllowance = useCallback(async (
    childId: number, 
    amount: number, 
    frequency: Child['allowanceFrequency']
  ): Promise<boolean> => {
    try {
      const updated = await api.patch<{ success: boolean }>(`/api/wallet/children/${childId}/allowance`, {
        amount,
        frequency
      });
      
      if (updated && updated.success) {
        setChildAccounts(prev => prev.map(child => 
          child.id === childId 
            ? { ...child, allowance: amount, allowanceFrequency: frequency } 
            : child
        ));
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update allowance');
      return false;
    }
  }, [api]);
  
  const addTaskForChild = useCallback(async (
    childId: number, 
    taskData: Omit<Task, 'id'>
  ): Promise<Task | null> => {
    try {
      const newTask = await api.post<Task>(`/api/wallet/children/${childId}/tasks`, taskData);
      
      if (newTask) {
        setTasks(prev => [...prev, newTask]);
      }
      
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
      return null;
    }
  }, [api]);
  
  // Employer wallet functions
  const addEmployee = useCallback(async (
    employeeData: Omit<Employee, 'id' | 'accountId' | 'status'>
  ): Promise<Employee | null> => {
    try {
      const newEmployee = await api.post<Employee>('/api/wallet/employees', {
        ...employeeData,
        status: 'pending'
      });
      
      if (newEmployee && !userRoles.includes('employer')) {
        setUserRoles(prev => [...prev, 'employer']);
      }
      
      if (newEmployee) {
        setEmployees(prev => [...prev, newEmployee]);
      }
      
      return newEmployee;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
      return null;
    }
  }, [api, userRoles]);
  
  const runPayroll = useCallback(async (
    payrollData: Omit<Payroll, 'id' | 'status'>
  ): Promise<Payroll | null> => {
    try {
      const newPayroll = await api.post<Payroll>('/api/wallet/payrolls', {
        ...payrollData,
        status: 'draft'
      });
      
      if (newPayroll) {
        setPayrolls(prev => [...prev, newPayroll]);
      }
      
      return newPayroll;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run payroll');
      return null;
    }
  }, [api]);
  
  const approveTimeEntry = useCallback(async (timeEntryId: number): Promise<boolean> => {
    try {
      const result = await api.patch<{ success: boolean }>(`/api/wallet/time-entries/${timeEntryId}/approve`, {});
      
      if (result && result.success) {
        setTimeEntries(prev => prev.map(entry => 
          entry.id === timeEntryId 
            ? { ...entry, status: 'approved' } 
            : entry
        ));
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve time entry');
      return false;
    }
  }, [api]);
  
  const approveExpenseReport = useCallback(async (expenseReportId: number): Promise<boolean> => {
    try {
      const result = await api.patch<{ success: boolean }>(`/api/wallet/expense-reports/${expenseReportId}/approve`, {});
      
      if (result && result.success) {
        setExpenseReports(prev => prev.map(report => 
          report.id === expenseReportId 
            ? { ...report, status: 'approved' } 
            : report
        ));
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve expense report');
      return false;
    }
  }, [api]);
  
  const approveTimeOffRequest = useCallback(async (requestId: number): Promise<boolean> => {
    try {
      const result = await api.patch<{ success: boolean }>(`/api/wallet/time-off-requests/${requestId}/approve`, {});
      
      if (result && result.success) {
        setTimeOffRequests(prev => prev.map(request => 
          request.id === requestId 
            ? { ...request, status: 'approved' } 
            : request
        ));
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve time off request');
      return false;
    }
  }, [api]);
  
  // Common wallet functions
  const createSavingsGoal = useCallback(async (
    goalData: Omit<SavingsGoal, 'id'>
  ): Promise<SavingsGoal | null> => {
    try {
      const newGoal = await api.post<SavingsGoal>('/api/wallet/savings-goals', goalData);
      
      if (newGoal) {
        setSavingsGoals(prev => [...prev, newGoal]);
      }
      
      return newGoal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create savings goal');
      return null;
    }
  }, [api]);
  
  const updateSavingsGoal = useCallback(async (
    goalId: number, 
    amount: number
  ): Promise<boolean> => {
    try {
      const result = await api.patch<{ success: boolean, current: number }>(`/api/wallet/savings-goals/${goalId}`, {
        amount
      });
      
      if (result && result.success) {
        setSavingsGoals(prev => prev.map(goal => 
          goal.id === goalId 
            ? { ...goal, current: result.current } 
            : goal
        ));
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update savings goal');
      return false;
    }
  }, [api]);
  
  const createAccount = useCallback(async (
    accountData: Omit<Account, 'id' | 'balance' | 'lastUpdated'>
  ): Promise<Account | null> => {
    try {
      const newAccount = await api.post<Account>('/api/wallet/accounts', {
        ...accountData,
        balance: 0,
        lastUpdated: new Date().toISOString()
      });
      
      if (newAccount) {
        setAccounts(prev => [...prev, newAccount]);
      }
      
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      return null;
    }
  }, [api]);
  
  const transferMoney = useCallback(async (
    fromAccountId: number, 
    toAccountId: number, 
    amount: number, 
    description?: string
  ): Promise<Transaction | null> => {
    try {
      const transaction = await api.post<{
        transaction: Transaction,
        fromAccount: Account,
        toAccount: Account
      }>('/api/wallet/transfer', {
        fromAccountId,
        toAccountId,
        amount,
        description: description || 'Transfer'
      });
      
      if (transaction) {
        setTransactions(prev => [...prev, transaction.transaction]);
        
        // Update account balances
        setAccounts(prev => prev.map(account => {
          if (account.id === fromAccountId) {
            return transaction.fromAccount;
          }
          if (account.id === toAccountId) {
            return transaction.toAccount;
          }
          return account;
        }));
        
        return transaction.transaction;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer money');
      return null;
    }
  }, [api]);
  
  const makePayment = useCallback(async (
    fromAccountId: number, 
    toMerchant: string, 
    amount: number, 
    category?: string, 
    description?: string
  ): Promise<Transaction | null> => {
    try {
      const result = await api.post<{
        transaction: Transaction,
        fromAccount: Account
      }>('/api/wallet/payment', {
        fromAccountId,
        toMerchant,
        amount,
        category,
        description: description || `Payment to ${toMerchant}`
      });
      
      if (result) {
        setTransactions(prev => [...prev, result.transaction]);
        
        // Update account balance
        setAccounts(prev => prev.map(account => 
          account.id === fromAccountId 
            ? result.fromAccount 
            : account
        ));
        
        return result.transaction;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make payment');
      return null;
    }
  }, [api]);
  
  // Child wallet functions
  const completeTask = useCallback(async (taskId: number): Promise<boolean> => {
    try {
      const result = await api.patch<{
        success: boolean,
        task: Task,
        transaction?: Transaction,
        account?: Account
      }>(`/api/wallet/tasks/${taskId}/complete`, {});
      
      if (result && result.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? result.task 
            : task
        ));
        
        if (result.transaction && result.account) {
          setTransactions(prev => [...prev, result.transaction]);
          setAccounts(prev => prev.map(account => 
            account.id === result.account!.id 
              ? result.account! 
              : account
          ));
        }
        
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
      return false;
    }
  }, [api]);
  
  // Employee wallet functions
  const submitTimeEntry = useCallback(async (
    timeEntryData: Omit<TimeEntry, 'id' | 'status'>
  ): Promise<TimeEntry | null> => {
    try {
      const newTimeEntry = await api.post<TimeEntry>('/api/wallet/time-entries', {
        ...timeEntryData,
        status: 'pending'
      });
      
      if (newTimeEntry) {
        setTimeEntries(prev => [...prev, newTimeEntry]);
      }
      
      return newTimeEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit time entry');
      return null;
    }
  }, [api]);
  
  const submitExpenseReport = useCallback(async (
    expenseData: Omit<ExpenseReport, 'id' | 'status' | 'approverName' | 'reimbursementDate'>
  ): Promise<ExpenseReport | null> => {
    try {
      const newExpense = await api.post<ExpenseReport>('/api/wallet/expense-reports', {
        ...expenseData,
        status: 'submitted'
      });
      
      if (newExpense) {
        setExpenseReports(prev => [...prev, newExpense]);
      }
      
      return newExpense;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit expense report');
      return null;
    }
  }, [api]);
  
  const requestTimeOff = useCallback(async (
    requestData: Omit<RequestTimeOff, 'id' | 'status' | 'approverName'>
  ): Promise<RequestTimeOff | null> => {
    try {
      const newRequest = await api.post<RequestTimeOff>('/api/wallet/time-off-requests', {
        ...requestData,
        status: 'pending'
      });
      
      if (newRequest) {
        setTimeOffRequests(prev => [...prev, newRequest]);
      }
      
      return newRequest;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request time off');
      return null;
    }
  }, [api]);
  
  const contextValue: WalletContextState = {
    isLoading,
    error,
    currentUser,
    userRoles,
    accounts,
    transactions,
    contacts,
    children: childAccounts,
    employees,
    savingsGoals,
    tasks,
    payrolls,
    payslips,
    benefits,
    timeEntries,
    expenseReports,
    timeOffRequests,
    loadWalletData,
    refreshWalletData,
    getAccountById,
    getTransactionsByAccountId,
    getSavingsGoalsByAccountId,
    clearWalletError,
    
    // Parent wallet functions
    addChild,
    updateChildAllowance,
    addTaskForChild,
    
    // Employer wallet functions
    addEmployee,
    runPayroll,
    approveTimeEntry,
    approveExpenseReport,
    approveTimeOffRequest,
    
    // Common wallet functions
    createSavingsGoal,
    updateSavingsGoal,
    createAccount,
    transferMoney,
    makePayment,
    
    // Child wallet functions
    completeTask,
    
    // Employee wallet functions
    submitTimeEntry,
    submitExpenseReport,
    requestTimeOff,
  };
  
  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook
export const useWallet = () => {
  const context = useContext(WalletContext);
  
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
};