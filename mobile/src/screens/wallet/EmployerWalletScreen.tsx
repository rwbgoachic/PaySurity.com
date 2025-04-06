import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Card, Text, Title, Paragraph, Button, Divider, List, Avatar, FAB, Surface, ProgressBar, Chip, Badge, DataTable } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Employer Wallet Screen
const EmployerWalletScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'payroll' | 'settings'>('dashboard');
  
  // Sample data for demonstration
  const employerInfo = {
    name: 'Acme Corporation',
    balance: '25750.50',
    employeeCount: 15,
    pendingPayroll: '15250.75',
    nextPayrollDate: '2025-04-15',
    logo: 'https://randomuser.me/api/portraits/men/32.jpg',
  };
  
  const employees = [
    {
      id: 1,
      name: 'John Smith',
      position: 'Software Engineer',
      salary: '5500.00',
      payPeriod: 'monthly',
      startDate: '2024-01-15',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      bonus: '1000.00',
      lastPayDate: '2025-03-15',
    },
    {
      id: 2,
      name: 'Jane Doe',
      position: 'Product Manager',
      salary: '6500.00',
      payPeriod: 'monthly',
      startDate: '2023-10-01',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      bonus: '1200.00',
      lastPayDate: '2025-03-15',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      position: 'UX Designer',
      salary: '4800.00',
      payPeriod: 'monthly',
      startDate: '2024-02-15',
      status: 'active',
      avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
      bonus: '800.00',
      lastPayDate: '2025-03-15',
    }
  ];
  
  const payrollTransactions = [
    {
      id: 1,
      date: '2025-03-15',
      description: 'March 2025 Payroll',
      employeeCount: 15,
      amount: '15250.75',
      status: 'completed',
      processingFee: '150.00'
    },
    {
      id: 2,
      date: '2025-02-15',
      description: 'February 2025 Payroll',
      employeeCount: 15,
      amount: '15100.50',
      status: 'completed',
      processingFee: '150.00'
    },
    {
      id: 3,
      date: '2025-01-15',
      description: 'January 2025 Payroll',
      employeeCount: 14,
      amount: '14500.25',
      status: 'completed',
      processingFee: '145.00'
    }
  ];
  
  const payrollRequests = [
    {
      id: 1,
      employeeName: 'Mike Johnson',
      employeeAvatar: 'https://randomuser.me/api/portraits/men/42.jpg',
      requestType: 'Advance Payment',
      reason: 'Medical emergency',
      amount: '1000.00',
      date: '2025-04-05',
      status: 'pending'
    }
  ];
  
  const stats = {
    totalEmployees: 15,
    activeEmployees: 15,
    averageSalary: '5166.67',
    totalPayrollYTD: '44851.50',
    processingFeesYTD: '445.00',
    employeeTurnoverRate: '5%'
  };
  
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
  
  // Add employee
  const addEmployee = () => {
    // @ts-ignore
    navigation.navigate('AddEmployee');
  };
  
  // Run payroll
  const runPayroll = () => {
    // @ts-ignore
    navigation.navigate('RunPayroll');
  };
  
  // View employee details
  const viewEmployeeDetails = (employeeId: number) => {
    // @ts-ignore
    navigation.navigate('EmployeeDetails', { employeeId });
  };
  
  // Handle payroll request
  const handlePayrollRequest = (requestId: number, action: 'approve' | 'reject') => {
    console.log(`${action} request ${requestId}`);
    // In a real app, call API
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Employer Profile */}
        <View style={styles.profileContainer}>
          <Avatar.Image 
            source={{ uri: employerInfo.logo }} 
            size={80} 
            style={styles.profileAvatar}
          />
          <View style={styles.profileDetails}>
            <Title style={styles.profileName}>{employerInfo.name}</Title>
            <Text style={styles.profileRole}>Employer Account</Text>
          </View>
        </View>
        
        {/* Account Balance */}
        <Surface style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(employerInfo.balance)}</Text>
            </View>
            
            <View style={styles.payrollInfo}>
              <Text style={styles.payrollInfoLabel}>Next Payroll</Text>
              <Text style={styles.payrollInfoDate}>{formatDate(employerInfo.nextPayrollDate)}</Text>
              <Text style={styles.payrollInfoAmount}>{formatCurrency(employerInfo.pendingPayroll)}</Text>
            </View>
          </View>
          
          <View style={styles.quickActions}>
            <Button 
              mode="contained" 
              icon="cash-plus"
              onPress={() => {}}
              style={styles.addFundsButton}
            >
              Add Funds
            </Button>
            
            <Button 
              mode="outlined" 
              icon="calendar-clock"
              onPress={runPayroll}
              style={styles.runPayrollButton}
            >
              Run Payroll
            </Button>
          </View>
        </Surface>
        
        {/* Tab Navigation */}
        <Card style={styles.tabsCard}>
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
              onPress={() => setActiveTab('dashboard')}
            >
              <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
                Dashboard
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'employees' && styles.activeTab]}
              onPress={() => setActiveTab('employees')}
            >
              <Text style={[styles.tabText, activeTab === 'employees' && styles.activeTabText]}>
                Employees
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
              style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>
          
          <Card.Content>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <>
                <Title style={styles.sectionTitle}>Payroll Requests</Title>
                
                {payrollRequests.length > 0 ? (
                  payrollRequests.map(request => (
                    <Card key={request.id} style={styles.requestCard}>
                      <Card.Content>
                        <View style={styles.requestHeader}>
                          <View style={styles.requestUser}>
                            <Avatar.Image 
                              source={{ uri: request.employeeAvatar }} 
                              size={40}
                            />
                            <View style={styles.requestUserInfo}>
                              <Text style={styles.requestUserName}>{request.employeeName}</Text>
                              <Text style={styles.requestType}>{request.requestType}</Text>
                            </View>
                          </View>
                          
                          <View style={styles.requestAmountContainer}>
                            <Text style={styles.requestAmount}>{formatCurrency(request.amount)}</Text>
                            <Text style={styles.requestDate}>{formatDate(request.date)}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.requestReason}>
                          <Text style={styles.requestReasonLabel}>Reason:</Text>
                          <Text style={styles.requestReasonText}>{request.reason}</Text>
                        </View>
                        
                        <View style={styles.requestActions}>
                          <Button 
                            mode="contained" 
                            onPress={() => handlePayrollRequest(request.id, 'approve')}
                            style={[styles.requestButton, styles.approveButton]}
                          >
                            Approve
                          </Button>
                          
                          <Button 
                            mode="outlined" 
                            onPress={() => handlePayrollRequest(request.id, 'reject')}
                            style={styles.requestButton}
                          >
                            Decline
                          </Button>
                        </View>
                      </Card.Content>
                    </Card>
                  ))
                ) : (
                  <Card style={styles.emptyStateCard}>
                    <Card.Content style={styles.emptyStateContent}>
                      <Icon name="check-circle" size={48} color="#9CA3AF" />
                      <Text style={styles.emptyStateText}>No pending payroll requests</Text>
                    </Card.Content>
                  </Card>
                )}
                
                <Title style={styles.sectionTitle}>Payroll Statistics</Title>
                
                <Card style={styles.statsCard}>
                  <Card.Content>
                    <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.totalEmployees}</Text>
                        <Text style={styles.statLabel}>Total Employees</Text>
                      </View>
                      
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{formatCurrency(stats.averageSalary)}</Text>
                        <Text style={styles.statLabel}>Avg. Salary</Text>
                      </View>
                      
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{formatCurrency(stats.totalPayrollYTD)}</Text>
                        <Text style={styles.statLabel}>YTD Payroll</Text>
                      </View>
                      
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.employeeTurnoverRate}</Text>
                        <Text style={styles.statLabel}>Turnover Rate</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
                
                <Title style={styles.sectionTitle}>Recent Payroll History</Title>
                
                {payrollTransactions.map(transaction => (
                  <Card key={transaction.id} style={styles.transactionCard}>
                    <Card.Content>
                      <View style={styles.transactionHeader}>
                        <View>
                          <Text style={styles.transactionDescription}>{transaction.description}</Text>
                          <Text style={styles.transactionDate}>{formatDate(transaction.date)}</Text>
                        </View>
                        
                        <View style={styles.transactionAmountContainer}>
                          <Text style={styles.transactionAmount}>{formatCurrency(transaction.amount)}</Text>
                          <Chip style={styles.statusChip}>
                            <Text style={{ color: '#10B981' }}>Completed</Text>
                          </Chip>
                        </View>
                      </View>
                      
                      <Divider style={styles.divider} />
                      
                      <View style={styles.transactionDetails}>
                        <View style={styles.transactionDetailItem}>
                          <Text style={styles.transactionDetailLabel}>Employees Paid:</Text>
                          <Text style={styles.transactionDetailValue}>{transaction.employeeCount}</Text>
                        </View>
                        
                        <View style={styles.transactionDetailItem}>
                          <Text style={styles.transactionDetailLabel}>Processing Fee:</Text>
                          <Text style={styles.transactionDetailValue}>{formatCurrency(transaction.processingFee)}</Text>
                        </View>
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
              </>
            )}
            
            {/* Employees Tab */}
            {activeTab === 'employees' && (
              <>
                <Title style={styles.sectionTitle}>Employee Directory</Title>
                
                {employees.map(employee => (
                  <Card 
                    key={employee.id} 
                    style={styles.employeeCard}
                    onPress={() => viewEmployeeDetails(employee.id)}
                  >
                    <Card.Content>
                      <View style={styles.employeeHeader}>
                        <View style={styles.employeeInfo}>
                          <Avatar.Image 
                            source={{ uri: employee.avatar }} 
                            size={50}
                          />
                          <View style={styles.employeeDetails}>
                            <Text style={styles.employeeName}>{employee.name}</Text>
                            <Text style={styles.employeePosition}>{employee.position}</Text>
                          </View>
                        </View>
                        
                        <View style={styles.employeeStatusContainer}>
                          <Chip 
                            style={[styles.statusChip, { backgroundColor: '#DCFCE7' }]}
                          >
                            <Text style={{ color: '#10B981' }}>Active</Text>
                          </Chip>
                        </View>
                      </View>
                      
                      <Divider style={styles.divider} />
                      
                      <View style={styles.employeePayInfo}>
                        <View style={styles.employeePayItem}>
                          <Text style={styles.employeePayLabel}>Salary:</Text>
                          <Text style={styles.employeePayValue}>{formatCurrency(employee.salary)}/{employee.payPeriod}</Text>
                        </View>
                        
                        <View style={styles.employeePayItem}>
                          <Text style={styles.employeePayLabel}>Start Date:</Text>
                          <Text style={styles.employeePayValue}>{formatDate(employee.startDate)}</Text>
                        </View>
                        
                        <View style={styles.employeePayItem}>
                          <Text style={styles.employeePayLabel}>Last Paid:</Text>
                          <Text style={styles.employeePayValue}>{formatDate(employee.lastPayDate)}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.employeeActions}>
                        <Button 
                          mode="contained" 
                          icon="cash-fast"
                          onPress={() => {}}
                          style={styles.payNowButton}
                        >
                          Pay Now
                        </Button>
                        
                        <Button 
                          mode="outlined" 
                          icon="pencil"
                          onPress={() => {}}
                          style={styles.editButton}
                        >
                          Edit
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
                
                <Button 
                  mode="contained" 
                  icon="account-plus"
                  onPress={addEmployee}
                  style={styles.addEmployeeButton}
                >
                  Add Employee
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
                      <View>
                        <Text style={styles.upcomingPayrollTitle}>April 2025 Payroll</Text>
                        <Text style={styles.upcomingPayrollDate}>Due: {formatDate(employerInfo.nextPayrollDate)}</Text>
                      </View>
                      
                      <Text style={styles.upcomingPayrollAmount}>{formatCurrency(employerInfo.pendingPayroll)}</Text>
                    </View>
                    
                    <View style={styles.payrollDetailsList}>
                      <View style={styles.payrollDetailsItem}>
                        <Text style={styles.payrollDetailsLabel}>Total Employees:</Text>
                        <Text style={styles.payrollDetailsValue}>{employerInfo.employeeCount}</Text>
                      </View>
                      
                      <View style={styles.payrollDetailsItem}>
                        <Text style={styles.payrollDetailsLabel}>Base Salaries:</Text>
                        <Text style={styles.payrollDetailsValue}>{formatCurrency('14500.00')}</Text>
                      </View>
                      
                      <View style={styles.payrollDetailsItem}>
                        <Text style={styles.payrollDetailsLabel}>Bonuses:</Text>
                        <Text style={styles.payrollDetailsValue}>{formatCurrency('600.00')}</Text>
                      </View>
                      
                      <View style={styles.payrollDetailsItem}>
                        <Text style={styles.payrollDetailsLabel}>Tax Withholdings:</Text>
                        <Text style={styles.payrollDetailsValue}>{formatCurrency('3625.00')}</Text>
                      </View>
                      
                      <View style={styles.payrollDetailsItem}>
                        <Text style={styles.payrollDetailsLabel}>Processing Fee:</Text>
                        <Text style={styles.payrollDetailsValue}>{formatCurrency('150.75')}</Text>
                      </View>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.payrollTotal}>
                      <Text style={styles.payrollTotalLabel}>Total Amount:</Text>
                      <Text style={styles.payrollTotalValue}>{formatCurrency(employerInfo.pendingPayroll)}</Text>
                    </View>
                    
                    <Button 
                      mode="contained" 
                      icon="calendar-clock"
                      onPress={runPayroll}
                      style={styles.runPayrollDetailButton}
                    >
                      Run Payroll Now
                    </Button>
                  </Card.Content>
                </Card>
                
                <Title style={styles.sectionTitle}>Payroll History</Title>
                
                <DataTable style={styles.dataTable}>
                  <DataTable.Header>
                    <DataTable.Title>Date</DataTable.Title>
                    <DataTable.Title>Description</DataTable.Title>
                    <DataTable.Title numeric>Employees</DataTable.Title>
                    <DataTable.Title numeric>Amount</DataTable.Title>
                  </DataTable.Header>
                  
                  {payrollTransactions.map(transaction => (
                    <DataTable.Row key={transaction.id}>
                      <DataTable.Cell>{formatDate(transaction.date)}</DataTable.Cell>
                      <DataTable.Cell>{transaction.description}</DataTable.Cell>
                      <DataTable.Cell numeric>{transaction.employeeCount}</DataTable.Cell>
                      <DataTable.Cell numeric>{formatCurrency(transaction.amount)}</DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
                
                <Card style={styles.payrollSummaryCard}>
                  <Card.Content>
                    <Text style={styles.payrollSummaryTitle}>Year-to-Date Summary</Text>
                    
                    <View style={styles.payrollSummaryGrid}>
                      <View style={styles.payrollSummaryItem}>
                        <Text style={styles.payrollSummaryValue}>{formatCurrency(stats.totalPayrollYTD)}</Text>
                        <Text style={styles.payrollSummaryLabel}>Total Payroll</Text>
                      </View>
                      
                      <View style={styles.payrollSummaryItem}>
                        <Text style={styles.payrollSummaryValue}>{formatCurrency(stats.processingFeesYTD)}</Text>
                        <Text style={styles.payrollSummaryLabel}>Processing Fees</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <>
                <Title style={styles.sectionTitle}>Account Settings</Title>
                
                <Card style={styles.settingsCard}>
                  <Card.Content>
                    <List.Item
                      title="Company Information"
                      description="Update your company details"
                      left={props => <List.Icon {...props} icon="office-building" />}
                      right={props => <List.Icon {...props} icon="chevron-right" />}
                      onPress={() => {}}
                      style={styles.settingsItem}
                    />
                    
                    <Divider />
                    
                    <List.Item
                      title="Payment Methods"
                      description="Manage funding sources"
                      left={props => <List.Icon {...props} icon="credit-card" />}
                      right={props => <List.Icon {...props} icon="chevron-right" />}
                      onPress={() => {}}
                      style={styles.settingsItem}
                    />
                    
                    <Divider />
                    
                    <List.Item
                      title="Payroll Schedule"
                      description="Set up your payroll frequency"
                      left={props => <List.Icon {...props} icon="calendar" />}
                      right={props => <List.Icon {...props} icon="chevron-right" />}
                      onPress={() => {}}
                      style={styles.settingsItem}
                    />
                    
                    <Divider />
                    
                    <List.Item
                      title="Tax Settings"
                      description="Configure tax withholding"
                      left={props => <List.Icon {...props} icon="file-document" />}
                      right={props => <List.Icon {...props} icon="chevron-right" />}
                      onPress={() => {}}
                      style={styles.settingsItem}
                    />
                    
                    <Divider />
                    
                    <List.Item
                      title="Notifications"
                      description="Manage email and push notifications"
                      left={props => <List.Icon {...props} icon="bell" />}
                      right={props => <List.Icon {...props} icon="chevron-right" />}
                      onPress={() => {}}
                      style={styles.settingsItem}
                    />
                    
                    <Divider />
                    
                    <List.Item
                      title="Security"
                      description="Password and authentication settings"
                      left={props => <List.Icon {...props} icon="shield" />}
                      right={props => <List.Icon {...props} icon="chevron-right" />}
                      onPress={() => {}}
                      style={styles.settingsItem}
                    />
                  </Card.Content>
                </Card>
                
                <Title style={styles.sectionTitle}>Subscription Plans</Title>
                
                <Card style={styles.planCard}>
                  <Card.Content>
                    <View style={styles.planHeader}>
                      <Text style={styles.planName}>Business Pro Plan</Text>
                      <Chip style={styles.activePlanChip}>
                        <Text style={{ color: '#10B981' }}>Active</Text>
                      </Chip>
                    </View>
                    
                    <Text style={styles.planPrice}>{formatCurrency('49.99')}/month</Text>
                    
                    <Divider style={styles.divider} />
                    
                    <View style={styles.planFeatures}>
                      <View style={styles.planFeatureItem}>
                        <Icon name="check" size={16} color="#10B981" style={styles.featureIcon} />
                        <Text style={styles.planFeatureText}>Up to 20 employees</Text>
                      </View>
                      
                      <View style={styles.planFeatureItem}>
                        <Icon name="check" size={16} color="#10B981" style={styles.featureIcon} />
                        <Text style={styles.planFeatureText}>Direct deposit payroll</Text>
                      </View>
                      
                      <View style={styles.planFeatureItem}>
                        <Icon name="check" size={16} color="#10B981" style={styles.featureIcon} />
                        <Text style={styles.planFeatureText}>Tax filing service</Text>
                      </View>
                      
                      <View style={styles.planFeatureItem}>
                        <Icon name="check" size={16} color="#10B981" style={styles.featureIcon} />
                        <Text style={styles.planFeatureText}>Employee self-service portal</Text>
                      </View>
                      
                      <View style={styles.planFeatureItem}>
                        <Icon name="check" size={16} color="#10B981" style={styles.featureIcon} />
                        <Text style={styles.planFeatureText}>Benefits administration</Text>
                      </View>
                    </View>
                    
                    <Button 
                      mode="outlined" 
                      onPress={() => {}}
                      style={styles.changePlanButton}
                    >
                      Change Plan
                    </Button>
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
    backgroundColor: '#10B981', // Green for employer wallet
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
  profileRole: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
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
    color: '#10B981', // Green for employer wallet
  },
  payrollInfo: {
    alignItems: 'flex-end',
  },
  payrollInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  payrollInfoDate: {
    fontSize: 14,
    color: '#374151',
  },
  payrollInfoAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981', // Green for employer wallet
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addFundsButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#10B981', // Green for employer wallet
  },
  runPayrollButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#10B981', // Green for employer wallet
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
    borderBottomColor: '#10B981', // Green for employer wallet
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#10B981', // Green for employer wallet
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 16,
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
  statsCard: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981', // Green for employer wallet
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  requestCard: {
    marginBottom: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestUserInfo: {
    marginLeft: 12,
  },
  requestUserName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestType: {
    fontSize: 14,
    color: '#6B7280',
  },
  requestAmountContainer: {
    alignItems: 'flex-end',
  },
  requestAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981', // Green for employer wallet
  },
  requestDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  requestReason: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  requestReasonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requestReasonText: {
    fontSize: 14,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  approveButton: {
    backgroundColor: '#10B981', // Green for employer wallet
  },
  transactionCard: {
    marginBottom: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444', // Red for outgoing
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
    backgroundColor: '#DCFCE7',
  },
  divider: {
    marginVertical: 12,
  },
  transactionDetails: {
    marginVertical: 8,
  },
  transactionDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  transactionDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 8,
  },
  employeeCard: {
    marginBottom: 16,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeDetails: {
    marginLeft: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  employeePosition: {
    fontSize: 14,
    color: '#6B7280',
  },
  employeeStatusContainer: {
    alignItems: 'flex-end',
  },
  employeePayInfo: {
    marginBottom: 12,
  },
  employeePayItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  employeePayLabel: {
    fontSize: 14,
    width: 80,
    color: '#6B7280',
  },
  employeePayValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  employeeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payNowButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#10B981', // Green for employer wallet
  },
  editButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: '#10B981', // Green for employer wallet
  },
  addEmployeeButton: {
    marginVertical: 16,
    backgroundColor: '#10B981', // Green for employer wallet
  },
  upcomingPayrollCard: {
    marginBottom: 24,
  },
  upcomingPayrollHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  upcomingPayrollTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  upcomingPayrollDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  upcomingPayrollAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444', // Red for outgoing
  },
  payrollDetailsList: {
    marginBottom: 16,
  },
  payrollDetailsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  payrollDetailsLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  payrollDetailsValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  payrollTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  payrollTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  payrollTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444', // Red for outgoing
  },
  runPayrollDetailButton: {
    marginTop: 16,
    backgroundColor: '#10B981', // Green for employer wallet
  },
  dataTable: {
    marginBottom: 24,
  },
  payrollSummaryCard: {
    marginBottom: 24,
    backgroundColor: '#F0F9FF',
  },
  payrollSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  payrollSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payrollSummaryItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '48%',
  },
  payrollSummaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981', // Green for employer wallet
    marginBottom: 4,
  },
  payrollSummaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingsCard: {
    marginBottom: 24,
  },
  settingsItem: {
    paddingVertical: 8,
  },
  planCard: {
    marginBottom: 24,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activePlanChip: {
    backgroundColor: '#DCFCE7',
  },
  planPrice: {
    fontSize: 20,
    color: '#10B981', // Green for employer wallet
    marginBottom: 12,
  },
  planFeatures: {
    marginBottom: 16,
  },
  planFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  planFeatureText: {
    fontSize: 14,
  },
  changePlanButton: {
    borderColor: '#10B981', // Green for employer wallet
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#10B981', // Green for employer wallet
  },
});

export default EmployerWalletScreen;