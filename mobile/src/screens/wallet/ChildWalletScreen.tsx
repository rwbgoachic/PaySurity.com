import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { Card, Text, Title, Paragraph, Button, FAB, Divider, List, Avatar, Badge, useTheme, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useWallet, { Transaction, WalletInfo, SavingsGoal, FundRequest } from '../../hooks/useWallet';
import { colors, commonStyles, walletColorSchemes } from '../../utils/theme';

/**
 * ChildWalletScreen Component
 * Interface for children to manage their allowance, view balance, 
 * request money, and track savings goals
 */
const ChildWalletScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { 
    getWalletInfo, 
    getTransactions, 
    getSavingsGoals,
    requestFunds,
    formatCurrency,
    handleError,
    loading
  } = useWallet();
  
  // State management
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FundRequest[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Load data on component mount
  useEffect(() => {
    loadWalletData();
  }, []);
  
  // Function to load all wallet data
  const loadWalletData = async () => {
    try {
      setRefreshing(true);
      
      // Get wallet info
      const walletInfo = await getWalletInfo();
      setWallet(walletInfo);
      
      // Get transactions
      const transactionData = await getTransactions();
      setTransactions(transactionData);
      setRecentTransactions(transactionData.slice(0, 5));
      
      // Get savings goals
      const savingsData = await getSavingsGoals();
      setSavingsGoals(savingsData);
      
      // Get pending fund requests
      const requests = await getPendingRequests();
      setPendingRequests(requests);
      
    } catch (error) {
      handleError(error, 'Error loading wallet data');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Function to get pending fund requests
  const getPendingRequests = async () => {
    try {
      // This would be an API call to get pending requests
      // For now, return mock data that would come from the API
      return [
        {
          id: 1001,
          requesterId: wallet?.userId || 0,
          requesteeId: wallet?.parentId || 0,
          amount: '25.00',
          reason: 'School supplies',
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
    } catch (error) {
      handleError(error, 'Error loading pending requests');
      return [];
    }
  };
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    loadWalletData();
  };
  
  // Transaction item renderer
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const isPositive = ['deposit', 'transfer', 'allowance'].includes(item.type) && !item.fromWalletId;
    
    // Determine icon based on transaction type
    let iconName = 'cash';
    if (item.type === 'deposit') iconName = 'cash-plus';
    else if (item.type === 'withdrawal') iconName = 'cash-minus';
    else if (item.type === 'transfer') iconName = 'bank-transfer';
    else if (item.type === 'payment') iconName = 'credit-card';
    else if (item.type === 'allowance') iconName = 'hand-coin';
    
    return (
      <List.Item
        title={item.description}
        description={new Date(item.createdAt).toLocaleDateString()}
        left={props => <List.Icon {...props} icon={iconName} color={isPositive ? colors.success : colors.error} />}
        right={props => (
          <Text 
            style={[
              styles.transactionAmount, 
              { color: isPositive ? colors.success : colors.error }
            ]}
          >
            {isPositive ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
        )}
        onPress={() => navigation.navigate('TransactionDetails', { transactionId: item.id })}
      />
    );
  };
  
  // Render savings goal item
  const renderSavingsGoalItem = ({ item }: { item: SavingsGoal }) => {
    const progress = parseFloat(item.currentAmount) / parseFloat(item.targetAmount);
    
    return (
      <Card style={styles.goalCard}>
        <Card.Content>
          <Title>{item.name}</Title>
          <View style={styles.goalProgress}>
            <ProgressBar progress={progress} color={colors.tertiary} style={styles.progressBar} />
            <Text style={styles.progressText}>
              {formatCurrency(item.currentAmount)} / {formatCurrency(item.targetAmount)}
            </Text>
          </View>
          <Text>Target Date: {new Date(item.deadline).toLocaleDateString()}</Text>
          
          <View style={styles.goalActions}>
            <Button 
              mode="contained"
              style={[styles.goalButton, { backgroundColor: colors.tertiary }]}
              onPress={() => navigation.navigate('SavingsGoalDetails', { goalId: item.id })}
            >
              Add Money
            </Button>
            <Button 
              mode="outlined"
              style={styles.goalButton}
              onPress={() => navigation.navigate('SavingsGoalDetails', { goalId: item.id })}
            >
              Details
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  // Request item renderer
  const renderRequestItem = ({ item }: { item: FundRequest }) => {
    return (
      <Card style={styles.requestCard}>
        <Card.Content>
          <Title>{formatCurrency(item.amount)} - {item.reason}</Title>
          <Paragraph>Requested on: {new Date(item.createdAt).toLocaleDateString()}</Paragraph>
          <View style={styles.requestStatusContainer}>
            <Badge style={{ backgroundColor: colors.warning }}>Pending</Badge>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  // Create fund request
  const createFundRequest = () => {
    navigation.navigate('RequestMoney');
  };
  
  // Get wallet balance display
  const getBalanceDisplay = () => {
    if (!wallet) return '$0.00';
    return formatCurrency(wallet.balance);
  };
  
  // Get allowance info
  const getAllowanceInfo = () => {
    if (!wallet || !wallet.allowance) return null;
    
    return {
      amount: formatCurrency(wallet.allowance),
      frequency: wallet.allowanceFrequency || 'weekly',
      nextDate: wallet.nextAllowanceDate 
        ? new Date(wallet.nextAllowanceDate).toLocaleDateString()
        : 'Unknown'
    };
  };
  
  // Main overview tab content
  const renderOverviewTab = () => {
    const allowanceInfo = getAllowanceInfo();
    
    return (
      <>
        <Card style={styles.balanceCard}>
          <Card.Content>
            <Paragraph style={styles.balanceLabel}>My Money</Paragraph>
            <Title style={styles.balanceAmount}>{getBalanceDisplay()}</Title>
            
            {allowanceInfo && (
              <View style={styles.allowanceContainer}>
                <Divider style={styles.divider} />
                <Text style={styles.allowanceLabel}>My Allowance</Text>
                <Text style={styles.allowanceAmount}>{allowanceInfo.amount}/{allowanceInfo.frequency}</Text>
                <Text style={styles.nextAllowance}>Next allowance: {allowanceInfo.nextDate}</Text>
              </View>
            )}
            
            <View style={styles.balanceActions}>
              <Button 
                mode="contained" 
                icon="cash-plus" 
                onPress={createFundRequest}
                style={[styles.actionButton, { backgroundColor: colors.tertiary }]}
              >
                Request Money
              </Button>
              <Button 
                mode="contained" 
                icon="bank-transfer" 
                onPress={() => navigation.navigate('SendMoney')}
                style={[styles.actionButton, { backgroundColor: colors.tertiary }]}
              >
                Send Money
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {pendingRequests.length > 0 && (
          <Card style={styles.requestsCard}>
            <Card.Title title="My Money Requests" />
            <Card.Content>
              <FlatList
                data={pendingRequests}
                renderItem={renderRequestItem}
                keyExtractor={item => `request-${item.id}`}
                scrollEnabled={false}
              />
            </Card.Content>
          </Card>
        )}
        
        {savingsGoals.length > 0 && (
          <Card style={styles.goalsCard}>
            <Card.Title 
              title="My Savings Goals" 
              right={(props) => (
                <Button 
                  {...props} 
                  onPress={() => setActiveTab('goals')}
                >
                  See All
                </Button>
              )}
            />
            <Card.Content>
              <FlatList
                data={savingsGoals.slice(0, 2)}
                renderItem={renderSavingsGoalItem}
                keyExtractor={item => `goal-${item.id}`}
                scrollEnabled={false}
              />
            </Card.Content>
          </Card>
        )}
        
        <Card style={styles.recentTransactionsCard}>
          <Card.Title 
            title="Recent Activity" 
            right={(props) => (
              <Button 
                {...props} 
                onPress={() => setActiveTab('transactions')}
              >
                See All
              </Button>
            )}
          />
          <Card.Content>
            {recentTransactions.length === 0 ? (
              <Paragraph>No recent activity</Paragraph>
            ) : (
              <FlatList
                data={recentTransactions}
                renderItem={renderTransactionItem}
                keyExtractor={item => `transaction-${item.id}`}
                scrollEnabled={false}
              />
            )}
          </Card.Content>
        </Card>
      </>
    );
  };
  
  // Goals tab content
  const renderGoalsTab = () => (
    <>
      <Card style={styles.goalsHeaderCard}>
        <Card.Content>
          <View style={styles.goalsHeaderContent}>
            <Title>My Savings Goals</Title>
            <Button 
              mode="contained" 
              icon="plus" 
              onPress={() => navigation.navigate('AddSavingsGoal')}
              style={{ backgroundColor: colors.tertiary }}
            >
              New Goal
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {savingsGoals.length === 0 ? (
        <Card style={styles.emptyGoalsCard}>
          <Card.Content>
            <Icon name="star-outline" size={64} color={colors.tertiary} style={styles.emptyIcon} />
            <Text style={styles.emptyMessage}>No savings goals yet</Text>
            <Button 
              mode="contained" 
              icon="plus" 
              onPress={() => navigation.navigate('AddSavingsGoal')}
              style={[{ marginTop: 16, backgroundColor: colors.tertiary }]}
            >
              Create My First Goal
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={savingsGoals}
          renderItem={renderSavingsGoalItem}
          keyExtractor={item => `goal-${item.id}`}
          scrollEnabled={false}
        />
      )}
    </>
  );
  
  // Transactions tab content
  const renderTransactionsTab = () => (
    <>
      <Card style={styles.transactionsHeaderCard}>
        <Card.Content>
          <Title>My Activity</Title>
          {/* Transaction filters would go here */}
        </Card.Content>
      </Card>
      
      {transactions.length === 0 ? (
        <Card style={styles.emptyTransactionsCard}>
          <Card.Content>
            <Icon name="cash" size={64} color={colors.tertiary} style={styles.emptyIcon} />
            <Text style={styles.emptyMessage}>No activity yet</Text>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => `transaction-${item.id}`}
          scrollEnabled={false}
        />
      )}
    </>
  );
  
  // Learn tab content - educational content for kids
  const renderLearnTab = () => (
    <>
      <Card style={styles.learnHeaderCard}>
        <Card.Content>
          <Title>Learn About Money</Title>
        </Card.Content>
      </Card>
      
      <Card style={styles.learnCard}>
        <Card.Cover source={{ uri: 'https://placeimg.com/640/480/nature' }} />
        <Card.Content>
          <Title>Saving vs. Spending</Title>
          <Paragraph>
            Learn how to make good choices with your money and why saving is important.
          </Paragraph>
          <Button 
            mode="contained" 
            style={[styles.learnButton, { backgroundColor: colors.tertiary }]}
            onPress={() => {/* Would navigate to educational content */}}
          >
            Start Learning
          </Button>
        </Card.Content>
      </Card>
      
      <Card style={styles.learnCard}>
        <Card.Cover source={{ uri: 'https://placeimg.com/640/480/animals' }} />
        <Card.Content>
          <Title>Money Quiz</Title>
          <Paragraph>
            Test your knowledge about money with this fun quiz!
          </Paragraph>
          <Button 
            mode="contained" 
            style={[styles.learnButton, { backgroundColor: colors.tertiary }]}
            onPress={() => {/* Would navigate to quiz */}}
          >
            Start Quiz
          </Button>
        </Card.Content>
      </Card>
    </>
  );
  
  // Render the currently active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'goals':
        return renderGoalsTab();
      case 'transactions':
        return renderTransactionsTab();
      case 'learn':
        return renderLearnTab();
      default:
        return renderOverviewTab();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>My Wallet</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Avatar.Text 
            size={40} 
            label={wallet?.name?.substring(0, 1) || 'U'} 
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]} 
          onPress={() => setActiveTab('overview')}
        >
          <Icon 
            name="view-dashboard" 
            size={24} 
            color={activeTab === 'overview' ? colors.tertiary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'overview' && styles.activeTabText
          ]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]} 
          onPress={() => setActiveTab('goals')}
        >
          <Icon 
            name="star" 
            size={24} 
            color={activeTab === 'goals' ? colors.tertiary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'goals' && styles.activeTabText
          ]}>Goals</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]} 
          onPress={() => setActiveTab('transactions')}
        >
          <Icon 
            name="bank-transfer" 
            size={24} 
            color={activeTab === 'transactions' ? colors.tertiary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'transactions' && styles.activeTabText
          ]}>Activity</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'learn' && styles.activeTab]} 
          onPress={() => setActiveTab('learn')}
        >
          <Icon 
            name="school" 
            size={24} 
            color={activeTab === 'learn' ? colors.tertiary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'learn' && styles.activeTabText
          ]}>Learn</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tertiary]}
          />
        }
      >
        {renderActiveTabContent()}
      </ScrollView>
      
      <FAB
        style={[styles.fab, { backgroundColor: colors.tertiary }]}
        icon="plus"
        onPress={() => {
          // Show action menu or navigate based on active tab
          if (activeTab === 'goals') {
            navigation.navigate('AddSavingsGoal');
          } else {
            createFundRequest();
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.tertiary,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  avatar: {
    backgroundColor: colors.tertiaryDark,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.tertiary,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.tertiary,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  balanceCard: {
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  allowanceContainer: {
    marginVertical: 12,
  },
  allowanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  allowanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.tertiary,
    marginVertical: 4,
  },
  nextAllowance: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: 8,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  requestsCard: {
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  requestCard: {
    marginBottom: 8,
  },
  requestStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  goalsCard: {
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  goalCard: {
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  goalProgress: {
    marginVertical: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  goalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  goalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  recentTransactionsCard: {
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  transactionAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  goalsHeaderCard: {
    marginBottom: 16,
  },
  goalsHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionsHeaderCard: {
    marginBottom: 16,
  },
  learnHeaderCard: {
    marginBottom: 16,
  },
  learnCard: {
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  learnButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  emptyGoalsCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTransactionsCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
    alignSelf: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ChildWalletScreen;