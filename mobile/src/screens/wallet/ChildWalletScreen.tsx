import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Button, FAB, Avatar, Badge, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useWallet, { Transaction, SavingsGoal } from '../../hooks/useWallet';
import { colors, commonStyles, spacing, walletColorSchemes } from '../../utils/theme';

/**
 * ChildWalletScreen
 * This screen displays the child wallet interface where children can:
 * - View their wallet balance and recent transactions
 * - Request money from parents
 * - View and manage their savings goals
 * - Complete chores and educational tasks to earn money
 */
const ChildWalletScreen = () => {
  const navigation = useNavigation();
  const {
    currentWallet,
    loading,
    getWalletInfo,
    getTransactions,
    getSavingsGoals,
    formatCurrency,
    requestFunds,
  } = useWallet();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Clean your room', reward: '5.00', status: 'pending', dueDate: '2025-04-10' },
    { id: 2, name: 'Do your homework', reward: '3.00', status: 'pending', dueDate: '2025-04-08' },
    { id: 3, name: 'Take out trash', reward: '2.00', status: 'completed', completedDate: '2025-04-05' },
  ]);
  const [rewards, setRewards] = useState([
    { id: 1, name: 'Video game time (1 hour)', cost: '10.00', status: 'available' },
    { id: 2, name: 'Movie night', cost: '20.00', status: 'available' },
    { id: 3, name: 'New toy', cost: '30.00', status: 'locked', unlocksAt: '50.00' },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
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
  
  // Get displayed transactions based on view all or limited
  const getDisplayedTransactions = () => {
    if (showAllTransactions) {
      return transactions;
    }
    return transactions.slice(0, 3);
  };
  
  // Navigate to transaction details
  const goToTransactionDetails = (transaction: Transaction) => {
    navigation.navigate('TransactionDetailsScreen' as never, { transactionId: transaction.id } as never);
  };
  
  // Request money from parent
  const handleRequestMoney = () => {
    navigation.navigate('RequestMoneyScreen' as never);
  };
  
  // Show loading indicator while data is being fetched
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={walletColorSchemes.child.primary} />
        <Text style={styles.loadingText}>Loading your wallet...</Text>
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
            <Text style={styles.balanceLabel}>My Wallet Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(currentWallet?.balance || '0')}</Text>
            
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={handleRequestMoney}
              >
                <View style={styles.quickActionIconContainer}>
                  <Icon name="cash-plus" size={24} color={walletColorSchemes.child.primary} />
                </View>
                <Text style={styles.quickActionText}>Request Money</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('ScanQRScreen' as never)}
              >
                <View style={styles.quickActionIconContainer}>
                  <Icon name="qrcode-scan" size={24} color={walletColorSchemes.child.primary} />
                </View>
                <Text style={styles.quickActionText}>Scan Code</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('AddSavingsGoalScreen' as never)}
              >
                <View style={styles.quickActionIconContainer}>
                  <Icon name="piggy-bank" size={24} color={walletColorSchemes.child.primary} />
                </View>
                <Text style={styles.quickActionText}>Start Saving</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
        
        {/* My Savings Goals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Savings Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddSavingsGoalScreen' as never)}>
              <Icon name="target" size={24} color={walletColorSchemes.child.primary} />
            </TouchableOpacity>
          </View>
          
          {savingsGoals.length === 0 ? (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <Icon name="piggy-bank" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>You don't have any savings goals yet!</Text>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('AddSavingsGoalScreen' as never)}
                  style={styles.addButton}
                  buttonColor={walletColorSchemes.child.primary}
                >
                  Start Saving for Something
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
                        <Text style={styles.savingsGoalTitle}>{goal.name}</Text>
                        <Text style={styles.savingsGoalAmount}>
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </Text>
                      </View>
                      
                      <ProgressBar
                        progress={progress}
                        color={walletColorSchemes.child.primary}
                        style={styles.progressBar}
                      />
                      
                      <View style={styles.savingsGoalFooter}>
                        <Text style={styles.savingsGoalDescription}>
                          {goal.description}
                        </Text>
                        <Text style={styles.savingsGoalProgress}>
                          {Math.round(progress * 100)}% Complete
                        </Text>
                      </View>
                      
                      {goal.dueDate && (
                        <Text style={styles.savingsGoalDueDate}>
                          Due: {formatDate(new Date(goal.dueDate))}
                        </Text>
                      )}
                      
                      <Button 
                        mode="contained" 
                        style={styles.contributionButton}
                        buttonColor={walletColorSchemes.child.primary}
                        onPress={() => navigation.navigate(
                          'AddToSavingsGoalScreen' as never, 
                          { goalId: goal.id } as never
                        )}
                      >
                        Add to Savings
                      </Button>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        
        {/* My Tasks */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Tasks</Text>
          </View>
          
          {tasks.filter(task => task.status === 'pending').length === 0 ? (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <Icon name="checkbox-marked-circle-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>You've completed all your tasks!</Text>
              </Card.Content>
            </Card>
          ) : (
            tasks.filter(task => task.status === 'pending').map(task => (
              <Card key={task.id} style={styles.taskCard}>
                <Card.Content>
                  <View style={styles.taskHeader}>
                    <Text style={styles.taskTitle}>{task.name}</Text>
                    <Text style={styles.taskReward}>+{formatCurrency(task.reward)}</Text>
                  </View>
                  
                  <View style={styles.taskFooter}>
                    <Text style={styles.taskDueDate}>Due: {formatDate(new Date(task.dueDate))}</Text>
                    <Button 
                      mode="contained" 
                      compact 
                      buttonColor={walletColorSchemes.child.secondary}
                      onPress={() => {
                        // Mark task as completed
                        const updatedTasks = tasks.map(t => 
                          t.id === task.id 
                            ? { ...t, status: 'completed', completedDate: new Date().toISOString() } 
                            : t
                        );
                        setTasks(updatedTasks);
                      }}
                    >
                      Mark Done
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
          
          {tasks.filter(task => task.status === 'completed').length > 0 && (
            <>
              <View style={styles.subsectionHeader}>
                <Text style={styles.subsectionTitle}>Completed Tasks</Text>
              </View>
              
              {tasks.filter(task => task.status === 'completed').map(task => (
                <Card key={task.id} style={styles.completedTaskCard}>
                  <Card.Content>
                    <View style={styles.taskHeader}>
                      <View style={styles.taskTitleContainer}>
                        <Icon name="check-circle" size={20} color={colors.success} style={styles.taskCheckIcon} />
                        <Text style={styles.completedTaskTitle}>{task.name}</Text>
                      </View>
                      <Text style={styles.taskReward}>+{formatCurrency(task.reward)}</Text>
                    </View>
                    
                    <Text style={styles.taskCompletedDate}>
                      Completed: {formatDate(new Date(task.completedDate))}
                    </Text>
                  </Card.Content>
                </Card>
              ))}
            </>
          )}
        </View>
        
        {/* Rewards */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rewards</Text>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rewardsScrollView}>
            {rewards.map(reward => (
              <Card 
                key={reward.id} 
                style={[
                  styles.rewardCard,
                  reward.status === 'locked' && styles.lockedRewardCard
                ]}
              >
                <Card.Content style={styles.rewardContent}>
                  <View style={styles.rewardIconContainer}>
                    <Icon 
                      name={reward.status === 'locked' ? 'lock' : 'gift'} 
                      size={28} 
                      color={reward.status === 'locked' ? colors.textSecondary : walletColorSchemes.child.accent} 
                    />
                  </View>
                  <Text style={styles.rewardTitle}>{reward.name}</Text>
                  <Text style={styles.rewardCost}>{formatCurrency(reward.cost)}</Text>
                  
                  {reward.status === 'locked' ? (
                    <Text style={styles.rewardLocked}>
                      Unlocks at {formatCurrency(reward.unlocksAt)}
                    </Text>
                  ) : (
                    <Button
                      mode="contained"
                      style={styles.rewardButton}
                      buttonColor={walletColorSchemes.child.accent}
                      disabled={parseFloat(currentWallet?.balance || '0') < parseFloat(reward.cost)}
                      onPress={() => {
                        // Handle redeeming reward
                      }}
                    >
                      Redeem
                    </Button>
                  )}
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>
        
        {/* Recent Transactions */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => setShowAllTransactions(!showAllTransactions)}>
              <Text style={styles.viewAllText}>
                {showAllTransactions ? 'View Less' : 'View All'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {getDisplayedTransactions().length === 0 ? (
            <Card style={styles.emptyStateCard}>
              <Card.Content style={styles.emptyStateContent}>
                <Icon name="cash-remove" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>No transactions yet</Text>
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
                          transaction.type === 'deposit' || transaction.type === 'allowance' || transaction.type === 'payment_received'
                            ? styles.incomingAmount
                            : styles.outgoingAmount
                        ]}
                      >
                        {transaction.type === 'deposit' || transaction.type === 'allowance' || transaction.type === 'payment_received'
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
              textColor={walletColorSchemes.child.primary}
            >
              View More Transactions
            </Button>
          )}
        </View>
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="cash-plus"
        color="#FFFFFF"
        onPress={handleRequestMoney}
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
    default:
      return 'cash';
  }
};

const getTransactionColor = (type: string) => {
  switch (type) {
    case 'deposit':
    case 'payment_received':
    case 'allowance':
      return colors.success;
    case 'withdrawal':
    case 'payment':
      return colors.error;
    case 'transfer':
      return walletColorSchemes.child.primary;
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
    backgroundColor: walletColorSchemes.child.background,
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
    backgroundColor: walletColorSchemes.child.primary,
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
    justifyContent: 'space-around',
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
    color: walletColorSchemes.child.primary,
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
  addButton: {
    marginTop: spacing.md,
  },
  savingsGoalCard: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    ...commonStyles.shadow,
  },
  savingsGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  savingsGoalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  savingsGoalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: walletColorSchemes.child.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: spacing.sm,
  },
  savingsGoalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  savingsGoalDescription: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  savingsGoalProgress: {
    fontSize: 14,
    fontWeight: '500',
    color: walletColorSchemes.child.primary,
  },
  savingsGoalDueDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  contributionButton: {
    marginTop: spacing.sm,
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
    backgroundColor: `${walletColorSchemes.child.primary}10`,
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
  taskCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    ...commonStyles.shadow,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  taskReward: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.success,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDueDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  subsectionHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  completedTaskCard: {
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    opacity: 0.8,
    ...commonStyles.shadow,
  },
  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheckIcon: {
    marginRight: spacing.xs,
  },
  completedTaskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  taskCompletedDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  rewardsScrollView: {
    marginTop: spacing.sm,
  },
  rewardCard: {
    width: 160,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.surface,
    ...commonStyles.shadow,
  },
  lockedRewardCard: {
    opacity: 0.7,
  },
  rewardContent: {
    alignItems: 'center',
    padding: spacing.md,
  },
  rewardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${walletColorSchemes.child.accent}10`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  rewardCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: walletColorSchemes.child.accent,
    marginBottom: spacing.sm,
  },
  rewardLocked: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rewardButton: {
    width: '100%',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: walletColorSchemes.child.primary,
  },
});

export default ChildWalletScreen;