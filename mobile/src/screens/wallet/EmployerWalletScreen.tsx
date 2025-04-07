import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Divider, Avatar, FAB, Badge, Chip, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import useWallet, { Transaction } from '../../hooks/useWallet';
import { colors, spacing, shadows, borderRadius, walletColorSchemes } from '../../utils/theme';

// Types
type PayrollStatus = 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed';

interface Employee {
  id: number;
  name: string;
  role: string;
  hourlyRate: string;
  hoursWorked: string;
  joinDate: string;
  lastPaid?: string;
  walletId: number;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

interface PayrollRun {
  id: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  status: PayrollStatus;
  totalAmount: string;
  employeeCount: number;
  createdAt: string;
  completedAt?: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

/**
 * EmployerWalletScreen
 * 
 * This screen displays the employer wallet interface where employers can:
 * - View their wallet balance and recent transactions
 * - Manage employees and their payroll settings
 * - Run payroll and view payroll history
 * - Manage payment methods for the business
 */
const EmployerWalletScreen = () => {
  const navigation = useNavigation();
  const { 
    currentWallet, 
    loading,
    error,
    getTransactions,
    getCurrentWalletInfo,
    formatCurrency
  } = useWallet();
  
  // State
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollRun[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  // Load wallet data on mount
  useEffect(() => {
    loadWalletData();
  }, []);
  
  // Load wallet data
  const loadWalletData = async () => {
    try {
      await getCurrentWalletInfo();
      loadTransactions();
      loadEmployees();
      loadPayrollHistory();
      loadPaymentMethods();
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };
  
  // Load recent transactions
  const loadTransactions = async () => {
    try {
      const data = await getTransactions({ limit: 5 });
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };
  
  // Load employees (mock data for now)
  const loadEmployees = () => {
    // Mock data for employees
    const mockEmployees: Employee[] = [
      {
        id: 1,
        name: 'John Doe',
        role: 'Software Developer',
        hourlyRate: '40.00',
        hoursWorked: '160',
        joinDate: new Date(Date.now() - 86400000 * 365).toISOString(), // 1 year ago
        lastPaid: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
        walletId: 101,
        status: 'active',
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'UI/UX Designer',
        hourlyRate: '35.00',
        hoursWorked: '120',
        joinDate: new Date(Date.now() - 86400000 * 180).toISOString(), // 6 months ago
        lastPaid: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
        walletId: 102,
        status: 'active',
      },
      {
        id: 3,
        name: 'Robert Johnson',
        role: 'Project Manager',
        hourlyRate: '45.00',
        hoursWorked: '80',
        joinDate: new Date(Date.now() - 86400000 * 90).toISOString(), // 3 months ago
        lastPaid: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
        walletId: 103,
        status: 'active',
      },
    ];
    
    setEmployees(mockEmployees);
  };
  
  // Load payroll history (mock data for now)
  const loadPayrollHistory = () => {
    // Mock data for payroll history
    const mockPayrollHistory: PayrollRun[] = [
      {
        id: 1,
        payPeriodStart: new Date(Date.now() - 86400000 * 28).toISOString(), // 4 weeks ago
        payPeriodEnd: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
        payDate: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
        status: 'completed',
        totalAmount: '12500.00',
        employeeCount: 3,
        createdAt: new Date(Date.now() - 86400000 * 16).toISOString(), // 16 days ago
        completedAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
      },
      {
        id: 2,
        payPeriodStart: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
        payPeriodEnd: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
        payDate: new Date().toISOString(), // Today
        status: 'scheduled',
        totalAmount: '12500.00',
        employeeCount: 3,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      },
    ];
    
    setPayrollHistory(mockPayrollHistory);
  };
  
  // Load payment methods (mock data for now)
  const loadPaymentMethods = () => {
    // Mock data for payment methods
    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: 1,
        name: 'Business Checking',
        type: 'bank',
        lastFour: '4567',
        isDefault: true,
      },
      {
        id: 2,
        name: 'Business Credit Card',
        type: 'card',
        lastFour: '8901',
        expiryDate: '05/25',
        isDefault: false,
      },
    ];
    
    setPaymentMethods(mockPaymentMethods);
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
      case 'draft':
      case 'scheduled':
        return colors.warning;
      case 'approved':
      case 'completed':
      case 'active':
        return colors.success;
      case 'rejected':
      case 'failed':
      case 'inactive':
        return colors.error;
      case 'processing':
        return colors.primary;
      default:
        return colors.primary;
    }
  };
  
  // Render Tab Navigation
  const renderTabNavigation = () => {
    return (
      <View style={styles.tabContainer}>
        {['overview', 'employees', 'payroll', 'settings'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && { 
                borderBottomWidth: 2,
                borderBottomColor: walletColorSchemes.employer.primary
              }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text 
              style={[
                styles.tabLabel, 
                activeTab === tab && { 
                  color: walletColorSchemes.employer.primary,
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
                onPress={() => navigation.navigate('SendMoneyScreen' as never)}
                style={[styles.actionButton, { backgroundColor: walletColorSchemes.employer.primary }]}
                icon="bank-transfer-out"
              >
                Transfer
              </Button>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('AddPaymentMethodScreen' as never)}
                style={[styles.actionButton, { backgroundColor: walletColorSchemes.employer.secondary }]}
                icon="credit-card-plus-outline"
              >
                Add Funds
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('RunPayrollScreen' as never)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.info }]}>
              <Icon name="cash-multiple" size={24} color="#fff" />
            </View>
            <Text style={styles.quickActionText}>Run Payroll</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('AddEmployeeScreen' as never)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.info }]}>
              <Icon name="account-plus" size={24} color="#fff" />
            </View>
            <Text style={styles.quickActionText}>Add Employee</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => navigation.navigate('PayrollDetailsScreen' as never)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.info }]}>
              <Icon name="calendar-check" size={24} color="#fff" />
            </View>
            <Text style={styles.quickActionText}>Scheduled Payroll</Text>
          </TouchableOpacity>
        </View>
        
        {/* Business Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.cardTitle}>Business Summary</Text>
            <Divider style={{ marginVertical: 10 }} />
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Active Employees</Text>
                <Text style={styles.summaryValue}>{employees.filter(e => e.status === 'active').length}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Next Payroll</Text>
                <Text style={styles.summaryValue}>
                  {payrollHistory.find(p => p.status === 'scheduled')
                    ? formatDate(payrollHistory.find(p => p.status === 'scheduled')!.payDate)
                    : 'Not Scheduled'}
                </Text>
              </View>
            </View>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Hours</Text>
                <Text style={styles.summaryValue}>
                  {employees.reduce((sum, emp) => sum + parseFloat(emp.hoursWorked), 0)} hrs
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Est. Payroll Amount</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(
                    employees
                      .reduce((sum, emp) => sum + parseFloat(emp.hourlyRate) * parseFloat(emp.hoursWorked), 0)
                      .toString()
                  )}
                </Text>
              </View>
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
                      color={walletColorSchemes.employer.primary}
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
                          color: ['deposit', 'payment_received'].includes(transaction.type)
                            ? colors.success
                            : colors.error
                        }
                      ]}
                    >
                      {['deposit', 'payment_received'].includes(transaction.type) ? '+' : '-'}
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
      </View>
    );
  };
  
  // Render Employees Tab
  const renderEmployeesTab = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Team</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddEmployeeScreen' as never)}>
            <Text style={styles.seeAllText}>Add Employee</Text>
          </TouchableOpacity>
        </View>
        
        {employees.length > 0 ? (
          employees.map((employee) => (
            <TouchableOpacity 
              key={employee.id}
              onPress={() => navigation.navigate('EmployeeDetailsScreen' as never, { employeeId: employee.id } as never)}
            >
              <Card style={styles.employeeCard}>
                <Card.Content style={styles.employeeContent}>
                  <View style={styles.employeeAvatarContainer}>
                    <Avatar.Text 
                      size={48} 
                      label={employee.name.charAt(0)} 
                      backgroundColor={walletColorSchemes.employer.primary}
                    />
                    <Chip 
                      style={{ 
                        position: 'absolute',
                        bottom: -5,
                        right: -10,
                        backgroundColor: getStatusColor(employee.status) + '20',
                        height: 20,
                      }}
                    >
                      <Text style={{ 
                        color: getStatusColor(employee.status),
                        fontSize: 10
                      }}>
                        {employee.status.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>
                  
                  <View style={styles.employeeDetails}>
                    <Text style={styles.employeeName}>{employee.name}</Text>
                    <Text style={styles.employeeRole}>{employee.role}</Text>
                    <Text style={styles.employeeJoinDate}>Joined: {formatDate(employee.joinDate)}</Text>
                  </View>
                  
                  <View style={styles.employeeStats}>
                    <View style={styles.employeeStat}>
                      <Text style={styles.employeeStatLabel}>Rate</Text>
                      <Text style={styles.employeeStatValue}>${employee.hourlyRate}/hr</Text>
                    </View>
                    <View style={styles.employeeStat}>
                      <Text style={styles.employeeStatLabel}>Hours</Text>
                      <Text style={styles.employeeStatValue}>{employee.hoursWorked} hrs</Text>
                    </View>
                  </View>
                </Card.Content>
                
                <Divider />
                
                <Card.Actions style={styles.employeeActions}>
                  <Button 
                    mode="text" 
                    onPress={() => navigation.navigate('SendMoneyScreen' as never, { toWalletId: employee.walletId } as never)}
                    icon="bank-transfer"
                    textColor={walletColorSchemes.employer.primary}
                  >
                    Pay Now
                  </Button>
                  <Button 
                    mode="text" 
                    onPress={() => navigation.navigate('EmployeeDetailsScreen' as never, { employeeId: employee.id } as never)}
                    icon="eye"
                    textColor={walletColorSchemes.employer.secondary}
                  >
                    View Details
                  </Button>
                </Card.Actions>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="account-group" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No employees found</Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('AddEmployeeScreen' as never)}
                style={[styles.emptyButton, { backgroundColor: walletColorSchemes.employer.primary }]}
                icon="account-plus"
              >
                Add Employee
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };
  
  // Render Payroll Tab
  const renderPayrollTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Next Payroll Card */}
        {payrollHistory.find(p => p.status === 'scheduled') && (
          <Card style={[styles.payrollCard, { backgroundColor: walletColorSchemes.employer.background }]}>
            <Card.Content>
              <View style={styles.payrollCardHeader}>
                <View>
                  <Text style={styles.payrollCardTitle}>Next Payroll</Text>
                  <Chip 
                    style={{ 
                      backgroundColor: colors.warning + '20',
                      height: 24,
                      marginTop: 5
                    }}
                  >
                    <Text style={{ 
                      color: colors.warning,
                      fontSize: 12
                    }}>
                      SCHEDULED
                    </Text>
                  </Chip>
                </View>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('PayrollDetailsScreen' as never, { 
                    payrollId: payrollHistory.find(p => p.status === 'scheduled')!.id 
                  } as never)}
                  style={[{ backgroundColor: walletColorSchemes.employer.primary }]}
                >
                  Run Now
                </Button>
              </View>
              
              <Divider style={{ marginVertical: 10 }} />
              
              <View style={styles.payrollDetails}>
                <View style={styles.payrollDetail}>
                  <Text style={styles.payrollDetailLabel}>Pay Period</Text>
                  <Text style={styles.payrollDetailValue}>
                    {formatDate(payrollHistory.find(p => p.status === 'scheduled')!.payPeriodStart)} - {formatDate(payrollHistory.find(p => p.status === 'scheduled')!.payPeriodEnd)}
                  </Text>
                </View>
                
                <View style={styles.payrollDetail}>
                  <Text style={styles.payrollDetailLabel}>Pay Date</Text>
                  <Text style={styles.payrollDetailValue}>
                    {formatDate(payrollHistory.find(p => p.status === 'scheduled')!.payDate)}
                  </Text>
                </View>
                
                <View style={styles.payrollDetail}>
                  <Text style={styles.payrollDetailLabel}>Employees</Text>
                  <Text style={styles.payrollDetailValue}>
                    {payrollHistory.find(p => p.status === 'scheduled')!.employeeCount}
                  </Text>
                </View>
                
                <View style={styles.payrollDetail}>
                  <Text style={styles.payrollDetailLabel}>Total Amount</Text>
                  <Text style={styles.payrollDetailValue}>
                    {formatCurrency(payrollHistory.find(p => p.status === 'scheduled')!.totalAmount)}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payroll History</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RunPayrollScreen' as never)}>
            <Text style={styles.seeAllText}>Run New Payroll</Text>
          </TouchableOpacity>
        </View>
        
        {payrollHistory.length > 0 ? (
          payrollHistory.map((payroll) => (
            <TouchableOpacity 
              key={payroll.id}
              onPress={() => navigation.navigate('PayrollDetailsScreen' as never, { payrollId: payroll.id } as never)}
            >
              <Card style={styles.historyCard}>
                <Card.Content>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyPeriod}>
                      <Text style={styles.historyPeriodLabel}>Pay Period</Text>
                      <Text style={styles.historyPeriodValue}>
                        {formatDate(payroll.payPeriodStart)} - {formatDate(payroll.payPeriodEnd)}
                      </Text>
                    </View>
                    
                    <Chip 
                      style={{ 
                        backgroundColor: getStatusColor(payroll.status) + '20',
                        height: 24
                      }}
                    >
                      <Text style={{ 
                        color: getStatusColor(payroll.status),
                        fontSize: 12
                      }}>
                        {payroll.status.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>
                  
                  <Divider style={{ marginVertical: 10 }} />
                  
                  <View style={styles.historyDetails}>
                    <View style={styles.historyDetail}>
                      <Text style={styles.historyDetailLabel}>Pay Date</Text>
                      <Text style={styles.historyDetailValue}>{formatDate(payroll.payDate)}</Text>
                    </View>
                    
                    <View style={styles.historyDetail}>
                      <Text style={styles.historyDetailLabel}>Employees</Text>
                      <Text style={styles.historyDetailValue}>{payroll.employeeCount}</Text>
                    </View>
                    
                    <View style={styles.historyDetail}>
                      <Text style={styles.historyDetailLabel}>Total Amount</Text>
                      <Text style={styles.historyDetailValue}>{formatCurrency(payroll.totalAmount)}</Text>
                    </View>
                    
                    {payroll.completedAt && (
                      <View style={styles.historyDetail}>
                        <Text style={styles.historyDetailLabel}>Completed On</Text>
                        <Text style={styles.historyDetailValue}>{formatDate(payroll.completedAt)}</Text>
                      </View>
                    )}
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="calendar-check" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No payroll history</Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('RunPayrollScreen' as never)}
                style={[styles.emptyButton, { backgroundColor: walletColorSchemes.employer.primary }]}
                icon="cash-multiple"
              >
                Run First Payroll
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };
  
  // Render Settings Tab
  const renderSettingsTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* Payment Methods */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AddPaymentMethodScreen' as never)}>
            <Text style={styles.seeAllText}>Add New</Text>
          </TouchableOpacity>
        </View>
        
        {paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
            <Card key={method.id} style={styles.methodCard}>
              <Card.Content style={styles.methodContent}>
                <View style={styles.methodIconContainer}>
                  <Icon 
                    name={method.type === 'bank' ? 'bank' : 'credit-card'} 
                    size={24} 
                    color={walletColorSchemes.employer.primary}
                  />
                </View>
                <View style={styles.methodDetails}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  <Text style={styles.methodInfo}>
                    {method.type === 'bank' 
                      ? `Bank Account ending in ${method.lastFour}` 
                      : `Card ending in ${method.lastFour}`}
                  </Text>
                  {method.expiryDate && (
                    <Text style={styles.methodExpiry}>Expires: {method.expiryDate}</Text>
                  )}
                </View>
                <View style={styles.methodActions}>
                  {method.isDefault ? (
                    <Chip 
                      style={{ 
                        backgroundColor: colors.success + '20',
                        height: 24
                      }}
                    >
                      <Text style={{ 
                        color: colors.success,
                        fontSize: 12
                      }}>
                        DEFAULT
                      </Text>
                    </Chip>
                  ) : (
                    <Button 
                      mode="text" 
                      onPress={() => console.log('Set as default:', method.id)}
                      textColor={walletColorSchemes.employer.primary}
                      compact
                    >
                      Set Default
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="credit-card" size={48} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No payment methods</Text>
              <Button 
                mode="contained" 
                onPress={() => navigation.navigate('AddPaymentMethodScreen' as never)}
                style={[styles.emptyButton, { backgroundColor: walletColorSchemes.employer.primary }]}
                icon="credit-card-plus"
              >
                Add Payment Method
              </Button>
            </Card.Content>
          </Card>
        )}
        
        {/* Payroll Settings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payroll Settings</Text>
        </View>
        
        <Card style={styles.settingsCard}>
          <Card.Content>
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => console.log('Navigate to payment schedule settings')}
            >
              <Icon name="calendar-clock" size={24} color={walletColorSchemes.employer.primary} />
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Payment Schedule</Text>
                <Text style={styles.settingsItemDescription}>Set your default payroll frequency</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <Divider style={{ marginVertical: 10 }} />
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => console.log('Navigate to tax settings')}
            >
              <Icon name="file-document" size={24} color={walletColorSchemes.employer.primary} />
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Tax Settings</Text>
                <Text style={styles.settingsItemDescription}>Manage tax withholding and reporting</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <Divider style={{ marginVertical: 10 }} />
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => console.log('Navigate to notifications settings')}
            >
              <Icon name="bell" size={24} color={walletColorSchemes.employer.primary} />
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Notifications</Text>
                <Text style={styles.settingsItemDescription}>Manage payroll reminders and alerts</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <Divider style={{ marginVertical: 10 }} />
            
            <TouchableOpacity 
              style={styles.settingsItem}
              onPress={() => console.log('Navigate to business info settings')}
            >
              <Icon name="domain" size={24} color={walletColorSchemes.employer.primary} />
              <View style={styles.settingsItemContent}>
                <Text style={styles.settingsItemTitle}>Business Information</Text>
                <Text style={styles.settingsItemDescription}>Update your company details</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
    );
  };
  
  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'employees':
        return renderEmployeesTab();
      case 'payroll':
        return renderPayrollTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };
  
  // If loading and not refreshing
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={walletColorSchemes.employer.primary} />
        <Text style={styles.loadingText}>Loading employer wallet...</Text>
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
            colors={[walletColorSchemes.employer.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{currentWallet?.name || 'Business Owner'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfileScreen' as never)}
          >
            <Avatar.Text 
              size={40} 
              label={(currentWallet?.name?.charAt(0) || 'B')} 
              backgroundColor={walletColorSchemes.employer.primary}
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
        style={[styles.fab, { backgroundColor: walletColorSchemes.employer.primary }]}
        onPress={() => {
          switch (activeTab) {
            case 'employees':
              navigation.navigate('AddEmployeeScreen' as never);
              break;
            case 'payroll':
              navigation.navigate('RunPayrollScreen' as never);
              break;
            case 'settings':
              navigation.navigate('AddPaymentMethodScreen' as never);
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
    borderBottomColor: colors.border,
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
    backgroundColor: walletColorSchemes.employer.background,
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
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: walletColorSchemes.employer.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.small,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
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
    color: walletColorSchemes.employer.primary,
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
    backgroundColor: walletColorSchemes.employer.background,
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
    marginBottom: spacing.md,
  },
  emptyButton: {
    marginTop: spacing.sm,
  },
  employeeCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  employeeContent: {
    padding: spacing.md,
  },
  employeeAvatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
    alignSelf: 'flex-start',
  },
  employeeDetails: {
    flex: 1,
    marginLeft: 60,
    marginTop: -48,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  employeeRole: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  employeeJoinDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  employeeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  employeeStat: {
    alignItems: 'center',
  },
  employeeStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  employeeStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  employeeActions: {
    justifyContent: 'space-between',
  },
  payrollCard: {
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  payrollCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payrollCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  payrollDetails: {
    marginTop: spacing.sm,
  },
  payrollDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  payrollDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  payrollDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  historyCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyPeriod: {
    flex: 1,
  },
  historyPeriodLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  historyPeriodValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  historyDetails: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  historyDetail: {
    width: '50%',
    marginBottom: spacing.xs,
  },
  historyDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  historyDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  methodCard: {
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  methodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: walletColorSchemes.employer.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  methodInfo: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  methodExpiry: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  methodActions: {
    alignItems: 'flex-end',
  },
  settingsCard: {
    marginBottom: spacing.md,
    ...shadows.small,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingsItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingsItemTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  settingsItemDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default EmployerWalletScreen;