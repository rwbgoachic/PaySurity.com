import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Card, Text, Title, Paragraph, Button, Divider, List, Avatar, FAB, Surface, Menu, Badge, DataTable, ProgressBar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Types for data
interface EmployeeWallet {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeAvatar: string;
  balance: string;
  type: 'salary' | 'benefits' | 'retirement' | 'hsa';
  status: 'active' | 'pending' | 'inactive';
  lastTransaction?: string;
}

interface PayrollEntry {
  id: number;
  employee: {
    id: number;
    name: string;
    avatar: string;
  };
  status: 'pending' | 'processing' | 'paid' | 'failed';
  amount: string;
  date: string;
  payPeriod: string;
}

interface BenefitRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeAvatar: string;
  type: 'hsa' | 'retirement' | 'reimbursement' | 'advance';
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  notes?: string;
}

const EmployerWalletScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [currentTablePage, setCurrentTablePage] = useState(0);
  const itemsPerPage = 3;
  
  // Sample data for demonstration
  const companyBalance = 24750.80;
  const pendingPayroll = 12500.25;
  const pendingBenefits = 3200.50;
  
  const employeeWallets: EmployeeWallet[] = [
    { id: 1, employeeId: 101, employeeName: 'John Smith', employeeAvatar: 'account', balance: '2420.00', type: 'salary', status: 'active', lastTransaction: '2025-04-01' },
    { id: 2, employeeId: 102, employeeName: 'Sarah Johnson', employeeAvatar: 'account-outline', balance: '1850.00', type: 'salary', status: 'active', lastTransaction: '2025-04-01' },
    { id: 3, employeeId: 103, employeeName: 'David Chen', employeeAvatar: 'account', balance: '2100.00', type: 'salary', status: 'active', lastTransaction: '2025-04-01' },
    { id: 4, employeeId: 101, employeeName: 'John Smith', employeeAvatar: 'account', balance: '450.00', type: 'benefits', status: 'active' },
    { id: 5, employeeId: 102, employeeName: 'Sarah Johnson', employeeAvatar: 'account-outline', balance: '320.00', type: 'benefits', status: 'active' },
    { id: 6, employeeId: 103, employeeName: 'David Chen', employeeAvatar: 'account', balance: '380.00', type: 'benefits', status: 'active' },
  ];
  
  const payrollEntries: PayrollEntry[] = [
    { 
      id: 1, 
      employee: { id: 101, name: 'John Smith', avatar: 'account' }, 
      status: 'pending', 
      amount: '2420.00', 
      date: '2025-04-15',
      payPeriod: 'Apr 1 - Apr 15, 2025'
    },
    { 
      id: 2, 
      employee: { id: 102, name: 'Sarah Johnson', avatar: 'account-outline' }, 
      status: 'pending', 
      amount: '1850.00', 
      date: '2025-04-15',
      payPeriod: 'Apr 1 - Apr 15, 2025'
    },
    { 
      id: 3, 
      employee: { id: 103, name: 'David Chen', avatar: 'account' }, 
      status: 'pending', 
      amount: '2100.00', 
      date: '2025-04-15',
      payPeriod: 'Apr 1 - Apr 15, 2025'
    },
    { 
      id: 4, 
      employee: { id: 104, name: 'Emily Wilson', avatar: 'account-outline' }, 
      status: 'pending', 
      amount: '1950.00', 
      date: '2025-04-15',
      payPeriod: 'Apr 1 - Apr 15, 2025'
    },
    { 
      id: 5, 
      employee: { id: 105, name: 'Michael Brown', avatar: 'account' }, 
      status: 'pending', 
      amount: '2180.00', 
      date: '2025-04-15',
      payPeriod: 'Apr 1 - Apr 15, 2025'
    },
  ];
  
  const benefitRequests: BenefitRequest[] = [
    { 
      id: 1, 
      employeeId: 101, 
      employeeName: 'John Smith', 
      employeeAvatar: 'account', 
      type: 'hsa', 
      amount: '150.00', 
      status: 'pending', 
      date: '2025-04-03',
      notes: 'Monthly HSA contribution' 
    },
    { 
      id: 2, 
      employeeId: 102, 
      employeeName: 'Sarah Johnson', 
      employeeAvatar: 'account-outline', 
      type: 'retirement', 
      amount: '200.00', 
      status: 'pending', 
      date: '2025-04-02',
      notes: '401(k) contribution increase' 
    },
    { 
      id: 3, 
      employeeId: 103, 
      employeeName: 'David Chen', 
      employeeAvatar: 'account', 
      type: 'reimbursement', 
      amount: '85.50', 
      status: 'pending', 
      date: '2025-04-01',
      notes: 'Business travel expenses' 
    },
  ];
  
  // Format currency
  const formatCurrency = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numericAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, refetch data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Navigate to payroll screen
  const goToPayroll = () => {
    // @ts-ignore
    navigation.navigate('Payroll');
  };
  
  // Navigate to employee profile
  const goToEmployeeProfile = (employeeId: number) => {
    // @ts-ignore
    navigation.navigate('EmployeeProfile', { employeeId });
  };
  
  // Navigate to add employee
  const goToAddEmployee = () => {
    // @ts-ignore
    navigation.navigate('AddEmployee');
  };
  
  // Handle showing employee menu
  const showEmployeeMenu = (employeeId: number) => {
    setSelectedEmployee(employeeId);
    setMenuVisible(true);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFC107';
      case 'processing':
        return '#2196F3';
      case 'paid':
      case 'approved':
      case 'active':
        return '#4CAF50';
      case 'failed':
      case 'rejected':
      case 'inactive':
        return '#F44336';
      default:
        return theme.colors.placeholder;
    }
  };
  
  // Get benefit type icon
  const getBenefitTypeIcon = (type: string) => {
    switch (type) {
      case 'hsa':
        return 'medical-bag';
      case 'retirement':
        return 'piggy-bank';
      case 'reimbursement':
        return 'cash-refund';
      case 'advance':
        return 'cash-fast';
      default:
        return 'cash';
    }
  };
  
  // Get benefit type name
  const getBenefitTypeName = (type: string) => {
    switch (type) {
      case 'hsa':
        return 'HSA Contribution';
      case 'retirement':
        return 'Retirement Contribution';
      case 'reimbursement':
        return 'Expense Reimbursement';
      case 'advance':
        return 'Salary Advance';
      default:
        return type;
    }
  };
  
  // Calculate current payroll entries for pagination
  const paginatedPayrollEntries = payrollEntries.slice(
    currentTablePage * itemsPerPage, 
    (currentTablePage + 1) * itemsPerPage
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Company Wallet Overview */}
        <Surface style={styles.companyWalletCard} elevation={4}>
          <View style={styles.companyWalletHeader}>
            <View>
              <Text style={styles.companyWalletLabel}>Company Balance</Text>
              <Text style={styles.companyWalletBalance}>{formatCurrency(companyBalance)}</Text>
            </View>
            <Avatar.Icon size={50} icon="domain" style={styles.companyIcon} />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.pendingContainer}>
            <View style={styles.pendingItem}>
              <Text style={styles.pendingLabel}>Pending Payroll</Text>
              <Text style={styles.pendingAmount}>{formatCurrency(pendingPayroll)}</Text>
            </View>
            <View style={styles.pendingItem}>
              <Text style={styles.pendingLabel}>Pending Benefits</Text>
              <Text style={styles.pendingAmount}>{formatCurrency(pendingBenefits)}</Text>
            </View>
          </View>
        </Surface>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={goToPayroll}
          >
            <Avatar.Icon size={40} icon="cash-multiple" style={styles.actionIcon} />
            <Text style={styles.actionText}>Process Payroll</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Avatar.Icon size={40} icon="bank-transfer" style={styles.actionIcon} />
            <Text style={styles.actionText}>Transfer Funds</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View>
              <Avatar.Icon size={40} icon="clipboard-check" style={styles.actionIcon} />
              <Badge style={styles.notificationBadge}>{benefitRequests.length}</Badge>
            </View>
            <Text style={styles.actionText}>Approvals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={goToAddEmployee}
          >
            <Avatar.Icon size={40} icon="account-plus" style={styles.actionIcon} />
            <Text style={styles.actionText}>Add Employee</Text>
          </TouchableOpacity>
        </View>
        
        {/* Upcoming Payroll Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Upcoming Payroll</Title>
              <Button 
                icon="arrow-right" 
                mode="text"
                onPress={goToPayroll}
              >
                View All
              </Button>
            </View>
            
            <View style={styles.payPeriodContainer}>
              <Text style={styles.payPeriodTitle}>Pay Period: Apr 1 - Apr 15, 2025</Text>
              <Text style={styles.payPeriodDate}>Scheduled Payment Date: Apr 15, 2025</Text>
            </View>
            
            {payrollEntries.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="cash-remove" size={48} color={theme.colors.placeholder} />
                <Text style={styles.emptyStateText}>No upcoming payroll entries</Text>
              </View>
            ) : (
              <>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Employee</DataTable.Title>
                    <DataTable.Title numeric>Amount</DataTable.Title>
                    <DataTable.Title>Status</DataTable.Title>
                  </DataTable.Header>
                  
                  {paginatedPayrollEntries.map((entry) => (
                    <DataTable.Row key={entry.id}>
                      <DataTable.Cell>
                        <View style={styles.employeeCell}>
                          <Avatar.Icon 
                            size={24} 
                            icon={entry.employee.avatar} 
                            style={styles.employeeAvatar} 
                          />
                          <Text>{entry.employee.name}</Text>
                        </View>
                      </DataTable.Cell>
                      <DataTable.Cell numeric>{formatCurrency(entry.amount)}</DataTable.Cell>
                      <DataTable.Cell>
                        <Chip 
                          style={[
                            styles.statusChip,
                            { backgroundColor: `${getStatusColor(entry.status)}20` }
                          ]}
                          textStyle={{ color: getStatusColor(entry.status) }}
                        >
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </Chip>
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                  
                  <DataTable.Pagination
                    page={currentTablePage}
                    numberOfPages={Math.ceil(payrollEntries.length / itemsPerPage)}
                    onPageChange={page => setCurrentTablePage(page)}
                    label={`${currentTablePage + 1} of ${Math.ceil(payrollEntries.length / itemsPerPage)}`}
                  />
                </DataTable>
                
                <Button 
                  mode="contained" 
                  icon="cash-register"
                  style={styles.processPayrollButton}
                >
                  Process Payroll
                </Button>
              </>
            )}
          </Card.Content>
        </Card>
        
        {/* Employee Wallets Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Employee Wallets</Title>
            
            {employeeWallets.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="account-group" size={48} color={theme.colors.placeholder} />
                <Text style={styles.emptyStateText}>No employee wallets found</Text>
                <Button 
                  mode="contained" 
                  icon="account-plus" 
                  onPress={goToAddEmployee}
                  style={styles.emptyStateButton}
                >
                  Add Employee
                </Button>
              </View>
            ) : (
              <>
                {/* Filter by wallet type */}
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.filterContainer}
                >
                  <Chip 
                    selected 
                    onPress={() => {}} 
                    style={styles.filterChip}
                  >
                    All Wallets
                  </Chip>
                  <Chip 
                    onPress={() => {}} 
                    style={styles.filterChip}
                  >
                    Salary
                  </Chip>
                  <Chip 
                    onPress={() => {}} 
                    style={styles.filterChip}
                  >
                    Benefits
                  </Chip>
                  <Chip 
                    onPress={() => {}} 
                    style={styles.filterChip}
                  >
                    Retirement
                  </Chip>
                  <Chip 
                    onPress={() => {}} 
                    style={styles.filterChip}
                  >
                    HSA
                  </Chip>
                </ScrollView>
                
                {/* Employee wallet cards */}
                {employeeWallets
                  .filter(wallet => wallet.type === 'salary')
                  .map((wallet) => (
                    <Card key={wallet.id} style={styles.employeeWalletCard}>
                      <TouchableOpacity
                        onPress={() => goToEmployeeProfile(wallet.employeeId)}
                        style={styles.employeeWalletContent}
                      >
                        <View style={styles.employeeInfo}>
                          <Avatar.Icon 
                            size={40} 
                            icon={wallet.employeeAvatar} 
                            style={styles.employeeWalletAvatar} 
                          />
                          <View>
                            <Text style={styles.employeeName}>{wallet.employeeName}</Text>
                            <View style={styles.walletTypeContainer}>
                              <Text style={styles.walletType}>
                                {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)} Wallet
                              </Text>
                              <View style={[styles.statusDot, { backgroundColor: getStatusColor(wallet.status) }]} />
                            </View>
                          </View>
                        </View>
                        
                        <View style={styles.walletActions}>
                          <Text style={styles.walletBalance}>{formatCurrency(wallet.balance)}</Text>
                          <IconButton 
                            icon="dots-vertical" 
                            size={20} 
                            onPress={() => showEmployeeMenu(wallet.employeeId)}
                          />
                        </View>
                      </TouchableOpacity>
                    </Card>
                  ))}
              </>
            )}
          </Card.Content>
        </Card>
        
        {/* Benefit Requests Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Benefit Requests</Title>
              <Button icon="arrow-right" mode="text">View All</Button>
            </View>
            
            {benefitRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="clipboard-check-outline" size={48} color={theme.colors.placeholder} />
                <Text style={styles.emptyStateText}>No pending requests</Text>
              </View>
            ) : (
              <>
                {benefitRequests.map((request) => (
                  <Card key={request.id} style={styles.requestCard}>
                    <Card.Content>
                      <View style={styles.requestHeader}>
                        <View style={styles.requestEmployeeInfo}>
                          <Avatar.Icon 
                            size={36} 
                            icon={request.employeeAvatar} 
                            style={styles.requestEmployeeAvatar} 
                          />
                          <View>
                            <Text style={styles.requestEmployeeName}>{request.employeeName}</Text>
                            <Text style={styles.requestDate}>{formatDate(request.date)}</Text>
                          </View>
                        </View>
                        <Chip 
                          style={[
                            styles.statusChip,
                            { backgroundColor: `${getStatusColor(request.status)}20` }
                          ]}
                          textStyle={{ color: getStatusColor(request.status) }}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Chip>
                      </View>
                      
                      <View style={styles.requestDetails}>
                        <View style={styles.requestTypeContainer}>
                          <Avatar.Icon 
                            size={30} 
                            icon={getBenefitTypeIcon(request.type)} 
                            style={styles.requestTypeIcon} 
                          />
                          <Text style={styles.requestType}>{getBenefitTypeName(request.type)}</Text>
                        </View>
                        <Text style={styles.requestAmount}>{formatCurrency(request.amount)}</Text>
                      </View>
                      
                      {request.notes && (
                        <Text style={styles.requestNotes}>{request.notes}</Text>
                      )}
                      
                      <View style={styles.requestActions}>
                        <Button 
                          mode="contained" 
                          style={styles.approveButton}
                        >
                          Approve
                        </Button>
                        <Button 
                          mode="outlined" 
                          style={styles.rejectButton}
                        >
                          Decline
                        </Button>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* FAB for initiating payments */}
      <FAB
        style={styles.fab}
        icon="cash-plus"
        label="New Payment"
        onPress={() => {}}
      />
      
      {/* Employee actions menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }} // This will be updated when menu is shown
      >
        <Menu.Item onPress={() => {}} title="View Transactions" />
        <Menu.Item onPress={() => {}} title="Transfer Funds" />
        <Menu.Item onPress={() => {}} title="Edit Wallet" />
        <Divider />
        <Menu.Item onPress={() => {}} title="Suspend Wallet" />
      </Menu>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  companyWalletCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  companyWalletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyWalletLabel: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  companyWalletBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  },
  companyIcon: {
    backgroundColor: theme.colors.primaryContainer,
  },
  divider: {
    marginVertical: 12,
  },
  pendingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pendingItem: {
    flex: 1,
  },
  pendingLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  pendingAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    backgroundColor: theme.colors.primaryContainer,
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  payPeriodContainer: {
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  payPeriodTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  payPeriodDate: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 8,
    color: theme.colors.placeholder,
    marginBottom: 8,
  },
  emptyStateButton: {
    marginTop: 8,
  },
  employeeCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatar: {
    backgroundColor: theme.colors.primaryContainer,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  processPayrollButton: {
    marginTop: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  employeeWalletCard: {
    marginBottom: 8,
  },
  employeeWalletContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeWalletAvatar: {
    backgroundColor: theme.colors.primaryContainer,
    marginRight: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  walletTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  walletType: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  walletActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  requestCard: {
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestEmployeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestEmployeeAvatar: {
    backgroundColor: theme.colors.primaryContainer,
    marginRight: 12,
  },
  requestEmployeeName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  requestDate: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestTypeIcon: {
    backgroundColor: theme.colors.primaryContainer,
    marginRight: 8,
  },
  requestType: {
    fontSize: 14,
  },
  requestAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  requestNotes: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  approveButton: {
    flex: 1,
    marginRight: 8,
  },
  rejectButton: {
    flex: 1,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default EmployerWalletScreen;