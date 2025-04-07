import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList, Image } from 'react-native';
import { Card, Text, Button, Chip, Title, Paragraph, Divider, Badge, Avatar, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWallet } from '../../hooks/useWallet';
import theme from '../../utils/theme';

/**
 * ParentWalletScreen provides the parent view of the family wallet
 * It shows parent accounts, child accounts, and provides management features
 */
interface ParentWalletScreenProps {
  onRefresh: () => Promise<void>;
  refreshing: boolean;
}

const ParentWalletScreen: React.FC<ParentWalletScreenProps> = ({ onRefresh, refreshing }) => {
  const { 
    currentUser, 
    accounts, 
    selectedAccount,
    transactions,
    childAccounts,
    childTasks,
    selectAccount,
    savingsGoals,
    recurringPayments
  } = useWallet();
  
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentUser?.preferredCurrency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get color based on transaction type
  const getTransactionColor = (type: string, direction: string) => {
    if (direction === 'incoming') return theme.colors.success;
    if (type === 'transfer') return theme.colors.info;
    return theme.colors.error;
  };

  // Get icon based on transaction type
  const getTransactionIcon = (type: string, direction: string) => {
    if (type === 'deposit' || direction === 'incoming') return 'arrow-down';
    if (type === 'withdrawal' || direction === 'outgoing') return 'arrow-up';
    if (type === 'transfer') return 'swap-horizontal';
    if (type === 'payment') return 'shopping';
    if (type === 'allowance') return 'hand-coin';
    return 'cash';
  };

  // Get savings goal progress percentage
  const getGoalProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Filter transactions for the selected account
  const accountTransactions = transactions
    .filter(t => 
      !selectedAccount?.id || 
      t.fromAccountId === selectedAccount?.id || 
      t.toAccountId === selectedAccount?.id
    )
    .slice(0, 10);

  // Render Account Cards
  const renderAccountCard = (account: any) => {
    const isSelected = selectedAccount?.id === account.id;
    
    return (
      <TouchableOpacity
        key={account.id}
        style={[
          styles.accountCard,
          isSelected && styles.selectedAccountCard
        ]}
        onPress={() => selectAccount(account.id)}
      >
        <View style={styles.accountCardContent}>
          <View style={styles.accountIconContainer}>
            {account.type === 'primary' && (
              <Icon name="wallet" size={24} color={theme.walletColorSchemes.personal.primary} />
            )}
            {account.type === 'savings' && (
              <Icon name="piggy-bank" size={24} color={theme.walletColorSchemes.personal.primary} />
            )}
            {account.type === 'checking' && (
              <Icon name="checkbox-marked-circle-outline" size={24} color={theme.walletColorSchemes.personal.primary} />
            )}
            {account.type === 'business' && (
              <Icon name="briefcase" size={24} color={theme.walletColorSchemes.business.primary} />
            )}
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountBalance}>{formatCurrency(account.balance)}</Text>
          </View>
          {account.isDefault && (
            <Badge style={styles.defaultBadge}>Default</Badge>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render Transaction Item
  const renderTransactionItem = ({ item }: { item: any }) => {
    const isIncoming = item.direction === 'incoming';
    const iconName = getTransactionIcon(item.type, item.direction);
    const iconColor = getTransactionColor(item.type, item.direction);
    
    return (
      <Card style={styles.transactionCard}>
        <Card.Content style={styles.transactionContent}>
          <View style={styles.transactionIcon}>
            <Icon name={iconName} size={24} color={iconColor} />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionDescription}>{item.description}</Text>
            <Text style={styles.transactionMeta}>
              {formatDate(item.date)} • {item.category}
            </Text>
          </View>
          <Text
            style={[
              styles.transactionAmount,
              { color: iconColor }
            ]}
          >
            {isIncoming ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  // Render Child Account
  const renderChildAccount = (child: any) => {
    const pendingTasks = childTasks[child.childId]?.filter(task => 
      task.status === 'completed'
    ).length || 0;
    
    return (
      <Card key={child.id} style={styles.childCard}>
        <Card.Content>
          <View style={styles.childCardHeader}>
            <Avatar.Text 
              size={40} 
              label={child.childName.charAt(0)}
              style={{
                backgroundColor: theme.walletColorSchemes.child.primary
              }}
            />
            <View style={styles.childCardHeaderContent}>
              <Text style={styles.childName}>{child.childName}</Text>
              <Chip 
                style={[
                  styles.statusChip,
                  { 
                    backgroundColor: 
                      child.status === 'active' 
                        ? theme.colors.success + '20'
                        : theme.colors.warning + '20'
                  }
                ]}
                textStyle={{
                  color: 
                    child.status === 'active' 
                      ? theme.colors.success
                      : theme.colors.warning
                }}
              >
                {child.status.charAt(0).toUpperCase() + child.status.slice(1)}
              </Chip>
            </View>
            <Text style={styles.childBalance}>
              {formatCurrency(child.balance)}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.childCardFooter}>
            <View style={styles.allowanceInfo}>
              <Text style={styles.allowanceLabel}>Next Allowance:</Text>
              <Text style={styles.allowanceValue}>
                {formatCurrency(child.allowance.amount)} • {formatDate(child.allowance.nextDate)}
              </Text>
            </View>
            
            <View style={styles.childCardActions}>
              {pendingTasks > 0 && (
                <Badge style={styles.tasksBadge}>{pendingTasks}</Badge>
              )}
              <Button 
                mode="outlined"
                compact
                style={styles.childCardButton}
                onPress={() => navigation.navigate('ChildDetails' as never, { childId: child.childId } as never)}
              >
                Manage
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render Savings Goal
  const renderSavingsGoal = (goal: any) => {
    const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
    
    return (
      <Card key={goal.id} style={styles.goalCard}>
        <Card.Content>
          <View style={styles.goalHeader}>
            <View style={styles.goalIconContainer}>
              <Icon 
                name={
                  goal.category === 'Travel' ? 'airplane' :
                  goal.category === 'Education' ? 'school' :
                  goal.category === 'Home' ? 'home' :
                  'piggy-bank'
                } 
                size={24} 
                color={theme.walletColorSchemes.personal.primary} 
              />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <Text style={styles.goalTarget}>
                Target: {formatCurrency(goal.targetAmount)} by {formatDate(goal.targetDate)}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress}%` }
                ]}
              />
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>{formatCurrency(goal.currentAmount)}</Text>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Tab-based UI for parent wallet
  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>My Accounts</Text>
                <Button 
                  mode="text" 
                  compact 
                  onPress={() => navigation.navigate('AddAccount' as never)}
                >
                  Add
                </Button>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.accountsScrollContent}
              >
                {accounts.map(renderAccountCard)}
              </ScrollView>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Transactions</Text>
                <Button 
                  mode="text" 
                  compact 
                  onPress={() => navigation.navigate('Transactions' as never)}
                >
                  View All
                </Button>
              </View>
              {accountTransactions.length > 0 ? (
                <FlatList
                  data={accountTransactions}
                  renderItem={renderTransactionItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={styles.emptyState}>
                      <Icon name="cash" size={48} color={theme.colors.gray300} />
                      <Text style={styles.emptyStateText}>No transactions yet</Text>
                    </View>
                  }
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="cash" size={48} color={theme.colors.gray300} />
                  <Text style={styles.emptyStateText}>No transactions yet</Text>
                </View>
              )}
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
              </View>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={() => navigation.navigate('SendMoney' as never)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                    <Icon name="send" size={28} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.quickActionText}>Send Money</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={() => navigation.navigate('RequestMoney' as never)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.success + '15' }]}>
                    <Icon name="cash-plus" size={28} color={theme.colors.success} />
                  </View>
                  <Text style={styles.quickActionText}>Request</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={() => navigation.navigate('ScanQR' as never)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.info + '15' }]}>
                    <Icon name="qrcode-scan" size={28} color={theme.colors.info} />
                  </View>
                  <Text style={styles.quickActionText}>Scan QR</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.quickActionItem}
                  onPress={() => navigation.navigate('AddPaymentMethod' as never)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.secondary + '15' }]}>
                    <Icon name="credit-card-plus" size={28} color={theme.colors.secondary} />
                  </View>
                  <Text style={styles.quickActionText}>Add Card</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        );
        
      case 'family':
        return (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Child Accounts</Text>
                <Button 
                  mode="text" 
                  compact 
                  onPress={() => navigation.navigate('AddChild' as never)}
                >
                  Add
                </Button>
              </View>
              
              {childAccounts.length > 0 ? (
                <View style={styles.childrenList}>
                  {childAccounts.map(renderChildAccount)}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="account-child" size={48} color={theme.colors.gray300} />
                  <Text style={styles.emptyStateText}>No child accounts yet</Text>
                  <Button 
                    mode="outlined"
                    style={styles.emptyStateButton}
                    onPress={() => navigation.navigate('AddChild' as never)}
                  >
                    Add Child Account
                  </Button>
                </View>
              )}
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Family Features</Text>
              </View>
              <Card style={styles.featuresCard}>
                <Card.Content>
                  <View style={styles.featuresGrid}>
                    <TouchableOpacity 
                      style={styles.featureItem}
                      onPress={() => navigation.navigate('AllowanceSettings' as never)}
                    >
                      <Icon name="calendar-clock" size={32} color={theme.walletColorSchemes.family.primary} />
                      <Text style={styles.featureItemText}>Allowance Settings</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.featureItem}
                      onPress={() => navigation.navigate('TaskManager' as never)}
                    >
                      <Icon name="clipboard-check" size={32} color={theme.walletColorSchemes.family.primary} />
                      <Text style={styles.featureItemText}>Tasks & Rewards</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.featureItem}
                      onPress={() => navigation.navigate('SpendingLimits' as never)}
                    >
                      <Icon name="lock-outline" size={32} color={theme.walletColorSchemes.family.primary} />
                      <Text style={styles.featureItemText}>Spending Limits</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.featureItem}
                      onPress={() => navigation.navigate('FinancialEducation' as never)}
                    >
                      <Icon name="school" size={32} color={theme.walletColorSchemes.family.primary} />
                      <Text style={styles.featureItemText}>Financial Education</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </>
        );
        
      case 'goals':
        return (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Savings Goals</Text>
                <Button 
                  mode="text" 
                  compact 
                  onPress={() => navigation.navigate('AddSavingsGoal' as never)}
                >
                  Add
                </Button>
              </View>
              
              {savingsGoals.length > 0 ? (
                <View style={styles.goalsList}>
                  {savingsGoals.map(renderSavingsGoal)}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="piggy-bank" size={48} color={theme.colors.gray300} />
                  <Text style={styles.emptyStateText}>No savings goals yet</Text>
                  <Button 
                    mode="outlined"
                    style={styles.emptyStateButton}
                    onPress={() => navigation.navigate('AddSavingsGoal' as never)}
                  >
                    Create Savings Goal
                  </Button>
                </View>
              )}
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recurring Payments</Text>
                <Button 
                  mode="text" 
                  compact 
                  onPress={() => navigation.navigate('AddRecurringPayment' as never)}
                >
                  Add
                </Button>
              </View>
              
              {recurringPayments.length > 0 ? (
                <View style={styles.recurringPaymentsList}>
                  {recurringPayments.map(payment => (
                    <Card key={payment.id} style={styles.paymentCard}>
                      <Card.Content style={styles.paymentCardContent}>
                        <View style={styles.paymentIconContainer}>
                          <Icon 
                            name={
                              payment.category === 'Entertainment' ? 'television' :
                              payment.category === 'Utilities' ? 'lightning-bolt' :
                              payment.category === 'Subscription' ? 'repeat' :
                              'calendar-check'
                            } 
                            size={24} 
                            color={theme.colors.primary} 
                          />
                        </View>
                        <View style={styles.paymentDetails}>
                          <Text style={styles.paymentName}>{payment.name}</Text>
                          <Text style={styles.paymentSchedule}>
                            {formatCurrency(payment.amount)} • {payment.frequency}
                          </Text>
                          <Text style={styles.paymentNextDate}>
                            Next payment: {formatDate(payment.nextDate)}
                          </Text>
                        </View>
                        <Chip 
                          style={[
                            styles.statusChip,
                            { 
                              backgroundColor: 
                                payment.status === 'active' 
                                  ? theme.colors.success + '20'
                                  : payment.status === 'paused'
                                    ? theme.colors.warning + '20'
                                    : theme.colors.error + '20'
                            }
                          ]}
                          textStyle={{
                            color: 
                              payment.status === 'active' 
                                ? theme.colors.success
                                : payment.status === 'paused'
                                  ? theme.colors.warning
                                  : theme.colors.error
                          }}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Chip>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="calendar-repeat" size={48} color={theme.colors.gray300} />
                  <Text style={styles.emptyStateText}>No recurring payments yet</Text>
                  <Button 
                    mode="outlined"
                    style={styles.emptyStateButton}
                    onPress={() => navigation.navigate('AddRecurringPayment' as never)}
                  >
                    Set Up Recurring Payment
                  </Button>
                </View>
              )}
            </View>
          </>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <Avatar.Text
              size={40}
              label={currentUser?.firstName.charAt(0) || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <View style={styles.userNameContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{currentUser?.firstName}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications' as never)}
            >
              <Icon name="bell-outline" size={24} color={theme.colors.textDark} />
              <Badge style={styles.notificationBadge}>3</Badge>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Settings' as never)}
            >
              <Icon name="cog-outline" size={24} color={theme.colors.textDark} />
            </TouchableOpacity>
          </View>
        </View>
        
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
            style={[styles.tab, activeTab === 'family' && styles.activeTab]} 
            onPress={() => setActiveTab('family')}
          >
            <Text style={[styles.tabText, activeTab === 'family' && styles.activeTabText]}>
              Family
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'goals' && styles.activeTab]} 
            onPress={() => setActiveTab('goals')}
          >
            <Text style={[styles.tabText, activeTab === 'goals' && styles.activeTabText]}>
              Goals
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="plus"
        color={theme.colors.white}
        onPress={() => {
          switch (activeTab) {
            case 'family':
              navigation.navigate('AddChild' as never);
              break;
            case 'goals':
              navigation.navigate('AddSavingsGoal' as never);
              break;
            default:
              navigation.navigate('SendMoney' as never);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  header: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
    ...theme.shadows.sm,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameContainer: {
    marginLeft: theme.spacing[3],
  },
  welcomeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  userName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: theme.spacing[4],
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[20], // Extra padding for FAB
  },
  section: {
    marginTop: theme.spacing[5],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
  },
  accountsScrollContent: {
    paddingRight: theme.spacing[4],
  },
  accountCard: {
    width: 200,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    marginRight: theme.spacing[3],
    ...theme.shadows.sm,
  },
  selectedAccountCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  accountCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[2],
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textDark,
    marginBottom: theme.spacing[1],
  },
  accountBalance: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
  },
  defaultBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    fontSize: 10,
  },
  transactionCard: {
    marginBottom: theme.spacing[2],
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textDark,
    marginBottom: theme.spacing[1],
  },
  transactionMeta: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  transactionAmount: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -theme.spacing[1],
  },
  quickActionItem: {
    width: '25%',
    padding: theme.spacing[1],
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  quickActionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textDark,
    textAlign: 'center',
  },
  childrenList: {
    marginTop: theme.spacing[2],
  },
  childCard: {
    marginBottom: theme.spacing[3],
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  childCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childCardHeaderContent: {
    flex: 1,
    marginLeft: theme.spacing[3],
  },
  childName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.textDark,
    marginBottom: theme.spacing[1],
  },
  statusChip: {
    height: 24,
    alignSelf: 'flex-start',
  },
  childBalance: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
  },
  divider: {
    marginVertical: theme.spacing[3],
  },
  childCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  allowanceInfo: {
    flex: 1,
  },
  allowanceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[1],
  },
  allowanceValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textDark,
  },
  childCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  tasksBadge: {
    position: 'absolute',
    right: 70,
    top: -10,
    backgroundColor: theme.colors.warning,
    color: theme.colors.white,
  },
  childCardButton: {
    marginLeft: theme.spacing[2],
  },
  featuresCard: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -theme.spacing[1],
  },
  featureItem: {
    width: '50%',
    padding: theme.spacing[3],
    alignItems: 'center',
  },
  featureItemText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textDark,
    textAlign: 'center',
    marginTop: theme.spacing[2],
  },
  goalsList: {
    marginTop: theme.spacing[2],
  },
  goalCard: {
    marginBottom: theme.spacing[3],
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.textDark,
    marginBottom: theme.spacing[1],
  },
  goalTarget: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  progressContainer: {
    marginTop: theme.spacing[2],
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.full,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing[2],
  },
  progressText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.textDark,
  },
  progressPercentage: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.success,
  },
  recurringPaymentsList: {
    marginTop: theme.spacing[2],
  },
  paymentCard: {
    marginBottom: theme.spacing[3],
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.textDark,
    marginBottom: theme.spacing[1],
  },
  paymentSchedule: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[1],
  },
  paymentNextDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing[6],
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  emptyStateButton: {
    marginTop: theme.spacing[2],
  },
  fab: {
    position: 'absolute',
    right: theme.spacing[5],
    bottom: theme.spacing[5],
    backgroundColor: theme.colors.primary,
  },
});

export default ParentWalletScreen;