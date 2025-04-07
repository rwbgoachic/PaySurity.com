import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Title, Paragraph, FAB, Avatar, Chip, Button, Badge, Divider, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useWallet, { Transaction, SavingsGoal } from '../../hooks/useWallet';
import { colors, commonStyles, spacing, walletColorSchemes } from '../../utils/theme';

/**
 * ParentWalletScreen
 * This screen displays the parent wallet interface where parents can:
 * - View their wallet balance and recent transactions
 * - Send money to family members
 * - View and manage their children's savings goals
 * - View and approve/deny children's money requests
 */
const ParentWalletScreen = () => {
  const navigation = useNavigation();
  const {
    currentWallet,
    loading,
    getWalletInfo,
    getTransactions,
    getSavingsGoals,
    formatCurrency,
  } = useWallet();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState([
    { id: 102, name: 'Billy', role: 'child', age: 12, balance: '75.50', currency: 'USD' },
    { id: 103, name: 'Emma', role: 'child', age: 15, balance: '120.25', currency: 'USD' },
    { id: 104, name: 'Sarah', role: 'spouse', age: 42, balance: '750.00', currency: 'USD' },
  ]);
  
  // Load wallet data on component mount
  useEffect(() => {
    loadWalletData();
  }, []);
  
  // Load all wallet data
  const loadWalletData = async () => {
    try {
      await getWalletInfo();
      const transactionData = await getTransactions();
      setTransactions(transactionData);
      
      const savingsGoalData = await getSavingsGoals();
      setSavingsGoals(savingsGoalData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };
  
  // Filter transactions by type
  const getFilteredTransactions = () => {
    if (!selectedFilterType) {
      return transactions;
    }
    return transactions.filter(transaction => transaction.type === selectedFilterType);
  };
  
  // Get displayed transactions based on view all or limited
  const getDisplayedTransactions = () => {
    const filtered = getFilteredTransactions();
    if (showAllTransactions) {
      return filtered;
    }
    return filtered.slice(0, 3);
  };
  
  // Handle transaction filter selection
  const handleFilterSelect = (type: string) => {
    if (selectedFilterType === type) {
      setSelectedFilterType(null);
    } else {
      setSelectedFilterType(type);
    }
  };
  
  // Navigate to transaction details
  const goToTransactionDetails = (transaction: Transaction) => {
    navigation.navigate('TransactionDetailsScreen' as never, { transactionId: transaction.id } as never);
  };
  
  // Show loading indicator while data is being fetched
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading wallet information...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Wallet Balance */}
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Text style={styles.balanceLabel}>Family Wallet Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(currentWallet?.balance || '0')}</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('SendMoneyScreen' as never)}
              >
                <View style={styles.quickActionIconContainer}>
                  <Icon name="send" size={22} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>Send</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('RequestMoneyScreen' as never)}
              >
                <View style={styles.quickActionIconContainer}>
                  <Icon name="cash-plus" size={22} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>Request</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('ScanQRScreen' as never)}
              >
                <View style={styles.quickActionIconContainer}>
                  <Icon name="qrcode-scan" size={22} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>Scan</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('AddPaymentMethodScreen' as never)}
              >
                <View style={styles.quickActionIconContainer}>
                  <Icon name="credit-card-plus" size={22} color={colors.primary} />
                </View>
                <Text style={styles.quickActionText}>Add</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
        
        {/* Family Members */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Family Members</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddChildScreen' as never)}>
              <Icon name="account-plus" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.familyMembersScroll}>
            {familyMembers.map(member => (
              <TouchableOpacity 
                key={member.id}
                style={styles.familyMemberCard}
                onPress={() => navigation.navigate(
                  member.role === 'child' 
                    ? 'ChildDetailsScreen' as never 
                    : 'FamilyMemberDetailsScreen' as never,
                  { memberId: member.id } as never
                )}
              >
                <Avatar.Text 
                  size={50} 
                  label={member.name.substring(0, 2)}
                  style={{ backgroundColor: member.role === 'child' ? colors.secondary : colors.tertiary }}
                />
                <Text style={styles.familyMemberName}>{member.name}</Text>
                <Text style={styles.familyMemberRole}>
                  {member.role === 'child' ? `Child (${member.age})` : 'Spouse'}
                </Text>
                <Text style={styles.familyMemberBalance}>{formatCurrency(member.balance)}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.familyMemberCard, styles.addFamilyMemberCard]}
              onPress={() => navigation.navigate('AddFamilyMemberScreen' as never)}
            >
              <View style={styles.addFamilyMemberButton}>
                <Icon name="plus" size={28} color={colors.primary} />
              </View>
              <Text style={styles.addFamilyMemberText}>Add Family Member</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Transactions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => setShowAllTransactions(!showAllTransactions)}>
              <Text style={styles.viewAllText}>
                {showAllTransactions ? 'View Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Transaction Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilterType === 'deposit' && styles.filterChipSelected
              ]}
              onPress={() => handleFilterSelect('deposit')}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilterType === 'deposit' && styles.filterChipTextSelected
              ]}>
                Deposits
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilterType === 'withdrawal' && styles.filterChipSelected
              ]}
              onPress={() => handleFilterSelect('withdrawal')}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilterType === 'withdrawal' && styles.filterChipTextSelected
              ]}>
                Withdrawals
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilterType === 'transfer' && styles.filterChipSelected
              ]}
              onPress={() => handleFilterSelect('transfer')}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilterType === 'transfer' && styles.filterChipTextSelected
              ]}>
                Transfers
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilterType === 'payment' && styles.filterChipSelected
              ]}
              onPress={() => handleFilterSelect('payment')}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilterType === 'payment' && styles.filterChipTextSelected
              ]}>
                Payments
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilterType === 'allowance' && styles.filterChipSelected
              ]}
              onPress={() => handleFilterSelect('allowance')}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilterType === 'allowance' && styles.filterChipTextSelected
              ]}>
                Allowances
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          {/* Transactions List */}
          {getDisplayedTransactions().length === 0 ? (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <Icon name="cash-remove" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No transactions found</Text>
                {selectedFilterType && (
                  <Button 
                    mode="outlined" 
                    onPress={() => setSelectedFilterType(null)}
                    style={styles.clearFilterButton}
                  >
                    Clear Filter
                  </Button>
                )}
              </Card.Content>
            </Card>
          ) : (
            getDisplayedTransactions().map(transaction => (
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
                        color={getTransactionColor(transaction.type)} 
                      />
                    </View>
                    
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(new Date(transaction.createdAt))}
                      </Text>
                    </View>
                    
                    <View style={styles.transactionAmountContainer}>
                      <Text 
                        style={[
                          styles.transactionAmount,
                          transaction.type === 'deposit' || transaction.type === 'payment_received'
                            ? styles.incomingAmount
                            : styles.outgoingAmount
                        ]}
                      >
                        {transaction.type === 'deposit' || transaction.type === 'payment_received'
                          ? '+'
                          : '-'} 
                        {formatCurrency(transaction.amount)}
                      </Text>
                      {transaction.status === 'pending' && (
                        <Badge style={styles.pendingBadge}>Pending</Badge>
                      )}
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            ))
          )}
          
          {!showAllTransactions && transactions.length > 3 && (
            <Button 
              mode="text" 
              onPress={() => setShowAllTransactions(true)}
              style={styles.viewMoreButton}
            >
              View More Transactions
            </Button>
          )}
        </View>
        
        {/* Children's Savings Goals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Children's Savings Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddSavingsGoalScreen' as never)}>
              <Icon name="target" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {savingsGoals.length === 0 ? (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <Icon name="piggy-bank" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No savings goals yet</Text>
                <Button 
                  mode="outlined" 
                  onPress={() => navigation.navigate('AddSavingsGoalScreen' as never)}
                  style={styles.addButton}
                >
                  Create Savings Goal
                </Button>
              </Card.Content>
            </Card>
          ) : (
            savingsGoals.map(goal => {
              const progress = parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount);
              return (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => navigation.navigate('SavingsGoalDetailsScreen' as never, { goalId: goal.id } as never)}
                >
                  <Card style={styles.savingsGoalCard}>
                    <Card.Content>
                      <View style={styles.savingsGoalHeader}>
                        <View>
                          <Text style={styles.savingsGoalTitle}>{goal.name}</Text>
                          <Text style={styles.savingsGoalChild}>
                            For: {familyMembers.find(m => m.id === goal.childId)?.name || 'Unknown'}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.savingsGoalAmount}>
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </Text>
                          <Text style={styles.savingsGoalProgress}>
                            {Math.round(progress * 100)}% Complete
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground} />
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${Math.min(progress * 100, 100)}%` }
                          ]}
                        />
                      </View>
                      
                      <View style={styles.savingsGoalFooter}>
                        <Text style={styles.savingsGoalDescription}>
                          {goal.description}
                        </Text>
                        {goal.dueDate && (
                          <Text style={styles.savingsGoalDueDate}>
                            Due: {formatDate(new Date(goal.dueDate))}
                          </Text>
                        )}
                      </View>
                      
                      <Button 
                        mode="contained" 
                        style={styles.contributionButton}
                        onPress={() => navigation.navigate(
                          'ContributeToGoalScreen' as never, 
                          { goalId: goal.id, childId: goal.childId } as never
                        )}
                      >
                        Contribute
                      </Button>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        
        {/* Money Request Approvals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Money Request Approvals</Text>
          </View>
          
          <Card style={styles.emptyStateCard}>
            <Card.Content style={styles.emptyStateContent}>
              <Icon name="cash-check" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No pending money requests</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('SendMoneyScreen' as never)}
      />
    </SafeAreaView>
  );
};

// Helper functions
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
      return 'credit-card-check-outline';
    case 'allowance':
      return 'cash-clock';
    case 'expense_reimbursement':
      return 'cash-refund';
    default:
      return 'cash';
  }
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'deposit':
    case 'payment_received':
      return colors.success;
    case 'withdrawal':
    case 'payment':
      return colors.error;
    case 'transfer':
      return colors.primary;
    case 'allowance':
      return colors.secondary;
    case 'expense_reimbursement':
      return colors.info;
    default:
      return colors.text;
  }
};

const formatDate = (date: Date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date >= today) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date >= yesterday) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
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
  balanceCard: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: walletColorSchemes.parent.primary,
    ...commonStyles.shadowHeavy,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  emptyStateCard: {
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginVertical: spacing.sm,
    ...commonStyles.shadow,
  },
  emptyStateContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  clearFilterButton: {
    marginTop: spacing.sm,
  },
  addButton: {
    marginTop: spacing.md,
  },
  familyMembersScroll: {
    marginVertical: spacing.sm,
  },
  familyMemberCard: {
    width: 100,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.sm,
    marginRight: spacing.sm,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  familyMemberName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  familyMemberRole: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  familyMemberBalance: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  addFamilyMemberCard: {
    justifyContent: 'center',
    backgroundColor: `${colors.primary}10`,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  addFamilyMemberButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFamilyMemberText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  transactionCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    ...commonStyles.shadow,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  incomingAmount: {
    color: colors.success,
  },
  outgoingAmount: {
    color: colors.error,
  },
  pendingBadge: {
    backgroundColor: colors.warning,
    color: '#000000',
    marginTop: 4,
  },
  viewMoreButton: {
    marginTop: spacing.xs,
  },
  savingsGoalCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    ...commonStyles.shadow,
  },
  savingsGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  savingsGoalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  savingsGoalChild: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  savingsGoalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'right',
  },
  savingsGoalProgress: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  progressBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.divider,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  savingsGoalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  savingsGoalDescription: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  savingsGoalDueDate: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  contributionButton: {
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
  },
});

export default ParentWalletScreen;