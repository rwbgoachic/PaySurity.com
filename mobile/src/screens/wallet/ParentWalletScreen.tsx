import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { Card, Text, Title, Paragraph, Button, FAB, Divider, List, Avatar, Badge, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useWallet, { Transaction, WalletInfo, SavingsGoal, FundRequest } from '../../hooks/useWallet';
import { colors, commonStyles, walletColorSchemes } from '../../utils/theme';

/**
 * ParentWalletScreen Component
 * Dashboard for parents to manage family finances, child allowances,
 * view transactions, and set savings goals
 */
const ParentWalletScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { 
    getWalletInfo, 
    getTransactions, 
    getSavingsGoals,
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
  const [children, setChildren] = useState<WalletInfo[]>([]);
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
      
      // Get connected child wallets
      const childWallets = await getChildWallets();
      setChildren(childWallets);
      
      // Get pending fund requests
      const requests = await getPendingRequests();
      setPendingRequests(requests);
      
    } catch (error) {
      handleError(error, 'Error loading wallet data');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Function to get connected child wallets
  const getChildWallets = async () => {
    try {
      // This would be an API call to get child wallets
      // For now, return mock data
      return [
        {
          id: 101,
          role: 'child' as const,
          balance: '250.00',
          userId: 201,
          status: 'active' as const,
          name: 'Emma',
          email: 'emma@example.com',
          phoneNumber: '555-1234',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentId: wallet?.id,
          allowance: '50.00',
          allowanceFrequency: 'weekly' as const,
          nextAllowanceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 102,
          role: 'child' as const,
          balance: '175.50',
          userId: 202,
          status: 'active' as const,
          name: 'Jacob',
          email: 'jacob@example.com',
          phoneNumber: '555-5678',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          parentId: wallet?.id,
          allowance: '40.00',
          allowanceFrequency: 'weekly' as const,
          nextAllowanceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
    } catch (error) {
      handleError(error, 'Error loading child wallets');
      return [];
    }
  };
  
  // Function to get pending fund requests
  const getPendingRequests = async () => {
    try {
      // This would be an API call to get pending requests
      // For now, return mock data
      return [
        {
          id: 1001,
          requesterId: 201,
          requesteeId: wallet?.userId || 0,
          amount: '25.00',
          reason: 'School supplies',
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 1002,
          requesterId: 202,
          requesteeId: wallet?.userId || 0,
          amount: '15.00',
          reason: 'Movie with friends',
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
    else if (item.type === 'payroll') iconName = 'wallet';
    
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
  
  // Child wallet item renderer
  const renderChildItem = ({ item }: { item: WalletInfo }) => {
    return (
      <Card style={styles.childCard}>
        <Card.Content>
          <View style={styles.childCardHeader}>
            <View style={styles.childInfo}>
              <Avatar.Text 
                size={40} 
                label={item.name.substring(0, 1)} 
                backgroundColor={walletColorSchemes.child.primary} 
              />
              <View style={styles.childDetails}>
                <Title>{item.name}</Title>
                <Paragraph>Balance: {formatCurrency(item.balance)}</Paragraph>
              </View>
            </View>
            <Badge 
              style={{ backgroundColor: colors.tertiary }} 
              size={24}
            >
              {pendingRequests.filter(req => req.requesterId === item.userId).length}
            </Badge>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.allowanceInfo}>
            <Text>Current Allowance: {formatCurrency(item.allowance || '0')}/{item.allowanceFrequency}</Text>
            <Text>Next Allowance: {new Date(item.nextAllowanceDate || '').toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.childActions}>
            <Button 
              mode="contained" 
              compact 
              onPress={() => sendFunds(item)}
              style={[styles.childActionButton, { backgroundColor: walletColorSchemes.child.primary }]}
            >
              Send Money
            </Button>
            <Button 
              mode="outlined" 
              compact 
              onPress={() => editAllowance(item)}
              style={styles.childActionButton}
            >
              Edit Allowance
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  // Send funds to child
  const sendFunds = (childWallet: WalletInfo) => {
    navigation.navigate('SendMoney', { 
      // Additional params would be passed here
    });
  };
  
  // Edit child's allowance
  const editAllowance = (childWallet: WalletInfo) => {
    // Navigate to allowance settings or show modal
  };
  
  // Render savings goal item
  const renderSavingsGoalItem = ({ item }: { item: SavingsGoal }) => {
    const progress = parseFloat(item.currentAmount) / parseFloat(item.targetAmount);
    
    return (
      <Card style={styles.goalCard}>
        <Card.Content>
          <Title>{item.name}</Title>
          <View style={styles.goalProgress}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${progress * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {formatCurrency(item.currentAmount)} / {formatCurrency(item.targetAmount)}
            </Text>
          </View>
          <Text>Target Date: {new Date(item.deadline).toLocaleDateString()}</Text>
          <Button 
            mode="contained"
            compact
            style={styles.goalButton}
            onPress={() => navigation.navigate('SavingsGoalDetails', { goalId: item.id })}
          >
            View Details
          </Button>
        </Card.Content>
      </Card>
    );
  };
  
  // Request item renderer
  const renderRequestItem = ({ item }: { item: FundRequest }) => {
    const childName = children.find(child => child.userId === item.requesterId)?.name || 'Child';
    
    return (
      <Card style={styles.requestCard}>
        <Card.Content>
          <View style={styles.requestHeader}>
            <View>
              <Title>{childName} requested money</Title>
              <Paragraph>{formatCurrency(item.amount)} - {item.reason}</Paragraph>
              <Text style={styles.requestDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          
          <View style={styles.requestActions}>
            <Button 
              mode="contained" 
              onPress={() => approveRequest(item)}
              style={[styles.approveButton, { marginRight: 8 }]}
            >
              Approve
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => rejectRequest(item)}
              style={styles.rejectButton}
            >
              Decline
            </Button>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  // Approve fund request
  const approveRequest = (request: FundRequest) => {
    // This would call the API to approve the request
  };
  
  // Reject fund request
  const rejectRequest = (request: FundRequest) => {
    // This would call the API to reject the request
  };
  
  // Get wallet balance display
  const getBalanceDisplay = () => {
    if (!wallet) return '$0.00';
    return formatCurrency(wallet.balance);
  };
  
  // Main overview tab content
  const renderOverviewTab = () => (
    <>
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Paragraph style={styles.balanceLabel}>Available Balance</Paragraph>
          <Title style={styles.balanceAmount}>{getBalanceDisplay()}</Title>
          <View style={styles.balanceActions}>
            <Button 
              mode="contained" 
              icon="bank-transfer-in" 
              onPress={() => navigation.navigate('AddPaymentMethod')}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              Add Money
            </Button>
            <Button 
              mode="contained" 
              icon="bank-transfer-out" 
              onPress={() => navigation.navigate('SendMoney')}
              style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            >
              Send Money
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {pendingRequests.length > 0 && (
        <Card style={styles.requestsCard}>
          <Card.Title title="Pending Requests" />
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
      
      <Card style={styles.recentTransactionsCard}>
        <Card.Title 
          title="Recent Transactions" 
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
            <Paragraph>No recent transactions</Paragraph>
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
  
  // Children tab content
  const renderChildrenTab = () => (
    <>
      <Card style={styles.childrenHeaderCard}>
        <Card.Content>
          <View style={styles.childrenHeaderContent}>
            <Title>Family Wallets</Title>
            <Button 
              mode="contained" 
              icon="plus" 
              onPress={() => navigation.navigate('AddChild')}
            >
              Add Child
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {children.length === 0 ? (
        <Card style={styles.emptyChildrenCard}>
          <Card.Content>
            <Text style={styles.emptyMessage}>No children added yet</Text>
            <Button 
              mode="contained" 
              icon="plus" 
              onPress={() => navigation.navigate('AddChild')}
              style={{ marginTop: 16 }}
            >
              Add Your First Child
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={children}
          renderItem={renderChildItem}
          keyExtractor={item => `child-${item.id}`}
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
          <Title>All Transactions</Title>
          {/* Transaction filters would go here */}
        </Card.Content>
      </Card>
      
      {transactions.length === 0 ? (
        <Card style={styles.emptyTransactionsCard}>
          <Card.Content>
            <Text style={styles.emptyMessage}>No transactions yet</Text>
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
  
  // Goals tab content
  const renderGoalsTab = () => (
    <>
      <Card style={styles.goalsHeaderCard}>
        <Card.Content>
          <View style={styles.goalsHeaderContent}>
            <Title>Savings Goals</Title>
            <Button 
              mode="contained" 
              icon="plus" 
              onPress={() => navigation.navigate('AddSavingsGoal')}
            >
              Add Goal
            </Button>
          </View>
        </Card.Content>
      </Card>
      
      {savingsGoals.length === 0 ? (
        <Card style={styles.emptyGoalsCard}>
          <Card.Content>
            <Text style={styles.emptyMessage}>No savings goals yet</Text>
            <Button 
              mode="contained" 
              icon="plus" 
              onPress={() => navigation.navigate('AddSavingsGoal')}
              style={{ marginTop: 16 }}
            >
              Create Your First Goal
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
  
  // Render the currently active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'children':
        return renderChildrenTab();
      case 'transactions':
        return renderTransactionsTab();
      case 'goals':
        return renderGoalsTab();
      default:
        return renderOverviewTab();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Parent Wallet</Text>
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
            color={activeTab === 'overview' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'overview' && styles.activeTabText
          ]}>Overview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'children' && styles.activeTab]} 
          onPress={() => setActiveTab('children')}
        >
          <Icon 
            name="account-child" 
            size={24} 
            color={activeTab === 'children' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'children' && styles.activeTabText
          ]}>Children</Text>
          {pendingRequests.length > 0 && (
            <Badge style={styles.notificationBadge}>
              {pendingRequests.length}
            </Badge>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]} 
          onPress={() => setActiveTab('transactions')}
        >
          <Icon 
            name="bank-transfer" 
            size={24} 
            color={activeTab === 'transactions' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'transactions' && styles.activeTabText
          ]}>Transactions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'goals' && styles.activeTab]} 
          onPress={() => setActiveTab('goals')}
        >
          <Icon 
            name="star" 
            size={24} 
            color={activeTab === 'goals' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabText, 
            activeTab === 'goals' && styles.activeTabText
          ]}>Goals</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {renderActiveTabContent()}
      </ScrollView>
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          // Show action menu or navigate based on active tab
          if (activeTab === 'children') {
            navigation.navigate('AddChild');
          } else if (activeTab === 'goals') {
            navigation.navigate('AddSavingsGoal');
          } else {
            navigation.navigate('SendMoney');
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
    backgroundColor: colors.primary,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  avatar: {
    backgroundColor: colors.primaryDark,
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
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 16,
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
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
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
  requestsCard: {
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  requestCard: {
    marginBottom: 8,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  approveButton: {
    backgroundColor: colors.success,
  },
  rejectButton: {
    borderColor: colors.error,
  },
  childrenHeaderCard: {
    marginBottom: 16,
  },
  childrenHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childCard: {
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  childCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  childDetails: {
    marginLeft: 12,
  },
  allowanceInfo: {
    marginVertical: 12,
  },
  childActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  childActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  divider: {
    marginVertical: 12,
  },
  transactionsHeaderCard: {
    marginBottom: 16,
  },
  goalsHeaderCard: {
    marginBottom: 16,
  },
  goalsHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalCard: {
    marginBottom: 16,
    ...commonStyles.shadow,
  },
  goalProgress: {
    marginVertical: 12,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  goalButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  emptyChildrenCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTransactionsCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGoalsCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
});

export default ParentWalletScreen;