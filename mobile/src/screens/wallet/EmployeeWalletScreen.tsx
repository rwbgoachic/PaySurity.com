import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Card, Text, Title, Paragraph, Button, Divider, List, Avatar, FAB, Surface, ProgressBar, Chip, Badge, DataTable } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Employee Wallet Screen
const EmployeeWalletScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'payroll' | 'benefits' | 'expenses'>('overview');
  
  // Sample data for demonstration
  const employeeInfo = {
    name: 'John Smith',
    position: 'Software Engineer',
    company: 'Acme Corporation',
    balance: '3250.75',
    nextPayDate: '2025-04-15',
    expectedPay: '5500.00',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    companyLogo: 'https://randomuser.me/api/portraits/men/32.jpg',
  };
  
  const transactions = [
    {
      id: 1,
      type: 'payroll',
      amount: '5500.00',
      description: 'March 2025 Salary',
      date: '2025-03-15',
      status: 'completed'
    },
    {
      id: 2,
      type: 'expense_reimbursement',
      amount: '250.75',
      description: 'Client Meeting Expenses',
      date: '2025-03-20',
      status: 'completed'
    },
    {
      id: 3,
      type: 'bonus',
      amount: '1000.00',
      description: 'Q1 Performance Bonus',
      date: '2025-03-31',
      status: 'completed'
    },
    {
      id: 4,
      type: 'withdrawal',
      amount: '3500.00',
      description: 'Transfer to Bank Account',
      date: '2025-04-01',
      status: 'completed'
    }
  ];
  
  const payslips = [
    {
      id: 1,
      period: 'March 2025',
      date: '2025-03-15',
      grossAmount: '5500.00',
      netAmount: '4235.00',
      taxes: '1100.00',
      benefits: '165.00',
      status: 'paid'
    },
    {
      id: 2,
      period: 'February 2025',
      date: '2025-02-15',
      grossAmount: '5500.00',
      netAmount: '4235.00',
      taxes: '1100.00',
      benefits: '165.00',
      status: 'paid'
    },
    {
      id: 3,
      period: 'January 2025',
      date: '2025-01-15',
      grossAmount: '5500.00',
      netAmount: '4235.00',
      taxes: '1100.00',
      benefits: '165.00',
      status: 'paid'
    }
  ];
  
  const benefits = [
    {
      id: 1,
      name: 'Health Insurance',
      provider: 'BlueCross Health',
      monthlyDeduction: '120.00',
      coverage: 'Full Family Plan',
      status: 'active',
      icon: 'medical-bag'
    },
    {
      id: 2,
      name: '401(k) Retirement',
      provider: 'Fidelity Investments',
      monthlyDeduction: '275.00',
      employerMatch: '275.00',
      status: 'active',
      icon: 'piggy-bank'
    },
    {
      id: 3,
      name: 'Dental Insurance',
      provider: 'Delta Dental',
      monthlyDeduction: '25.00',
      coverage: 'Individual Plan',
      status: 'active',
      icon: 'tooth'
    },
    {
      id: 4,
      name: 'Vision Insurance',
      provider: 'Vision Care Plus',
      monthlyDeduction: '20.00',
      coverage: 'Individual Plan',
      status: 'active',
      icon: 'eye'
    }
  ];
  
  const pendingExpenses = [
    {
      id: 1,
      description: 'Client Meeting',
      date: '2025-04-02',
      amount: '125.50',
      category: 'Travel',
      status: 'pending',
      receiptUrl: 'https://images.unsplash.com/photo-1572666341285-c8cb9790ca0b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'
    }
  ];
  
  const approvedExpenses = [
    {
      id: 2,
      description: 'Conference Registration',
      date: '2025-03-10',
      amount: '350.00',
      category: 'Professional Development',
      status: 'approved',
      reimbursementDate: '2025-03-20'
    },
    {
      id: 3,
      description: 'Office Supplies',
      date: '2025-03-05',
      amount: '75.25',
      category: 'Office Expenses',
      status: 'approved',
      reimbursementDate: '2025-03-15'
    }
  ];
  
  const timeEntries = [
    {
      id: 1,
      week: 'March 25-31, 2025',
      status: 'submitted',
      totalHours: 40,
      overtimeHours: 0,
      submissionDate: '2025-03-31'
    },
    {
      id: 2,
      week: 'March 18-24, 2025',
      status: 'approved',
      totalHours: 42,
      overtimeHours: 2,
      submissionDate: '2025-03-24',
      approvalDate: '2025-03-25'
    },
    {
      id: 3,
      week: 'March 11-17, 2025',
      status: 'approved',
      totalHours: 40,
      overtimeHours: 0,
      submissionDate: '2025-03-17',
      approvalDate: '2025-03-18'
    }
  ];
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, refetch data from API
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Format currency
  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // View payslip details
  const viewPayslipDetails = (payslipId: number) => {
    // @ts-ignore
    navigation.navigate('PayslipDetails', { payslipId });
  };
  
  // View benefit details
  const viewBenefitDetails = (benefitId: number) => {
    // @ts-ignore
    navigation.navigate('BenefitDetails', { benefitId });
  };
  
  // Create expense report
  const createExpenseReport = () => {
    // @ts-ignore
    navigation.navigate('CreateExpenseReport');
  };
  
  // Submit time entry
  const submitTimeEntry = () => {
    // @ts-ignore
    navigation.navigate('SubmitTimeEntry');
  };
  
  // Request time off
  const requestTimeOff = () => {
    // @ts-ignore
    navigation.navigate('RequestTimeOff');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Employee Profile */}
        <View style={styles.profileContainer}>
          <Avatar.Image 
            source={{ uri: employeeInfo.avatar }} 
            size={80} 
            style={styles.profileAvatar}
          />
          <View style={styles.profileDetails}>
            <Title style={styles.profileName}>{employeeInfo.name}</Title>
            <Text style={styles.profilePosition}>{employeeInfo.position}</Text>
            <View style={styles.companyInfo}>
              <Avatar.Image 
                source={{ uri: employeeInfo.companyLogo }}
                size={24}
                style={styles.companyLogo}
              />
              <Text style={styles.companyName}>{employeeInfo.company}</Text>
            </View>
          </View>
        </View>
        
        {/* Wallet Balance */}
        <Surface style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Wallet Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(employeeInfo.balance)}</Text>
            </View>
            
            <View style={styles.nextPayInfo}>
              <Text style={styles.nextPayLabel}>Next Pay</Text>
              <Text style={styles.nextPayDate}>{formatDate(employeeInfo.nextPayDate)}</Text>
              <Text style={styles.nextPayAmount}>{formatCurrency(employeeInfo.expectedPay)}</Text>
            </View>
          </View>
          
          <View style={styles.quickActions}>
            <Button 
              mode="contained" 
              icon="bank-transfer-out"
              onPress={() => {}}
              style={styles.transferButton}
            >
              Transfer to Bank
            </Button>
            
            <Button 
              mode="outlined" 
              icon="history"
              onPress={() => {}}
              style={styles.historyButton}
            >
              Transaction History
            </Button>
          </View>
        </Surface>
        
        {/* Tab Navigation */}
        <Card style={styles.tabsCard}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                Overview
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'payroll' && styles.activeTab]}
              onPress={() => setActiveTab('payroll')}
            >
              <Text style={[styles.tabText, activeTab === 'payroll' && styles.activeTabText]}>
                Payroll
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'benefits' && styles.activeTab]}
              onPress={() => setActiveTab('benefits')}
            >
              <Text style={[styles.tabText, activeTab === 'benefits' && styles.activeTabText]}>
                Benefits
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'expenses' && styles.activeTab]}
              onPress={() => setActiveTab('expenses')}
            >
              <Text style={[styles.tabText, activeTab === 'expenses' && styles.activeTabText]}>
                Expenses
              </Text>
            </TouchableOpacity>
          </View>
          
          <Card.Content>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                <Title style={styles.sectionTitle}>Recent Transactions</Title>
                
                {transactions.map(transaction => (
                  <Card key={transaction.id} style={styles.transactionCard}>
                    <Card.Content>
                      <View style={styles.transactionHeader}>
                        <View style={styles.transactionInfo}>
                          <Icon 
                            name={
                              transaction.type === 'payroll' 
                                ? 'cash' 
                                : transaction.type === 'bonus' 
                                  ? 'gift' 
                                  : transaction.type === 'expense_reimbursement'
                                    ? 'receipt'
                                    : 'bank-transfer-out'
                            } 
                            size={24} 
                            color={
                              transaction.type === 'withdrawal' 
                                ? '#EF4444' 
                                : '#F59E0B'
                            }
                            style={styles.transactionIcon}
                          />
                          <View>
                            <Text style={styles.transactionDescription}>{transaction.description}</Text>
                            <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                          </View>
                        </View>
                        
                        <Text 
                          style={[
                            styles.transactionAmount,
                            { color: transaction.type === 'withdrawal' ? '#EF4444' : '#F59E0B' }
                          ]}
                        >
                          {transaction.type === 'withdrawal' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
                
                <Button 
                  mode="text" 
                  icon="history"
                  onPress={() => {}}
                  style={styles.viewAllButton}
                >
                  View All Transactions
                </Button>
                
                <Title style={styles.sectionTitle}>Time Entries</Title>
                
                {timeEntries.slice(0, 2).map(entry => (
                  <Card key={entry.id} style={styles.timeEntryCard}>
                    <Card.Content>
                      <View style={styles.timeEntryHeader}>
                        <View>
                          <Text style={styles.timeEntryWeek}>{entry.week}</Text>
                          <Text style={styles.timeEntryHours}>{entry.totalHours} hours</Text>
                        </View>
                        
                        <Chip 
                          style={[
                            styles.statusChip,
                            { 
                              backgroundColor: entry.status === 'approved' 
                                ? '#DCFCE7' 
                                : '#FEF3C7' 
                            }
                          ]}
                        >
                          <Text 
                            style={{ 
                              color: entry.status === 'approved' 
                                ? '#10B981' 
                                : '#F59E0B'
                            }}
                          >
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </Text>
                        </Chip>
                      </View>
                      
                      <View style={styles.timeEntryFooter}>
                        <Text style={styles.timeEntrySubmission}>
                          Submitted: {formatDate(entry.submissionDate)}
                        </Text>
                        
                        {entry.approvalDate && (
                          <Text style={styles.timeEntryApproval}>
                            Approved: {formatDate(entry.approvalDate)}
                          </Text>
                        )}
                      </View>
                    </Card.Content>
                  </Card>
                ))}
                
                <View style={styles.actionButtonsRow}>
                  <Button 
                    mode="outlined" 
                    icon="clock-time-four"
                    onPress={submitTimeEntry}
                    style={styles.actionButton}
                  >
                    Submit Time
                  </Button>
                  
                  <Button 
                    mode="outlined" 
                    icon="calendar-clock"
                    onPress={requestTimeOff}
                    style={styles.actionButton}
                  >
                    Request Time Off
                  </Button>
                </View>
                
                <Title style={styles.sectionTitle}>Pending Expenses</Title>
                
                {pendingExpenses.length > 0 ? (
                  pendingExpenses.map(expense => (
                    <Card key={expense.id} style={styles.expenseCard}>
                      <Card.Content>
                        <View style={styles.expenseHeader}>
                          <View>
                            <Text style={styles.expenseDescription}>{expense.description}</Text>
                            <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                          </View>
                          
                          <View style={styles.expenseAmountContainer}>
                            <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                            <Chip 
                              style={[styles.statusChip, { backgroundColor: '#FEF3C7' }]}
                            >
                              <Text style={{ color: '#F59E0B' }}>Pending</Text>
                            </Chip>
                          </View>
                        </View>
                        
                        <View style={styles.expenseCategory}>
                          <Text style={styles.expenseCategoryLabel}>Category:</Text>
                          <Text style={styles.expenseCategoryValue}>{expense.category}</Text>
                        </View>
                      </Card.Content>
                    </Card>
                  ))
                ) : (
                  <Card style={styles.emptyStateCard}>
                    <Card.Content style={styles.emptyStateContent}>
                      <Icon name="check-circle" size={48} color="#9CA3AF" />
                      <Text style={styles.emptyStateText}>No pending expenses</Text>
                    </Card.Content>
                  </Card>
                )}
                
                <Button 
                  mode="contained" 
                  icon="receipt"
                  onPress={createExpenseReport}
                  style={styles.submitExpenseButton}
                >
                  Submit New Expense
                </Button>
              </>
            )}
            
            {/* Payroll Tab */}
            {activeTab === 'payroll' && (
              <>
                <Title style={styles.sectionTitle}>Upcoming Payroll</Title>
                
                <Card style={styles.upcomingPayrollCard}>
                  <Card.Content>
                    <View style={styles.upcomingPayrollHeader}>
                      <Text style={styles.upcomingPayrollDate}>Expected on {formatDate(employeeInfo.nextPayDate)}</Text>
                      <Text style={styles.upcomingPayrollAmount}>{formatCurrency(employeeInfo.expectedPay)}</Text>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.payrollComponentsList}>
                      <View style={styles.payrollComponentItem}>
                        <Text style={styles.payrollComponentLabel}>Base Salary:</Text>
                        <Text style={styles.payrollComponentValue}>{formatCurrency('5500.00')}</Text>
                      </View>
                      
                      <View style={styles.payrollComponentItem}>
                        <Text style={styles.payrollComponentLabel}>Tax Withholding (estimate):</Text>
                        <Text style={styles.payrollComponentValue}>-{formatCurrency('1100.00')}</Text>
                      </View>
                      
                      <View style={styles.payrollComponentItem}>
                        <Text style={styles.payrollComponentLabel}>Benefits Deductions:</Text>
                        <Text style={styles.payrollComponentValue}>-{formatCurrency('440.00')}</Text>
                      </View>
                      
                      <View style={styles.payrollComponentItem}>
                        <Text style={styles.payrollComponentLabel}>Retirement Contributions:</Text>
                        <Text style={styles.payrollComponentValue}>-{formatCurrency('275.00')}</Text>
                      </View>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.payrollNetAmount}>
                      <Text style={styles.payrollNetLabel}>Net Pay (estimate):</Text>
                      <Text style={styles.payrollNetValue}>{formatCurrency('3685.00')}</Text>
                    </View>
                  </Card.Content>
                </Card>
                
                <Title style={styles.sectionTitle}>Recent Payslips</Title>
                
                {payslips.map(payslip => (
                  <Card 
                    key={payslip.id} 
                    style={styles.payslipCard}
                    onPress={() => viewPayslipDetails(payslip.id)}
                  >
                    <Card.Content>
                      <View style={styles.payslipHeader}>
                        <View>
                          <Text style={styles.payslipPeriod}>{payslip.period}</Text>
                          <Text style={styles.payslipDate}>{formatDate(payslip.date)}</Text>
                        </View>
                        
                        <Chip style={styles.paidChip}>
                          <Text style={{ color: '#10B981' }}>Paid</Text>
                        </Chip>
                      </View>
                      
                      <Divider style={styles.divider} />
                      
                      <View style={styles.payslipAmounts}>
                        <View style={styles.payslipAmountItem}>
                          <Text style={styles.payslipAmountLabel}>Gross Pay:</Text>
                          <Text style={styles.payslipGrossAmount}>{formatCurrency(payslip.grossAmount)}</Text>
                        </View>
                        
                        <View style={styles.payslipAmountItem}>
                          <Text style={styles.payslipAmountLabel}>Taxes & Deductions:</Text>
                          <Text style={styles.payslipDeductionsAmount}>-{formatCurrency(
                            (parseFloat(payslip.taxes) + parseFloat(payslip.benefits)).toString()
                          )}</Text>
                        </View>
                        
                        <View style={styles.payslipAmountItem}>
                          <Text style={styles.payslipAmountLabel}>Net Pay:</Text>
                          <Text style={styles.payslipNetAmount}>{formatCurrency(payslip.netAmount)}</Text>
                        </View>
                      </View>
                      
                      <Button 
                        mode="text" 
                        icon="file-document-outline"
                        onPress={() => viewPayslipDetails(payslip.id)}
                        style={styles.viewDetailsButton}
                      >
                        View Details
                      </Button>
                    </Card.Content>
                  </Card>
                ))}
                
                <Button 
                  mode="text" 
                  icon="download"
                  onPress={() => {}}
                  style={styles.viewAllButton}
                >
                  Download All Payslips
                </Button>
                
                <Title style={styles.sectionTitle}>YTD Summary</Title>
                
                <Card style={styles.ytdCard}>
                  <Card.Content>
                    <DataTable>
                      <DataTable.Header>
                        <DataTable.Title>Category</DataTable.Title>
                        <DataTable.Title numeric>Amount</DataTable.Title>
                      </DataTable.Header>
                      
                      <DataTable.Row>
                        <DataTable.Cell>Gross Earnings</DataTable.Cell>
                        <DataTable.Cell numeric>{formatCurrency('16500.00')}</DataTable.Cell>
                      </DataTable.Row>
                      
                      <DataTable.Row>
                        <DataTable.Cell>Federal Tax</DataTable.Cell>
                        <DataTable.Cell numeric>{formatCurrency('2500.00')}</DataTable.Cell>
                      </DataTable.Row>
                      
                      <DataTable.Row>
                        <DataTable.Cell>State Tax</DataTable.Cell>
                        <DataTable.Cell numeric>{formatCurrency('800.00')}</DataTable.Cell>
                      </DataTable.Row>
                      
                      <DataTable.Row>
                        <DataTable.Cell>Medicare</DataTable.Cell>
                        <DataTable.Cell numeric>{formatCurrency('240.00')}</DataTable.Cell>
                      </DataTable.Row>
                      
                      <DataTable.Row>
                        <DataTable.Cell>Social Security</DataTable.Cell>
                        <DataTable.Cell numeric>{formatCurrency('950.00')}</DataTable.Cell>
                      </DataTable.Row>
                      
                      <DataTable.Row>
                        <DataTable.Cell>401(k) Contributions</DataTable.Cell>
                        <DataTable.Cell numeric>{formatCurrency('825.00')}</DataTable.Cell>
                      </DataTable.Row>
                      
                      <DataTable.Row>
                        <DataTable.Cell>Benefits Deductions</DataTable.Cell>
                        <DataTable.Cell numeric>{formatCurrency('1320.00')}</DataTable.Cell>
                      </DataTable.Row>
                      
                      <DataTable.Row style={styles.netPayRow}>
                        <DataTable.Cell>Net Pay</DataTable.Cell>
                        <DataTable.Cell numeric style={styles.netPayCell}>{formatCurrency('9865.00')}</DataTable.Cell>
                      </DataTable.Row>
                    </DataTable>
                  </Card.Content>
                </Card>
              </>
            )}
            
            {/* Benefits Tab */}
            {activeTab === 'benefits' && (
              <>
                <Title style={styles.sectionTitle}>My Benefits</Title>
                
                {benefits.map(benefit => (
                  <Card 
                    key={benefit.id} 
                    style={styles.benefitCard}
                    onPress={() => viewBenefitDetails(benefit.id)}
                  >
                    <Card.Content>
                      <View style={styles.benefitHeader}>
                        <View style={styles.benefitTitleRow}>
                          <Icon name={benefit.icon} size={24} color="#F59E0B" style={styles.benefitIcon} />
                          <View>
                            <Text style={styles.benefitName}>{benefit.name}</Text>
                            <Text style={styles.benefitProvider}>{benefit.provider}</Text>
                          </View>
                        </View>
                        
                        <Chip 
                          style={[styles.statusChip, { backgroundColor: '#DCFCE7' }]}
                        >
                          <Text style={{ color: '#10B981' }}>Active</Text>
                        </Chip>
                      </View>
                      
                      <Divider style={styles.divider} />
                      
                      <View style={styles.benefitDetails}>
                        <View style={styles.benefitDetailItem}>
                          <Text style={styles.benefitDetailLabel}>Monthly Deduction:</Text>
                          <Text style={styles.benefitDetailValue}>{formatCurrency(benefit.monthlyDeduction)}</Text>
                        </View>
                        
                        {benefit.employerMatch && (
                          <View style={styles.benefitDetailItem}>
                            <Text style={styles.benefitDetailLabel}>Employer Match:</Text>
                            <Text style={styles.benefitDetailValue}>{formatCurrency(benefit.employerMatch)}</Text>
                          </View>
                        )}
                        
                        {benefit.coverage && (
                          <View style={styles.benefitDetailItem}>
                            <Text style={styles.benefitDetailLabel}>Coverage:</Text>
                            <Text style={styles.benefitDetailValue}>{benefit.coverage}</Text>
                          </View>
                        )}
                      </View>
                      
                      <Button 
                        mode="outlined" 
                        icon="information-outline"
                        onPress={() => viewBenefitDetails(benefit.id)}
                        style={styles.viewDetailsButton}
                      >
                        View Details
                      </Button>
                    </Card.Content>
                  </Card>
                ))}
                
                <Button 
                  mode="contained" 
                  icon="plus"
                  onPress={() => {}}
                  style={styles.enrollButton}
                >
                  Enroll in Additional Benefits
                </Button>
                
                <Title style={styles.sectionTitle}>Total Monthly Deductions</Title>
                
                <Card style={styles.deductionsCard}>
                  <Card.Content>
                    <Text style={styles.deductionsTotal}>
                      {formatCurrency(
                        benefits.reduce((total, benefit) => total + parseFloat(benefit.monthlyDeduction), 0).toString()
                      )}
                    </Text>
                    <Text style={styles.deductionsSubtitle}>per month</Text>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.deductionsList}>
                      {benefits.map(benefit => (
                        <View key={benefit.id} style={styles.deductionItem}>
                          <Text style={styles.deductionName}>{benefit.name}</Text>
                          <Text style={styles.deductionAmount}>{formatCurrency(benefit.monthlyDeduction)}</Text>
                        </View>
                      ))}
                    </View>
                  </Card.Content>
                </Card>
              </>
            )}
            
            {/* Expenses Tab */}
            {activeTab === 'expenses' && (
              <>
                <Title style={styles.sectionTitle}>Pending Expense Reports</Title>
                
                {pendingExpenses.length > 0 ? (
                  pendingExpenses.map(expense => (
                    <Card key={expense.id} style={styles.expenseCardDetailed}>
                      <Card.Content>
                        <View style={styles.expenseHeader}>
                          <View>
                            <Text style={styles.expenseDescription}>{expense.description}</Text>
                            <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                          </View>
                          
                          <View style={styles.expenseAmountContainer}>
                            <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                            <Chip 
                              style={[styles.statusChip, { backgroundColor: '#FEF3C7' }]}
                            >
                              <Text style={{ color: '#F59E0B' }}>Pending</Text>
                            </Chip>
                          </View>
                        </View>
                        
                        <View style={styles.expenseCategory}>
                          <Text style={styles.expenseCategoryLabel}>Category:</Text>
                          <Text style={styles.expenseCategoryValue}>{expense.category}</Text>
                        </View>
                        
                        {expense.receiptUrl && (
                          <View style={styles.receiptContainer}>
                            <Text style={styles.receiptLabel}>Receipt:</Text>
                            <Image 
                              source={{ uri: expense.receiptUrl }}
                              style={styles.receiptImage}
                            />
                          </View>
                        )}
                        
                        <View style={styles.expenseActions}>
                          <Button 
                            mode="outlined" 
                            icon="pencil"
                            onPress={() => {}}
                            style={styles.editExpenseButton}
                          >
                            Edit
                          </Button>
                          
                          <Button 
                            mode="outlined" 
                            icon="delete"
                            onPress={() => {}}
                            style={styles.deleteExpenseButton}
                          >
                            Delete
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  ))
                ) : (
                  <Card style={styles.emptyStateCard}>
                    <Card.Content style={styles.emptyStateContent}>
                      <Icon name="check-circle" size={48} color="#9CA3AF" />
                      <Text style={styles.emptyStateText}>No pending expense reports</Text>
                    </Card.Content>
                  </Card>
                )}
                
                <Button 
                  mode="contained" 
                  icon="receipt"
                  onPress={createExpenseReport}
                  style={styles.submitExpenseButton}
                >
                  Submit New Expense
                </Button>
                
                <Title style={styles.sectionTitle}>Reimbursed Expenses</Title>
                
                {approvedExpenses.map(expense => (
                  <Card key={expense.id} style={styles.expenseCard}>
                    <Card.Content>
                      <View style={styles.expenseHeader}>
                        <View>
                          <Text style={styles.expenseDescription}>{expense.description}</Text>
                          <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
                        </View>
                        
                        <View style={styles.expenseAmountContainer}>
                          <Text style={styles.expenseAmount}>{formatCurrency(expense.amount)}</Text>
                          <Chip 
                            style={[styles.statusChip, { backgroundColor: '#DCFCE7' }]}
                          >
                            <Text style={{ color: '#10B981' }}>Reimbursed</Text>
                          </Chip>
                        </View>
                      </View>
                      
                      <View style={styles.expenseFooter}>
                        <Text style={styles.expenseCategoryValue}>{expense.category}</Text>
                        <Text style={styles.reimbursementDate}>
                          Reimbursed: {formatDate(expense.reimbursementDate)}
                        </Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
                
                <Button 
                  mode="text" 
                  icon="history"
                  onPress={() => {}}
                  style={styles.viewAllButton}
                >
                  View All Expenses
                </Button>
                
                <Title style={styles.sectionTitle}>Expense Summary</Title>
                
                <Card style={styles.summaryCard}>
                  <Card.Content>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Submitted (YTD):</Text>
                      <Text style={styles.summaryValue}>{formatCurrency('550.75')}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Total Reimbursed:</Text>
                      <Text style={styles.summaryValue}>{formatCurrency('425.25')}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Pending Reimbursement:</Text>
                      <Text style={styles.summaryValue}>{formatCurrency('125.50')}</Text>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <Text style={styles.categorySummaryTitle}>By Category:</Text>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Travel:</Text>
                      <Text style={styles.summaryValue}>{formatCurrency('125.50')}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Office Expenses:</Text>
                      <Text style={styles.summaryValue}>{formatCurrency('75.25')}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Professional Development:</Text>
                      <Text style={styles.summaryValue}>{formatCurrency('350.00')}</Text>
                    </View>
                  </Card.Content>
                </Card>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* FAB for quick actions */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  profileContainer: {
    padding: 16,
    backgroundColor: '#F59E0B', // Amber for employee wallet
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    backgroundColor: 'white',
  },
  profileDetails: {
    marginLeft: 16,
  },
  profileName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profilePosition: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 4,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    backgroundColor: 'white',
    marginRight: 8,
  },
  companyName: {
    color: 'white',
    fontSize: 14,
  },
  balanceCard: {
    margin: 16,
    marginTop: -20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B', // Amber for employee wallet
  },
  nextPayInfo: {
    alignItems: 'flex-end',
  },
  nextPayLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  nextPayDate: {
    fontSize: 14,
    color: '#374151',
  },
  nextPayAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B', // Amber for employee wallet
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transferButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#F59E0B', // Amber for employee wallet
  },
  historyButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#F59E0B', // Amber for employee wallet
  },
  tabsCard: {
    margin: 16,
    marginBottom: 80, // Space for FAB
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#F59E0B', // Amber for employee wallet
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#F59E0B', // Amber for employee wallet
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeEntryCard: {
    marginBottom: 12,
  },
  timeEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  timeEntryWeek: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeEntryHours: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusChip: {
    height: 24,
  },
  timeEntryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeEntrySubmission: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeEntryApproval: {
    fontSize: 12,
    color: '#10B981',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderColor: '#F59E0B', // Amber for employee wallet
  },
  expenseCard: {
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  expenseAmountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B', // Amber for employee wallet
    marginBottom: 4,
  },
  expenseCategory: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  expenseCategoryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  expenseCategoryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reimbursementDate: {
    fontSize: 12,
    color: '#10B981',
  },
  emptyStateCard: {
    marginBottom: 24,
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitExpenseButton: {
    marginVertical: 16,
    backgroundColor: '#F59E0B', // Amber for employee wallet
  },
  upcomingPayrollCard: {
    marginBottom: 24,
  },
  upcomingPayrollHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  upcomingPayrollDate: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  upcomingPayrollAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B', // Amber for employee wallet
  },
  divider: {
    marginVertical: 12,
  },
  payrollComponentsList: {
    marginBottom: 12,
  },
  payrollComponentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  payrollComponentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  payrollComponentValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  payrollNetAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payrollNetLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  payrollNetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F59E0B', // Amber for employee wallet
  },
  payslipCard: {
    marginBottom: 16,
  },
  payslipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  payslipPeriod: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  payslipDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  paidChip: {
    backgroundColor: '#DCFCE7',
  },
  payslipAmounts: {
    marginVertical: 8,
  },
  payslipAmountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  payslipAmountLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  payslipGrossAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  payslipDeductionsAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  payslipNetAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F59E0B', // Amber for employee wallet
  },
  viewDetailsButton: {
    alignSelf: 'flex-end',
  },
  ytdCard: {
    marginBottom: 24,
  },
  netPayRow: {
    backgroundColor: '#F9FAFB',
  },
  netPayCell: {
    color: '#F59E0B', // Amber for employee wallet
    fontWeight: 'bold',
  },
  benefitCard: {
    marginBottom: 16,
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  benefitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIcon: {
    marginRight: 12,
  },
  benefitName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  benefitProvider: {
    fontSize: 14,
    color: '#6B7280',
  },
  benefitDetails: {
    marginBottom: 12,
  },
  benefitDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  benefitDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  benefitDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  enrollButton: {
    marginVertical: 16,
    backgroundColor: '#F59E0B', // Amber for employee wallet
  },
  deductionsCard: {
    marginBottom: 24,
    backgroundColor: '#FEF3C7',
  },
  deductionsTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F59E0B', // Amber for employee wallet
    textAlign: 'center',
  },
  deductionsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  deductionsList: {
    marginTop: 8,
  },
  deductionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deductionName: {
    fontSize: 14,
  },
  deductionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  expenseCardDetailed: {
    marginBottom: 16,
  },
  receiptContainer: {
    marginVertical: 12,
  },
  receiptLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  expenseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  editExpenseButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#F59E0B', // Amber for employee wallet
  },
  deleteExpenseButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#EF4444',
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categorySummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#F59E0B', // Amber for employee wallet
  },
});

export default EmployeeWalletScreen;