import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Card, Text, Title, Paragraph, Button, Divider, List, Avatar, FAB, Surface, ProgressBar, Chip, IconButton, Menu } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Types for data
interface Wallet {
  id: number;
  type: 'salary' | 'benefits' | 'hsa' | 'retirement';
  balance: string;
  pendingDeposits?: string;
  icon: string;
  color: string;
}

interface PayrollEntry {
  id: number;
  date: string;
  payPeriod: string;
  netPay: string;
  grossPay: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
}

interface TimeOffBalance {
  id: number;
  type: 'vacation' | 'sick' | 'personal';
  available: number;
  used: number;
  accrualRate: string;
  icon: string;
}

interface BenefitContribution {
  id: number;
  type: 'hsa' | 'retirement';
  employeeContribution: string;
  employerContribution: string;
  ytdTotal: string;
  nextContribution?: string;
}

interface PayrollDeduction {
  name: string;
  amount: string;
  isPreTax: boolean;
}

const EmployeeWalletScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'payroll' | 'benefits' | 'time'>('payroll');
  
  // Sample data for demonstration
  const wallets: Wallet[] = [
    { id: 1, type: 'salary', balance: '2450.00', pendingDeposits: '2450.00', icon: 'cash-multiple', color: theme.colors.primary },
    { id: 2, type: 'benefits', balance: '375.00', icon: 'medical-bag', color: '#E91E63' },
    { id: 3, type: 'hsa', balance: '1250.75', icon: 'heart-pulse', color: '#2196F3' },
    { id: 4, type: 'retirement', balance: '15750.25', icon: 'piggy-bank', color: '#4CAF50' },
  ];
  
  const payrollEntries: PayrollEntry[] = [
    { 
      id: 1, 
      date: '2025-04-01', 
      payPeriod: 'Mar 16 - Mar 31, 2025', 
      netPay: '2450.00', 
      grossPay: '3200.00', 
      status: 'paid' 
    },
    { 
      id: 2, 
      date: '2025-03-15', 
      payPeriod: 'Mar 1 - Mar 15, 2025', 
      netPay: '2450.00', 
      grossPay: '3200.00', 
      status: 'paid' 
    },
    { 
      id: 3, 
      date: '2025-04-15', 
      payPeriod: 'Apr 1 - Apr 15, 2025', 
      netPay: '2450.00', 
      grossPay: '3200.00', 
      status: 'pending' 
    },
  ];
  
  const timeOffBalances: TimeOffBalance[] = [
    { id: 1, type: 'vacation', available: 80, used: 16, accrualRate: '6.67 hours/month', icon: 'beach' },
    { id: 2, type: 'sick', available: 40, used: 8, accrualRate: '4 hours/month', icon: 'hospital' },
    { id: 3, type: 'personal', available: 24, used: 0, accrualRate: '2 hours/month', icon: 'account' },
  ];
  
  const benefitContributions: BenefitContribution[] = [
    { 
      id: 1, 
      type: 'retirement', 
      employeeContribution: '192.00', 
      employerContribution: '96.00', 
      ytdTotal: '864.00',
      nextContribution: '192.00'
    },
    { 
      id: 2, 
      type: 'hsa', 
      employeeContribution: '100.00', 
      employerContribution: '50.00', 
      ytdTotal: '450.00',
      nextContribution: '100.00'
    },
  ];
  
  const currentPaySummary = {
    grossPay: '3200.00',
    federalTax: '496.00',
    stateTax: '145.00',
    socialSecurity: '198.40',
    medicare: '46.40',
    retirement401k: '192.00',
    hsaContribution: '100.00',
    healthInsurance: '120.00',
    dentalInsurance: '25.00',
    visionInsurance: '15.00',
    netPay: '2450.00',
  };
  
  const deductions: PayrollDeduction[] = [
    { name: 'Federal Income Tax', amount: '496.00', isPreTax: false },
    { name: 'State Income Tax', amount: '145.00', isPreTax: false },
    { name: 'Social Security', amount: '198.40', isPreTax: false },
    { name: 'Medicare', amount: '46.40', isPreTax: false },
    { name: '401(k) Contribution', amount: '192.00', isPreTax: true },
    { name: 'HSA Contribution', amount: '100.00', isPreTax: true },
    { name: 'Health Insurance', amount: '120.00', isPreTax: true },
    { name: 'Dental Insurance', amount: '25.00', isPreTax: true },
    { name: 'Vision Insurance', amount: '15.00', isPreTax: true },
  ];
  
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
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFC107';
      case 'processing':
        return '#2196F3';
      case 'paid':
      case 'approved':
        return '#4CAF50';
      case 'failed':
      case 'rejected':
        return '#F44336';
      default:
        return theme.colors.placeholder;
    }
  };
  
  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    // In a real app, refetch data here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Calculate percentage for time off progress bars
  const calculateTimeOffPercentage = (used: number, available: number) => {
    const total = used + available;
    return used / total;
  };
  
  // Navigate to time tracking
  const goToTimeTracking = () => {
    // @ts-ignore
    navigation.navigate('TimeTracking');
  };
  
  // Navigate to request time off
  const goToRequestTimeOff = () => {
    // @ts-ignore
    navigation.navigate('RequestTimeOff');
  };
  
  // Navigate to payroll details
  const goToPayrollDetails = (payrollId: number) => {
    // @ts-ignore
    navigation.navigate('PayrollDetails', { payrollId });
  };
  
  // Navigate to paycheck settings
  const goToPaycheckSettings = () => {
    // @ts-ignore
    navigation.navigate('PaycheckSettings');
  };
  
  // Navigate to tax documents
  const goToTaxDocuments = () => {
    // @ts-ignore
    navigation.navigate('TaxDocuments');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Balance Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.walletsContainer}
        >
          {wallets.map((wallet) => (
            <Surface 
              key={wallet.id} 
              style={[styles.walletCard, { backgroundColor: wallet.color }]} 
              elevation={4}
            >
              <View style={styles.walletCardContent}>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletType}>
                    {wallet.type === 'salary' ? 'Salary' : 
                     wallet.type === 'benefits' ? 'Benefits' : 
                     wallet.type === 'hsa' ? 'HSA' : 'Retirement'}
                  </Text>
                  <Text style={styles.walletBalance}>{formatCurrency(wallet.balance)}</Text>
                  {wallet.pendingDeposits && (
                    <View style={styles.pendingContainer}>
                      <Icon name="clock-outline" size={14} color="rgba(255, 255, 255, 0.8)" />
                      <Text style={styles.pendingText}>
                        {formatCurrency(wallet.pendingDeposits)} pending
                      </Text>
                    </View>
                  )}
                </View>
                <Avatar.Icon size={40} icon={wallet.icon} style={styles.walletIcon} />
              </View>
            </Surface>
          ))}
        </ScrollView>
        
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={goToTimeTracking}
          >
            <Avatar.Icon size={40} icon="clock-outline" style={styles.actionIcon} />
            <Text style={styles.actionText}>Track Time</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={goToRequestTimeOff}
          >
            <Avatar.Icon size={40} icon="calendar-check" style={styles.actionIcon} />
            <Text style={styles.actionText}>Request Time</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={goToPaycheckSettings}
          >
            <Avatar.Icon size={40} icon="tune" style={styles.actionIcon} />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={goToTaxDocuments}
          >
            <Avatar.Icon size={40} icon="file-document" style={styles.actionIcon} />
            <Text style={styles.actionText}>Tax Docs</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tab Navigation */}
        <Card style={styles.tabsCard}>
          <View style={styles.tabsContainer}>
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
              style={[styles.tab, activeTab === 'time' && styles.activeTab]}
              onPress={() => setActiveTab('time')}
            >
              <Text style={[styles.tabText, activeTab === 'time' && styles.activeTabText]}>
                Time Off
              </Text>
            </TouchableOpacity>
          </View>
          
          <Card.Content>
            {/* Payroll Tab */}
            {activeTab === 'payroll' && (
              <>
                <Title style={styles.sectionTitle}>Pay History</Title>
                
                {/* Next Paycheck Info */}
                {payrollEntries.find(entry => entry.status === 'pending') && (
                  <Card style={styles.nextPayCard}>
                    <Card.Content>
                      <View style={styles.nextPayHeader}>
                        <Text style={styles.nextPayTitle}>Next Paycheck</Text>
                        <Chip 
                          style={[styles.statusChip, { backgroundColor: `${getStatusColor('pending')}20` }]}
                          textStyle={{ color: getStatusColor('pending') }}
                        >
                          Pending
                        </Chip>
                      </View>
                      
                      <View style={styles.nextPayDetails}>
                        <View>
                          <Text style={styles.nextPayDate}>April 15, 2025</Text>
                          <Text style={styles.nextPayPeriod}>Apr 1 - Apr 15, 2025</Text>
                        </View>
                        <View style={styles.nextPayAmount}>
                          <Text style={styles.nextPayLabel}>Net Pay</Text>
                          <Text style={styles.nextPayValue}>{formatCurrency('2450.00')}</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                )}
                
                {/* Recent Paychecks */}
                {payrollEntries.filter(entry => entry.status === 'paid').map((entry) => (
                  <Card 
                    key={entry.id} 
                    style={styles.paycheckCard}
                    onPress={() => goToPayrollDetails(entry.id)}
                  >
                    <Card.Content>
                      <View style={styles.paycheckHeader}>
                        <View>
                          <Text style={styles.paycheckDate}>{formatDate(entry.date)}</Text>
                          <Text style={styles.paycheckPeriod}>{entry.payPeriod}</Text>
                        </View>
                        <IconButton 
                          icon="chevron-right" 
                          size={20} 
                        />
                      </View>
                      
                      <Divider style={styles.divider} />
                      
                      <View style={styles.paycheckDetails}>
                        <View style={styles.paycheckColumn}>
                          <Text style={styles.paycheckLabel}>Gross Pay</Text>
                          <Text style={styles.paycheckValue}>{formatCurrency(entry.grossPay)}</Text>
                        </View>
                        <View style={styles.paycheckColumn}>
                          <Text style={styles.paycheckLabel}>Net Pay</Text>
                          <Text style={[styles.paycheckValue, styles.netPayValue]}>{formatCurrency(entry.netPay)}</Text>
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
                
                {/* Current Pay Summary */}
                <Card style={styles.paySummaryCard}>
                  <Card.Content>
                    <Title style={styles.paySummaryTitle}>Current Pay Summary</Title>
                    
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Gross Pay</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(currentPaySummary.grossPay)}</Text>
                    </View>
                    
                    <Divider style={styles.divider} />
                    
                    <Text style={styles.deductionsTitle}>Deductions</Text>
                    
                    {deductions.map((deduction, index) => (
                      <View key={index} style={styles.deductionItem}>
                        <View style={styles.deductionLabelContainer}>
                          <Text style={styles.deductionLabel}>{deduction.name}</Text>
                          {deduction.isPreTax && (
                            <Chip style={styles.preTaxChip} textStyle={styles.preTaxChipText}>Pre-tax</Chip>
                          )}
                        </View>
                        <Text style={styles.deductionValue}>{formatCurrency(deduction.amount)}</Text>
                      </View>
                    ))}
                    
                    <Divider style={[styles.divider, styles.totalDivider]} />
                    
                    <View style={styles.summaryItem}>
                      <Text style={styles.netPayLabel}>Net Pay</Text>
                      <Text style={styles.netPayTotal}>{formatCurrency(currentPaySummary.netPay)}</Text>
                    </View>
                  </Card.Content>
                </Card>
              </>
            )}
            
            {/* Benefits Tab */}
            {activeTab === 'benefits' && (
              <>
                <Title style={styles.sectionTitle}>Your Benefits</Title>
                
                {/* Benefit Contributions */}
                <Card style={styles.benefitsCard}>
                  <Card.Content>
                    <Text style={styles.benefitsSubtitle}>Retirement & HSA Contributions</Text>
                    
                    {benefitContributions.map((benefit) => (
                      <View key={benefit.id} style={styles.benefitItem}>
                        <View style={styles.benefitHeader}>
                          <View style={styles.benefitTitleContainer}>
                            <Icon 
                              name={benefit.type === 'retirement' ? 'piggy-bank' : 'heart-pulse'} 
                              size={20} 
                              color={theme.colors.primary} 
                            />
                            <Text style={styles.benefitTitle}>
                              {benefit.type === 'retirement' ? '401(k) Retirement' : 'Health Savings Account'}
                            </Text>
                          </View>
                          <Text style={styles.ytdTotal}>YTD: {formatCurrency(benefit.ytdTotal)}</Text>
                        </View>
                        
                        <View style={styles.contributionsContainer}>
                          <View style={styles.contributionColumn}>
                            <Text style={styles.contributionLabel}>Your Contribution</Text>
                            <Text style={styles.contributionValue}>{formatCurrency(benefit.employeeContribution)}</Text>
                            <Text style={styles.contributionPeriod}>per pay period</Text>
                          </View>
                          <View style={styles.contributionDivider} />
                          <View style={styles.contributionColumn}>
                            <Text style={styles.contributionLabel}>Employer Contribution</Text>
                            <Text style={styles.contributionValue}>{formatCurrency(benefit.employerContribution)}</Text>
                            <Text style={styles.contributionPeriod}>per pay period</Text>
                          </View>
                        </View>
                        
                        {benefit.nextContribution && (
                          <View style={styles.nextContributionContainer}>
                            <Icon name="calendar-clock" size={16} color={theme.colors.placeholder} />
                            <Text style={styles.nextContributionText}>
                              Next contribution of {formatCurrency(benefit.nextContribution)} on April 15
                            </Text>
                          </View>
                        )}
                        
                        <Button 
                          mode="outlined" 
                          style={styles.updateButton}
                        >
                          Update Contribution
                        </Button>
                      </View>
                    ))}
                  </Card.Content>
                </Card>
                
                {/* Health Insurance */}
                <Card style={styles.benefitsCard}>
                  <Card.Content>
                    <Text style={styles.benefitsSubtitle}>Health Insurance</Text>
                    
                    <View style={styles.insuranceContainer}>
                      <View style={styles.insuranceHeader}>
                        <Icon name="shield-check" size={24} color={theme.colors.primary} />
                        <View style={styles.insurancePlan}>
                          <Text style={styles.insurancePlanName}>Premium PPO Plan</Text>
                          <Text style={styles.insuranceProvider}>BlueCross BlueShield</Text>
                        </View>
                      </View>
                      
                      <View style={styles.insuranceDetails}>
                        <View style={styles.insuranceDetailItem}>
                          <Text style={styles.insuranceDetailLabel}>Coverage</Text>
                          <Text style={styles.insuranceDetailValue}>Employee + Spouse</Text>
                        </View>
                        <View style={styles.insuranceDetailItem}>
                          <Text style={styles.insuranceDetailLabel}>Employee Cost</Text>
                          <Text style={styles.insuranceDetailValue}>{formatCurrency('120.00')} per paycheck</Text>
                        </View>
                        <View style={styles.insuranceDetailItem}>
                          <Text style={styles.insuranceDetailLabel}>Employer Contribution</Text>
                          <Text style={styles.insuranceDetailValue}>{formatCurrency('350.00')} per paycheck</Text>
                        </View>
                        <View style={styles.insuranceDetailItem}>
                          <Text style={styles.insuranceDetailLabel}>Deductible</Text>
                          <Text style={styles.insuranceDetailValue}>{formatCurrency('1500.00')} / year</Text>
                        </View>
                      </View>
                      
                      <Button 
                        mode="outlined" 
                        icon="file-document-outline"
                        style={styles.viewPlanButton}
                      >
                        View Plan Details
                      </Button>
                    </View>
                  </Card.Content>
                </Card>
              </>
            )}
            
            {/* Time Off Tab */}
            {activeTab === 'time' && (
              <>
                <Title style={styles.sectionTitle}>Time Off Balances</Title>
                
                {timeOffBalances.map((balance) => (
                  <Card key={balance.id} style={styles.timeOffCard}>
                    <Card.Content>
                      <View style={styles.timeOffHeader}>
                        <View style={styles.timeOffTitleContainer}>
                          <Avatar.Icon size={36} icon={balance.icon} style={styles.timeOffIcon} />
                          <Text style={styles.timeOffType}>
                            {balance.type.charAt(0).toUpperCase() + balance.type.slice(1)} Time
                          </Text>
                        </View>
                        <View style={styles.timeOffHoursContainer}>
                          <Text style={styles.availableHours}>{balance.available}</Text>
                          <Text style={styles.hoursLabel}>hours available</Text>
                        </View>
                      </View>
                      
                      <View style={styles.timeOffProgressContainer}>
                        <ProgressBar 
                          progress={calculateTimeOffPercentage(balance.used, balance.available)} 
                          color={theme.colors.primary}
                          style={styles.timeOffProgress}
                        />
                        <View style={styles.timeOffStats}>
                          <Text style={styles.usedHours}>{balance.used} used</Text>
                          <Text style={styles.totalHours}>{balance.used + balance.available} total</Text>
                        </View>
                      </View>
                      
                      <View style={styles.accrualContainer}>
                        <Icon name="plus-circle-outline" size={16} color={theme.colors.placeholder} />
                        <Text style={styles.accrualRate}>Accrues at {balance.accrualRate}</Text>
                      </View>
                    </Card.Content>
                  </Card>
                ))}
                
                <Button 
                  mode="contained" 
                  icon="calendar-plus"
                  onPress={goToRequestTimeOff}
                  style={styles.requestTimeOffButton}
                >
                  Request Time Off
                </Button>
                
                {/* Recent Time Off Requests */}
                <Title style={[styles.sectionTitle, styles.recentRequestsTitle]}>Recent Requests</Title>
                
                <Card style={styles.timeOffRequestCard}>
                  <Card.Content>
                    <View style={styles.requestHeaderContainer}>
                      <View>
                        <Text style={styles.requestType}>Vacation Time</Text>
                        <Text style={styles.requestDateRange}>May 24 - May 28, 2025</Text>
                      </View>
                      <Chip 
                        style={[styles.statusChip, { backgroundColor: `${getStatusColor('approved')}20` }]}
                        textStyle={{ color: getStatusColor('approved') }}
                      >
                        Approved
                      </Chip>
                    </View>
                    
                    <View style={styles.requestDetails}>
                      <View style={styles.requestDetailItem}>
                        <Text style={styles.requestDetailLabel}>Duration</Text>
                        <Text style={styles.requestDetailValue}>5 days (40 hours)</Text>
                      </View>
                      <View style={styles.requestDetailItem}>
                        <Text style={styles.requestDetailLabel}>Submitted</Text>
                        <Text style={styles.requestDetailValue}>April 2, 2025</Text>
                      </View>
                      <View style={styles.requestDetailItem}>
                        <Text style={styles.requestDetailLabel}>Approved by</Text>
                        <Text style={styles.requestDetailValue}>Sarah Johnson</Text>
                      </View>
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
        onPress={() => setMenuVisible(true)}
      />
      
      {/* FAB Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }} // This will be updated when menu is shown
      >
        <Menu.Item onPress={goToTimeTracking} title="Log Time" icon="clock-outline" />
        <Menu.Item onPress={goToRequestTimeOff} title="Request Time Off" icon="calendar-check" />
        <Menu.Item onPress={() => {}} title="View Pay Stub" icon="file-document-outline" />
        <Menu.Item onPress={() => {}} title="Update Benefits" icon="shield-check" />
      </Menu>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  walletsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  walletCard: {
    width: 200,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    padding: 16,
    justifyContent: 'center',
  },
  walletCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletType: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  walletBalance: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 4,
  },
  walletIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  tabsCard: {
    marginHorizontal: 16,
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
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  nextPayCard: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  nextPayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextPayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 24,
  },
  nextPayDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPayDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  nextPayPeriod: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  nextPayAmount: {
    alignItems: 'flex-end',
  },
  nextPayLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  nextPayValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  paycheckCard: {
    marginBottom: 12,
  },
  paycheckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paycheckDate: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paycheckPeriod: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  divider: {
    marginVertical: 12,
  },
  paycheckDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paycheckColumn: {
    flex: 1,
  },
  paycheckLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
  paycheckValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  netPayValue: {
    color: theme.colors.primary,
  },
  paySummaryCard: {
    marginBottom: 16,
  },
  paySummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deductionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: theme.colors.placeholder,
  },
  deductionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  deductionLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deductionLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  preTaxChip: {
    height: 20,
    backgroundColor: `${theme.colors.primary}20`,
  },
  preTaxChipText: {
    fontSize: 10,
    color: theme.colors.primary,
  },
  deductionValue: {
    fontSize: 14,
    textAlign: 'right',
  },
  totalDivider: {
    height: 2,
  },
  netPayLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  netPayTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  benefitsCard: {
    marginBottom: 16,
  },
  benefitsSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  benefitItem: {
    marginBottom: 24,
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ytdTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  contributionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contributionColumn: {
    flex: 1,
    alignItems: 'center',
  },
  contributionDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  contributionLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: 4,
    textAlign: 'center',
  },
  contributionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  contributionPeriod: {
    fontSize: 10,
    color: theme.colors.placeholder,
    marginTop: 2,
  },
  nextContributionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextContributionText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginLeft: 4,
  },
  updateButton: {
    marginTop: 4,
  },
  insuranceContainer: {
    marginBottom: 8,
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insurancePlan: {
    marginLeft: 12,
  },
  insurancePlanName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  insuranceProvider: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  insuranceDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  insuranceDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insuranceDetailLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  insuranceDetailValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewPlanButton: {
    marginTop: 4,
  },
  timeOffCard: {
    marginBottom: 12,
  },
  timeOffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeOffTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeOffIcon: {
    backgroundColor: theme.colors.primaryContainer,
    marginRight: 8,
  },
  timeOffType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeOffHoursContainer: {
    alignItems: 'flex-end',
  },
  availableHours: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  hoursLabel: {
    fontSize: 10,
    color: theme.colors.placeholder,
  },
  timeOffProgressContainer: {
    marginVertical: 8,
  },
  timeOffProgress: {
    height: 8,
    borderRadius: 4,
  },
  timeOffStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  usedHours: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  totalHours: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  accrualContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  accrualRate: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginLeft: 4,
  },
  requestTimeOffButton: {
    marginVertical: 16,
  },
  recentRequestsTitle: {
    marginTop: 8,
  },
  timeOffRequestCard: {
    marginBottom: 16,
  },
  requestHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestType: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  requestDateRange: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  requestDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  requestDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requestDetailLabel: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  requestDetailValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default EmployeeWalletScreen;