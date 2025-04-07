import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Divider, Avatar, FAB, Badge, Chip, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import useWallet, { Transaction } from '../../hooks/useWallet';
import { colors, spacing, shadows, borderRadius, walletColorSchemes } from '../../utils/theme';

/**
 * Types for Employee Wallet functionality
 */
interface TimeEntry {
  id: number;
  date: string;
  hoursWorked: string;
  project: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface ExpenseReport {
  id: number;
  date: string;
  amount: string;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
}

interface Payslip {
  id: number;
  employerId: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  grossAmount: string;
  deductions: string;
  netAmount: string;
  status: 'pending' | 'completed';
  hoursWorked: string;
  notes?: string;
  createdAt: string;
  documents?: string[];
}

interface Benefit {
  id: number;
  name: string;
  type: 'health' | 'retirement' | 'insurance' | 'other';
  description: string;
  status: 'active' | 'inactive';
  coverage?: string;
  details?: any;
}

/**
 * EmployeeWalletScreen
 * This screen displays the employee wallet interface where employees can:
 * - View their wallet balance and recent transactions
 * - View and submit time entries
 * - Submit expense reports for reimbursement
 * - Access payroll information and benefits
 */
const EmployeeWalletScreen = () => {
  const navigation = useNavigation();
  const { 
    currentWallet, 
    loading, 
    error, 
    getTransactions, 
    getCurrentWalletInfo,
    formatCurrency 
  } = useWallet();
  
  // State variables
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [expenseReports, setExpenseReports] = useState<ExpenseReport[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  
  // Load data on mount
  useEffect(() => {
    loadWalletData();
  }, []);
  
  // Load wallet data
  const loadWalletData = async () => {
    try {
      await getCurrentWalletInfo();
      loadTransactions();
      loadTimeEntries();
      loadExpenseReports();
      loadPayslips();
      loadBenefits();
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };
  
  // Load transactions
  const loadTransactions = async () => {
    try {
      const data = await getTransactions({ limit: 5 });
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };
  
  // Load time entries (mock data for now)
  const loadTimeEntries = () => {
    // Mock data for time entries
    const mockTimeEntries: TimeEntry[] = [
      {
        id: 1,
        date: new Date().toISOString(),
        hoursWorked: '8',
        project: 'Mobile App Development',
        status: 'approved',
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        hoursWorked: '7.5',
        project: 'Client Meeting',
        status: 'approved',
      },
      {
        id: 3,
        date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        hoursWorked: '8',
        project: 'UI Design',
        status: 'approved',
      },
    ];
    
    setTimeEntries(mockTimeEntries);
  };
  
  // Load expense reports (mock data for now)
  const loadExpenseReports = () => {
    // Mock data for expense reports
    const mockExpenseReports: ExpenseReport[] = [
      {
        id: 1,
        date: new Date().toISOString(),
        amount: '42.99',
        category: 'Meals',
        description: 'Lunch with client',
        status: 'pending',
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        amount: '145.00',
        category: 'Transportation',
        description: 'Uber to client office',
        status: 'approved',
      },
    ];
    
    setExpenseReports(mockExpenseReports);
  };
  
  // Load payslips (mock data for now)
  const loadPayslips = () => {
    // Mock data for payslips
    const mockPayslips: Payslip[] = [
      {
        id: 1,
        employerId: 1,
        payPeriodStart: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
        payPeriodEnd: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        payDate: new Date().toISOString(),
        grossAmount: '2500.00',
        deductions: '650.00',
        netAmount: '1850.00',
        status: 'completed',
        hoursWorked: '80',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        employerId: 1,
        payPeriodStart: new Date(Date.now() - 86400000 * 28).toISOString(), // 4 weeks ago
        payPeriodEnd: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
        payDate: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
        grossAmount: '2500.00',
        deductions: '650.00',
        netAmount: '1850.00',
        status: 'completed',
        hoursWorked: '80',
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
      },
    ];
    
    setPayslips(mockPayslips);
  };
  
  // Load benefits (mock data for now)
  const loadBenefits = () => {
    // Mock data for benefits
    const mockBenefits: Benefit[] = [
      {
        id: 1,
        name: 'Health Insurance',
        type: 'health',
        description: 'Comprehensive health coverage',
        status: 'active',
        coverage: '80%',
      },
      {
        id: 2,
        name: '401k Retirement',
        type: 'retirement',
        description: 'Retirement savings plan',
        status: 'active',
        coverage: '5% employer match',
      },
      {
        id: 3,
        name: 'Dental Coverage',
        type: 'health',
        description: 'Dental insurance coverage',
        status: 'active',
        coverage: '70%',
      },
    ];
    
    setBenefits(mockBenefits);
  };
  
  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  }, []);
  
  // Navigate to transaction details
  const goToTransactionDetails = (transaction: Transaction) => {
    navigation.navigate('TransactionDetailsScreen' as never, { transactionId: transaction.id } as never);
  };
  
  // Get card icon for transaction type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bank-transfer-in';
      case 'withdrawal':
        return 'bank-transfer-out';
      case 'transfer':
        return 'bank-transfer';
      case 'payment':
        return 'credit-card-outline';
      case 'payment_received':
        return 'cash-plus';
      case 'expense_reimbursement':
        return 'cash-refund';
      case 'payroll':
        return 'cash-multiple';
      default:
        return 'cash';
    }
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'approved':
      case 'completed':
        return colors.success;
      case 'rejected':
      case 'failed':
        return colors.error;
      default:
        return colors.primary;
    }
  };
  
  // Render Tab Navigation
  const renderTabNavigation = () => {
    return (
      <View style={styles.tabContainer}>
        {['overview', 'hours', 'expenses', 'payroll', 'benefits'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && { 
                borderBottomWidth: 2,
                borderBottomColor: walletColorSchemes.employee.primary
              }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text 
              style={[
                styles.tabLabel, 
                activeTab === tab && { 
                  color: walletColorSchemes.employee.primary,
                  fontWeight: 'bold'
                }
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  // Render Overview Tab
  const renderOverviewTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Balance Card */}
        <Card style={styles.walletCard}>
          <Card.Content>
            <Text style={styles.walletLabel}>Available Balance</Text>
            <Text style={styles.walletBalance}>
              {currentWallet ? formatCurrency(currentWallet.balance) : '$0.00'}
            </Text>
            
            <View style={styles.walletActions}>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('RequestMoneyScreen' as never)}
                style={[styles.actionButton, { backgroundColor: walletColorSchemes.employee.primary }]}
                icon="cash-refund"
              >
                Request
              </Button>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('SendMoneyScreen' as never)}
                style={[styles.actionButton, { backgroundColor: walletColorSchemes.employee.secondary }]}
                icon="send"
              >
                Send
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionsScreen' as never)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TouchableOpacity 
              key={transaction.id}
              onPress={() => goToTransactionDetails(transaction)}
            >
              <Card style={styles.transactionCard}>
                <Card.Content style={styles.transactionContent}>
                  <View style={styles.transactionIconContainer}>
                    <Icon 
                      name={getTransactionIcon(transaction.type)} 
                      size={24} 
                      color={walletColorSchemes.employee.primary}
                    />
                  </View>
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.createdAt)}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text 
                      style={[
                        styles.amountText,
                        {
                          color: ['deposit', 'payment_received', 'expense_reimbursement', 'payroll'].includes(transaction.type)
                            ? colors.success
                            : colors.error
                        }
                      ]}
                    >
                      {['deposit', 'payment_received', 'expense_reimbursement', 'payroll'].includes(transaction.type) ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                    <Chip 
                      style={{ 
                        backgroundColor: getStatusColor(transaction.status) + '20', 
                        height: 24
                      }}
                    >
                      <Text style={{ 
                        color: getStatusColor(transaction.status),
                        fontSize: 12
                      }}>
                        {transaction.status.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="cash" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No recent transactions</Text>
            </Card.Content>
          </Card>
        )}
        
        {/* Time Entry Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Time Entry Summary</Text>
          <TouchableOpacity onPress={() => setActiveTab('hours')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Hours This Week</Text>
                <Text style={styles.summaryValue}>{timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hoursWorked), 0)} hrs</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Hours This Month</Text>
                <Text style={styles.summaryValue}>78.5 hrs</Text>
              </View>
            </View>
            <View style={styles.summaryProgress}>
              <Text style={styles.progressLabel}>Weekly Goal (40 hrs)</Text>
              <ProgressBar 
                progress={timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hoursWorked), 0) / 40} 
                color={walletColorSchemes.employee.primary}
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>
        
        {/* Expense Report Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expense Reports</Text>
          <TouchableOpacity onPress={() => setActiveTab('expenses')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {expenseReports.length > 0 ? (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <View style={styles.expenseSummary}>
                <View style={styles.expenseItem}>
                  <Badge size={24} style={{ backgroundColor: colors.warning }}>
                    {expenseReports.filter(report => report.status === 'pending').length}
                  </Badge>
                  <Text style={styles.expenseLabel}>Pending</Text>
                </View>
                <View style={styles.expenseItem}>
                  <Badge size={24} style={{ backgroundColor: colors.success }}>
                    {expenseReports.filter(report => report.status === 'approved').length}
                  </Badge>
                  <Text style={styles.expenseLabel}>Approved</Text>
                </View>
                <View style={styles.expenseItem}>
                  <Badge size={24} style={{ backgroundColor: colors.error }}>
                    {expenseReports.filter(report => report.status === 'rejected').length}
                  </Badge>
                  <Text style={styles.expenseLabel}>Rejected</Text>
                </View>
              </View>
              
              <Divider style={{ marginVertical: 10 }} />
              
              <Text style={styles.recentLabel}>Recent Reports</Text>
              {expenseReports.slice(0, 2).map(report => (
                <View key={report.id} style={styles.expenseRow}>
                  <View>
                    <Text style={styles.expenseDescription}>{report.description}</Text>
                    <Text style={styles.expenseDate}>{formatDate(report.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.expenseAmount}>{formatCurrency(report.amount)}</Text>
                    <Chip 
                      style={{ 
                        backgroundColor: getStatusColor(report.status) + '20',
                        height: 24
                      }}
                    >
                      <Text style={{ 
                        color: getStatusColor(report.status),
                        fontSize: 12
                      }}>
                        {report.status.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="receipt" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No expense reports</Text>
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };
  
  // Render Hours Tab
  const renderHoursTab = () => {
    return (
      <View style={styles.tabContent}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Hours This Week</Text>
                <Text style={styles.summaryValue}>{timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hoursWorked), 0)} hrs</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Hours This Month</Text>
                <Text style={styles.summaryValue}>78.5 hrs</Text>
              </View>
            </View>
            <View style={styles.summaryProgress}>
              <Text style={styles.progressLabel}>Weekly Goal (40 hrs)</Text>
              <ProgressBar 
                progress={timeEntries.reduce((sum, entry) => sum + parseFloat(entry.hoursWorked), 0) / 40} 
                color={walletColorSchemes.employee.primary}
                style={styles.progressBar}
              />
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Time Entries</Text>
        </View>
        
        {timeEntries.length > 0 ? (
          timeEntries.map(entry => (
            <Card key={entry.id} style={styles.entryCard}>
              <Card.Content>
                <View style={styles.entryRow}>
                  <View>
                    <Text style={styles.entryProject}>{entry.project}</Text>
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.entryHours}>{entry.hoursWorked} hrs</Text>
                    <Chip 
                      style={{ 
                        backgroundColor: getStatusColor(entry.status) + '20',
                        height: 24
                      }}
                    >
                      <Text style={{ 
                        color: getStatusColor(entry.status),
                        fontSize: 12
                      }}>
                        {entry.status.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>
                </View>
                {entry.notes && (
                  <Text style={styles.entryNotes}>{entry.notes}</Text>
                )}
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="clock-outline" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No time entries</Text>
            </Card.Content>
          </Card>
        )}
        
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('SubmitTimeEntryScreen' as never)}
          style={[styles.addButton, { backgroundColor: walletColorSchemes.employee.primary }]}
          icon="plus"
        >
          Add Time Entry
        </Button>
      </View>
    );
  };
  
  // Render Expenses Tab
  const renderExpensesTab = () => {
    return (
      <View style={styles.tabContent}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.expenseSummary}>
              <View style={styles.expenseItem}>
                <Badge size={24} style={{ backgroundColor: colors.warning }}>
                  {expenseReports.filter(report => report.status === 'pending').length}
                </Badge>
                <Text style={styles.expenseLabel}>Pending</Text>
              </View>
              <View style={styles.expenseItem}>
                <Badge size={24} style={{ backgroundColor: colors.success }}>
                  {expenseReports.filter(report => report.status === 'approved').length}
                </Badge>
                <Text style={styles.expenseLabel}>Approved</Text>
              </View>
              <View style={styles.expenseItem}>
                <Badge size={24} style={{ backgroundColor: colors.error }}>
                  {expenseReports.filter(report => report.status === 'rejected').length}
                </Badge>
                <Text style={styles.expenseLabel}>Rejected</Text>
              </View>
            </View>
            <Divider style={{ marginVertical: 10 }} />
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Expenses This Month</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(
                    expenseReports
                      .reduce((sum, report) => sum + parseFloat(report.amount), 0)
                      .toString()
                  )}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Pending Reimbursement</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(
                    expenseReports
                      .filter(report => report.status === 'pending')
                      .reduce((sum, report) => sum + parseFloat(report.amount), 0)
                      .toString()
                  )}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Expense Reports</Text>
        </View>
        
        {expenseReports.length > 0 ? (
          expenseReports.map(report => (
            <Card key={report.id} style={styles.entryCard}>
              <Card.Content>
                <View style={styles.entryRow}>
                  <View>
                    <Text style={styles.entryProject}>{report.description}</Text>
                    <Text style={styles.entryDate}>{formatDate(report.date)}</Text>
                    <Text style={styles.entryCategory}>{report.category}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.entryHours}>{formatCurrency(report.amount)}</Text>
                    <Chip 
                      style={{ 
                        backgroundColor: getStatusColor(report.status) + '20',
                        height: 24
                      }}
                    >
                      <Text style={{ 
                        color: getStatusColor(report.status),
                        fontSize: 12
                      }}>
                        {report.status.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>
                </View>
                {report.receiptUrl && (
                  <TouchableOpacity style={styles.receiptButton}>
                    <Icon name="file-document-outline" size={16} color={walletColorSchemes.employee.primary} />
                    <Text style={styles.receiptText}>View Receipt</Text>
                  </TouchableOpacity>
                )}
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="receipt" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No expense reports</Text>
            </Card.Content>
          </Card>
        )}
        
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('CreateExpenseReportScreen' as never)}
          style={[styles.addButton, { backgroundColor: walletColorSchemes.employee.primary }]}
          icon="plus"
        >
          Create Expense Report
        </Button>
      </View>
    );
  };
  
  // Render Payroll Tab
  const renderPayrollTab = () => {
    return (
      <View style={styles.tabContent}>
        {payslips.length > 0 ? (
          <>
            <Card style={[styles.summaryCard, { marginBottom: 20 }]}>
              <Card.Content>
                <Text style={styles.payrollCardTitle}>Latest Payslip</Text>
                <Text style={styles.payslipDate}>
                  Pay Period: {formatDate(payslips[0].payPeriodStart)} - {formatDate(payslips[0].payPeriodEnd)}
                </Text>
                <Divider style={{ marginVertical: 10 }} />
                <View style={styles.payslipRow}>
                  <Text style={styles.payslipLabel}>Gross Pay:</Text>
                  <Text style={styles.payslipValue}>{formatCurrency(payslips[0].grossAmount)}</Text>
                </View>
                <View style={styles.payslipRow}>
                  <Text style={styles.payslipLabel}>Deductions:</Text>
                  <Text style={styles.payslipValue}>-{formatCurrency(payslips[0].deductions)}</Text>
                </View>
                <Divider style={{ marginVertical: 10 }} />
                <View style={styles.payslipRow}>
                  <Text style={styles.payslipTotal}>Net Pay:</Text>
                  <Text style={styles.payslipTotalValue}>{formatCurrency(payslips[0].netAmount)}</Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('PayslipDetailsScreen' as never, { payslipId: payslips[0].id } as never)}
                  style={styles.viewDetailsButton}
                >
                  View Details
                </Button>
              </Card.Content>
            </Card>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment History</Text>
            </View>
            
            {payslips.slice(1).map(payslip => (
              <TouchableOpacity
                key={payslip.id}
                onPress={() => navigation.navigate('PayslipDetailsScreen' as never, { payslipId: payslip.id } as never)}
              >
                <Card style={styles.entryCard}>
                  <Card.Content>
                    <View style={styles.entryRow}>
                      <View>
                        <Text style={styles.entryProject}>
                          {formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}
                        </Text>
                        <Text style={styles.entryDate}>Paid on {formatDate(payslip.payDate)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.entryHours}>{formatCurrency(payslip.netAmount)}</Text>
                        <Chip 
                          style={{ 
                            backgroundColor: getStatusColor(payslip.status) + '20',
                            height: 24
                          }}
                        >
                          <Text style={{ 
                            color: getStatusColor(payslip.status),
                            fontSize: 12
                          }}>
                            {payslip.status.toUpperCase()}
                          </Text>
                        </Chip>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="cash-multiple" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No payslips available</Text>
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };
  
  // Render Benefits Tab
  const renderBenefitsTab = () => {
    return (
      <View style={styles.tabContent}>
        {benefits.length > 0 ? (
          <>
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.benefitsSummaryTitle}>Your Benefits Summary</Text>
                <Divider style={{ marginVertical: 10 }} />
                <View style={styles.benefitsGrid}>
                  {benefits.map(benefit => (
                    <TouchableOpacity
                      key={benefit.id}
                      style={styles.benefitItem}
                      onPress={() => navigation.navigate('BenefitDetailsScreen' as never, { benefitId: benefit.id } as never)}
                    >
                      <View style={[
                        styles.benefitIcon,
                        { backgroundColor: getBenefitColor(benefit.type) }
                      ]}>
                        <Icon name={getBenefitIcon(benefit.type)} size={24} color="#fff" />
                      </View>
                      <Text style={styles.benefitName}>{benefit.name}</Text>
                      <Chip 
                        style={{ 
                          backgroundColor: benefit.status === 'active' ? colors.success + '20' : colors.error + '20',
                          height: 20,
                          marginTop: 5
                        }}
                      >
                        <Text style={{ 
                          color: benefit.status === 'active' ? colors.success : colors.error,
                          fontSize: 10
                        }}>
                          {benefit.status.toUpperCase()}
                        </Text>
                      </Chip>
                    </TouchableOpacity>
                  ))}
                </View>
              </Card.Content>
            </Card>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Benefit Details</Text>
            </View>
            
            {benefits.map(benefit => (
              <TouchableOpacity
                key={benefit.id}
                onPress={() => navigation.navigate('BenefitDetailsScreen' as never, { benefitId: benefit.id } as never)}
              >
                <Card style={styles.entryCard}>
                  <Card.Content>
                    <View style={styles.benefitRow}>
                      <View style={[
                        styles.benefitRowIcon,
                        { backgroundColor: getBenefitColor(benefit.type) }
                      ]}>
                        <Icon name={getBenefitIcon(benefit.type)} size={20} color="#fff" />
                      </View>
                      <View style={styles.benefitDetails}>
                        <Text style={styles.benefitTitle}>{benefit.name}</Text>
                        <Text style={styles.benefitDescription}>{benefit.description}</Text>
                        {benefit.coverage && (
                          <Text style={styles.benefitCoverage}>Coverage: {benefit.coverage}</Text>
                        )}
                      </View>
                      <Chip 
                        style={{ 
                          backgroundColor: benefit.status === 'active' ? colors.success + '20' : colors.error + '20',
                          height: 24
                        }}
                      >
                        <Text style={{ 
                          color: benefit.status === 'active' ? colors.success : colors.error,
                          fontSize: 12
                        }}>
                          {benefit.status.toUpperCase()}
                        </Text>
                      </Chip>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="shield-account" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No benefits available</Text>
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };
  
  // Get benefit icon based on type
  const getBenefitIcon = (type: string): string => {
    switch (type) {
      case 'health':
        return 'hospital-box';
      case 'retirement':
        return 'piggy-bank';
      case 'insurance':
        return 'shield-account';
      default:
        return 'package-variant';
    }
  };
  
  // Get benefit color based on type
  const getBenefitColor = (type: string): string => {
    switch (type) {
      case 'health':
        return '#E74C3C';
      case 'retirement':
        return '#3498DB';
      case 'insurance':
        return '#9B59B6';
      default:
        return '#2ECC71';
    }
  };
  
  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'hours':
        return renderHoursTab();
      case 'expenses':
        return renderExpensesTab();
      case 'payroll':
        return renderPayrollTab();
      case 'benefits':
        return renderBenefitsTab();
      default:
        return renderOverviewTab();
    }
  };
  
  // If loading and not refreshing
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={walletColorSchemes.employee.primary} />
        <Text style={styles.loadingText}>Loading employee wallet...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[walletColorSchemes.employee.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{currentWallet?.name || 'Employee'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfileScreen' as never)}
          >
            <Avatar.Text 
              size={40} 
              label={(currentWallet?.name?.charAt(0) || 'E')} 
              backgroundColor={walletColorSchemes.employee.primary}
            />
          </TouchableOpacity>
        </View>
        
        {/* Tab Navigation */}
        {renderTabNavigation()}
        
        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
      
      {/* FAB */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: walletColorSchemes.employee.primary }]}
        onPress={() => {
          switch (activeTab) {
            case 'hours':
              navigation.navigate('SubmitTimeEntryScreen' as never);
              break;
            case 'expenses':
              navigation.navigate('CreateExpenseReportScreen' as never);
              break;
            default:
              navigation.navigate('SendMoneyScreen' as never);
              break;
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileButton: {
    ...shadows.small,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
    marginBottom: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  walletCard: {
    marginBottom: spacing.md,
    ...shadows.medium,
    backgroundColor: walletColorSchemes.employee.background,
  },
  walletLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginVertical: spacing.sm,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllText: {
    color: walletColorSchemes.employee.primary,
    fontWeight: '500',
  },
  transactionCard: {
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: walletColorSchemes.employee.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryProgress: {
    marginTop: spacing.md,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  expenseSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  expenseItem: {
    alignItems: 'center',
  },
  expenseLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  recentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  expenseDescription: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  expenseDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  emptyCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  emptyContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  entryCard: {
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryProject: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  entryDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  entryCategory: {
    fontSize: 12,
    color: walletColorSchemes.employee.primary,
    marginTop: 2,
  },
  entryHours: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  entryNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  receiptText: {
    fontSize: 12,
    color: walletColorSchemes.employee.primary,
    marginLeft: 4,
  },
  addButton: {
    marginVertical: spacing.md,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  payrollCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  payslipDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  payslipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  payslipLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  payslipValue: {
    fontSize: 14,
    color: colors.text,
  },
  payslipTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  payslipTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  viewDetailsButton: {
    marginTop: spacing.md,
    borderColor: walletColorSchemes.employee.primary,
  },
  benefitsSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  benefitItem: {
    width: '48%',
    padding: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
  },
  benefitIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitRowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  benefitDetails: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  benefitDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  benefitCoverage: {
    fontSize: 12,
    color: walletColorSchemes.employee.primary,
    marginTop: 2,
  },
});

export default EmployeeWalletScreen;