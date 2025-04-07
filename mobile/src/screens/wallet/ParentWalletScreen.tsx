import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity, Text, Image } from 'react-native';
import { Card, Title, Paragraph, Button, Chip, Divider, Badge, List, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWallet } from '../../hooks/useWallet';
import theme from '../../utils/theme';

/**
 * Props for the ParentWalletScreen component
 */
interface ParentWalletScreenProps {
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

/**
 * ParentWalletScreen displays the parent wallet interface with account balances,
 * transactions, child accounts, and family financial management tools
 */
const ParentWalletScreen: React.FC<ParentWalletScreenProps> = ({ refreshing, onRefresh }) => {
  const { 
    currentUser, 
    accounts, 
    selectedAccount,
    childAccounts,
    transactions,
    pendingTransactions,
    savingsGoals,
    recurringPayments,
    selectAccount
  } = useWallet();
  
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Format currency with $ sign and 2 decimal places
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };
  
  // Format date to a more readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get transaction icon based on transaction type
  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'deposit':
        return 'arrow-down-bold-circle';
      case 'withdrawal':
        return 'arrow-up-bold-circle';
      case 'transfer':
        return 'swap-horizontal-bold';
      case 'payment':
        return 'credit-card-outline';
      case 'allowance':
        return 'cash-multiple';
      case 'payment_received':
        return 'cash-check';
      default:
        return 'circle';
    }
  };
  
  // Get transaction color based on transaction direction
  const getTransactionColor = (direction: string): string => {
    return direction === 'incoming' 
      ? theme.colors.success 
      : theme.colors.error;
  };
  
  // Get transaction sign based on transaction direction
  const getTransactionSign = (direction: string): string => {
    return direction === 'incoming' ? '+' : '-';
  };
  
  // Render the account selector
  const renderAccountSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.accountSelectorContainer}
    >
      {accounts.map(account => (
        <TouchableOpacity
          key={account.id}
          style={[
            styles.accountCard,
            selectedAccount?.id === account.id && styles.accountCardSelected
          ]}
          onPress={() => selectAccount(account.id)}
        >
          <View style={styles.accountCardHeader}>
            <Text style={styles.accountCardName}>{account.name}</Text>
            {account.isDefault && (
              <Badge style={styles.defaultBadge}>Default</Badge>
            )}
          </View>
          <Text style={styles.accountCardBalance}>
            {formatCurrency(account.balance)}
          </Text>
          <Text style={styles.accountCardType}>
            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={styles.addAccountCard}
        onPress={() => navigation.navigate('AddAccount' as never)}
      >
        <Icon name="plus-circle-outline" size={24} color={theme.colors.primary} />
        <Text style={styles.addAccountText}>Add Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  
  // Render the actions row with quick action buttons
  const renderActionsRow = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('SendMoney' as never)}
      >
        <View style={[styles.actionIcon, { backgroundColor: theme.walletColorSchemes.personal.primary }]}>
          <Icon name="send" size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.actionText}>Send</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('RequestMoney' as never)}
      >
        <View style={[styles.actionIcon, { backgroundColor: theme.walletColorSchemes.personal.accent }]}>
          <Icon name="cash-plus" size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.actionText}>Request</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('ScanQR' as never)}
      >
        <View style={[styles.actionIcon, { backgroundColor: theme.colors.secondary }]}>
          <Icon name="qrcode-scan" size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.actionText}>Scan</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('AddPaymentMethod' as never)}
      >
        <View style={[styles.actionIcon, { backgroundColor: theme.colors.info }]}>
          <Icon name="credit-card-plus-outline" size={20} color={theme.colors.white} />
        </View>
        <Text style={styles.actionText}>Cards</Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render the child accounts section
  const renderChildAccounts = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Child Accounts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddChild' as never)}>
          <Text style={styles.sectionAction}>Add Child</Text>
        </TouchableOpacity>
      </View>
      
      {childAccounts.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <Icon name="account-child-outline" size={36} color={theme.colors.textMuted} />
            <Paragraph style={styles.emptyText}>
              You haven't added any child accounts yet
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('AddChild' as never)}
              style={styles.emptyButton}
            >
              Add Child Account
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.childAccountsContainer}
        >
          {childAccounts.map(child => (
            <TouchableOpacity
              key={child.id}
              style={[styles.childCard, { backgroundColor: theme.walletColorSchemes.child.background }]}
              onPress={() => navigation.navigate('ChildDetails' as never, { childId: child.childId })}
            >
              <View style={styles.childCardHeader}>
                <Avatar.Text 
                  size={40} 
                  label={child.childName.substring(0, 1)}
                  style={{ backgroundColor: theme.walletColorSchemes.child.primary }}
                />
                <View style={{ marginLeft: theme.spacing[2] }}>
                  <Text style={styles.childName}>{child.childName}</Text>
                  <Chip 
                    style={{ 
                      backgroundColor: child.status === 'active' 
                        ? theme.colors.success 
                        : theme.colors.warning,
                      height: 24
                    }}
                    textStyle={{ fontSize: 10, color: theme.colors.white }}
                  >
                    {child.status.toUpperCase()}
                  </Chip>
                </View>
              </View>
              
              <View style={styles.childCardContent}>
                <View style={styles.childBalanceRow}>
                  <Text style={styles.childBalanceLabel}>Balance</Text>
                  <Text style={styles.childBalance}>{formatCurrency(child.balance)}</Text>
                </View>
                
                <View style={styles.childInfoRow}>
                  <Text style={styles.childInfoLabel}>Allowance</Text>
                  <Text style={styles.childInfoValue}>
                    {formatCurrency(child.allowance.amount)} / {child.allowance.frequency}
                  </Text>
                </View>
                
                <View style={styles.childInfoRow}>
                  <Text style={styles.childInfoLabel}>Next Payment</Text>
                  <Text style={styles.childInfoValue}>{formatDate(child.allowance.nextDate)}</Text>
                </View>
              </View>
              
              <Button 
                mode="outlined" 
                style={[styles.childCardButton, { borderColor: theme.walletColorSchemes.child.primary }]}
                labelStyle={{ color: theme.walletColorSchemes.child.primary, fontSize: 12 }}
                onPress={() => navigation.navigate('SendToChild' as never, { childId: child.childId })}
              >
                Send Money
              </Button>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
  
  // Render recent transactions section
  const renderTransactions = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => setActiveTab('transactions')}>
          <Text style={styles.sectionAction}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {transactions.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <Icon name="cash-multiple" size={36} color={theme.colors.textMuted} />
            <Paragraph style={styles.emptyText}>
              No transactions yet
            </Paragraph>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.transactionsCard}>
          <Card.Content>
            {transactions.slice(0, 5).map(transaction => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => navigation.navigate('TransactionDetails' as never, { transactionId: transaction.id })}
              >
                <View style={styles.transactionIconContainer}>
                  <Icon 
                    name={getTransactionIcon(transaction.type)} 
                    size={24} 
                    color={getTransactionColor(transaction.direction)}
                  />
                </View>
                
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionMeta}>
                    {formatDate(transaction.date)} • {transaction.category}
                  </Text>
                </View>
                
                <Text 
                  style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(transaction.direction) }
                  ]}
                >
                  {getTransactionSign(transaction.direction)}
                  {formatCurrency(transaction.amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      )}
    </View>
  );
  
  // Render savings goals section
  const renderSavingsGoals = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Savings Goals</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddSavingsGoal' as never)}>
          <Text style={styles.sectionAction}>Add Goal</Text>
        </TouchableOpacity>
      </View>
      
      {savingsGoals.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyCardContent}>
            <Icon name="piggy-bank-outline" size={36} color={theme.colors.textMuted} />
            <Paragraph style={styles.emptyText}>
              You haven't set any savings goals yet
            </Paragraph>
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('AddSavingsGoal' as never)}
              style={styles.emptyButton}
            >
              Create Savings Goal
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.savingsGoalsContainer}
        >
          {savingsGoals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <TouchableOpacity
                key={goal.id}
                style={styles.savingsGoalCard}
                onPress={() => navigation.navigate('SavingsGoalDetails' as never, { goalId: goal.id })}
              >
                <View style={styles.savingsGoalHeader}>
                  <View>
                    <Text style={styles.savingsGoalName}>{goal.name}</Text>
                    <Chip 
                      style={{ 
                        backgroundColor: goal.status === 'active' 
                          ? theme.colors.success 
                          : goal.status === 'completed'
                            ? theme.colors.info
                            : theme.colors.warning,
                        height: 24
                      }}
                      textStyle={{ fontSize: 10, color: theme.colors.white }}
                    >
                      {goal.status.toUpperCase()}
                    </Chip>
                  </View>
                  <Icon 
                    name={
                      goal.category === 'Travel' 
                        ? 'airplane' 
                        : goal.category === 'Education'
                          ? 'school'
                          : goal.category === 'Emergency'
                            ? 'lifebuoy'
                            : 'piggy-bank'
                    } 
                    size={24} 
                    color={theme.colors.primary}
                  />
                </View>
                
                <View style={styles.savingsGoalContent}>
                  <View style={styles.savingsGoalAmounts}>
                    <Text style={styles.savingsGoalCurrentAmount}>
                      {formatCurrency(goal.currentAmount)}
                    </Text>
                    <Text style={styles.savingsGoalTargetAmount}>
                      of {formatCurrency(goal.targetAmount)}
                    </Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${Math.min(progress, 100)}%` }
                      ]} 
                    />
                  </View>
                  
                  <View style={styles.savingsGoalInfoRow}>
                    <Text style={styles.savingsGoalInfoLabel}>Target Date</Text>
                    <Text style={styles.savingsGoalInfoValue}>{formatDate(goal.targetDate)}</Text>
                  </View>
                </View>
                
                <Button 
                  mode="contained" 
                  style={styles.savingsGoalButton}
                  onPress={() => navigation.navigate('ContributeToGoal' as never, { goalId: goal.id })}
                >
                  Contribute
                </Button>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
  
  // Render pending requests section (if any)
  const renderPendingRequests = () => {
    if (pendingTransactions.length === 0) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          <Badge style={styles.pendingBadge}>{pendingTransactions.length}</Badge>
        </View>
        
        <Card style={styles.transactionsCard}>
          <Card.Content>
            {pendingTransactions.map(transaction => (
              <View key={transaction.id} style={styles.pendingRequestItem}>
                <View style={styles.pendingRequestInfo}>
                  <Icon name="account-clock-outline" size={24} color={theme.colors.warning} />
                  <View style={styles.pendingRequestDetails}>
                    <Text style={styles.pendingRequestDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.pendingRequestMeta}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.pendingRequestAmount}>
                  <Text style={styles.pendingAmount}>
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <View style={styles.pendingRequestActions}>
                    <Button 
                      mode="contained" 
                      compact
                      style={[styles.pendingActionButton, styles.approveButton]}
                      labelStyle={{ fontSize: 12 }}
                    >
                      Approve
                    </Button>
                    <Button 
                      mode="outlined" 
                      compact
                      style={[styles.pendingActionButton, styles.declineButton]}
                      labelStyle={{ fontSize: 12, color: theme.colors.error }}
                    >
                      Decline
                    </Button>
                  </View>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      </View>
    );
  };
  
  // Render recurring payments section
  const renderRecurringPayments = () => {
    if (recurringPayments.length === 0) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Payments</Text>
          <TouchableOpacity onPress={() => navigation.navigate('RecurringPayments' as never)}>
            <Text style={styles.sectionAction}>Manage</Text>
          </TouchableOpacity>
        </View>
        
        <Card style={styles.transactionsCard}>
          <Card.Content>
            {recurringPayments.slice(0, 3).map(payment => (
              <TouchableOpacity
                key={payment.id}
                style={styles.recurringPaymentItem}
                onPress={() => navigation.navigate('RecurringPaymentDetails' as never, { paymentId: payment.id })}
              >
                <View style={styles.recurringPaymentIconContainer}>
                  <Icon 
                    name={
                      payment.category === 'Entertainment' 
                        ? 'television-classic' 
                        : payment.category === 'Utilities'
                          ? 'flash'
                          : payment.category === 'Health'
                            ? 'heart-pulse'
                            : 'calendar-check'
                    } 
                    size={24} 
                    color={theme.colors.primary}
                  />
                </View>
                
                <View style={styles.recurringPaymentDetails}>
                  <Text style={styles.recurringPaymentName}>
                    {payment.name}
                  </Text>
                  <Text style={styles.recurringPaymentMeta}>
                    Next payment: {formatDate(payment.nextDate)}
                  </Text>
                </View>
                
                <Text style={styles.recurringPaymentAmount}>
                  {formatCurrency(payment.amount)}
                </Text>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      </View>
    );
  };
  
  // Render tab selector
  const renderTabSelector = () => (
    <View style={styles.tabSelectorContainer}>
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]} 
        onPress={() => setActiveTab('overview')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'overview' && styles.activeTabButtonText]}>
          Overview
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'transactions' && styles.activeTabButton]} 
        onPress={() => setActiveTab('transactions')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'transactions' && styles.activeTabButtonText]}>
          Transactions
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'children' && styles.activeTabButton]} 
        onPress={() => setActiveTab('children')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'children' && styles.activeTabButtonText]}>
          Children
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tabButton, activeTab === 'goals' && styles.activeTabButton]} 
        onPress={() => setActiveTab('goals')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'goals' && styles.activeTabButtonText]}>
          Goals
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render all transactions list for Transactions tab
  const renderAllTransactions = () => (
    <View style={styles.tabContent}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Icon name="cash-multiple" size={36} color={theme.colors.textMuted} />
              <Paragraph style={styles.emptyText}>
                No transactions yet
              </Paragraph>
            </Card.Content>
          </Card>
        }
        renderItem={({ item: transaction }) => (
          <TouchableOpacity
            style={styles.transactionItem}
            onPress={() => navigation.navigate('TransactionDetails' as never, { transactionId: transaction.id })}
          >
            <View style={styles.transactionIconContainer}>
              <Icon 
                name={getTransactionIcon(transaction.type)} 
                size={24} 
                color={getTransactionColor(transaction.direction)}
              />
            </View>
            
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionDescription}>
                {transaction.description}
              </Text>
              <Text style={styles.transactionMeta}>
                {formatDate(transaction.date)} • {transaction.category}
              </Text>
            </View>
            
            <Text 
              style={[
                styles.transactionAmount,
                { color: getTransactionColor(transaction.direction) }
              ]}
            >
              {getTransactionSign(transaction.direction)}
              {formatCurrency(transaction.amount)}
            </Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
      />
    </View>
  );
  
  // Render all children list for Children tab
  const renderAllChildren = () => (
    <View style={styles.tabContent}>
      <Button
        mode="contained"
        icon="plus"
        style={styles.addButton}
        onPress={() => navigation.navigate('AddChild' as never)}
      >
        Add Child
      </Button>
      
      <FlatList
        data={childAccounts}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Icon name="account-child-outline" size={36} color={theme.colors.textMuted} />
              <Paragraph style={styles.emptyText}>
                You haven't added any child accounts yet
              </Paragraph>
            </Card.Content>
          </Card>
        }
        renderItem={({ item: child }) => (
          <Card style={styles.childListCard}>
            <Card.Content>
              <View style={styles.childListItem}>
                <Avatar.Text 
                  size={48} 
                  label={child.childName.substring(0, 1)}
                  style={{ backgroundColor: theme.walletColorSchemes.child.primary }}
                />
                
                <View style={styles.childListDetails}>
                  <Text style={styles.childListName}>{child.childName}</Text>
                  <Chip 
                    style={{ 
                      backgroundColor: child.status === 'active' 
                        ? theme.colors.success 
                        : theme.colors.warning,
                      height: 24,
                      marginTop: 4
                    }}
                    textStyle={{ fontSize: 10, color: theme.colors.white }}
                  >
                    {child.status.toUpperCase()}
                  </Chip>
                  
                  <View style={styles.childListInfo}>
                    <Text style={styles.childListBalance}>Balance: {formatCurrency(child.balance)}</Text>
                    <Text style={styles.childListAllowance}>
                      Allowance: {formatCurrency(child.allowance.amount)} / {child.allowance.frequency}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.childListActions}>
                  <Button 
                    mode="contained" 
                    compact
                    style={styles.childListButton}
                    labelStyle={{ fontSize: 12 }}
                    onPress={() => navigation.navigate('SendToChild' as never, { childId: child.childId })}
                  >
                    Send
                  </Button>
                  <Button 
                    mode="outlined" 
                    compact
                    style={[styles.childListButton, { marginTop: 8 }]}
                    labelStyle={{ fontSize: 12 }}
                    onPress={() => navigation.navigate('ChildDetails' as never, { childId: child.childId })}
                  >
                    Manage
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
  
  // Render all savings goals for Goals tab
  const renderAllSavingsGoals = () => (
    <View style={styles.tabContent}>
      <Button
        mode="contained"
        icon="plus"
        style={styles.addButton}
        onPress={() => navigation.navigate('AddSavingsGoal' as never)}
      >
        Add Savings Goal
      </Button>
      
      <FlatList
        data={savingsGoals}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
              <Icon name="piggy-bank-outline" size={36} color={theme.colors.textMuted} />
              <Paragraph style={styles.emptyText}>
                You haven't set any savings goals yet
              </Paragraph>
            </Card.Content>
          </Card>
        }
        renderItem={({ item: goal }) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <Card style={styles.goalListCard}>
              <Card.Content>
                <View style={styles.goalListHeader}>
                  <View style={styles.goalListHeaderLeft}>
                    <Text style={styles.goalListName}>{goal.name}</Text>
                    <Chip 
                      style={{ 
                        backgroundColor: goal.status === 'active' 
                          ? theme.colors.success 
                          : goal.status === 'completed'
                            ? theme.colors.info
                            : theme.colors.warning,
                        height: 24,
                        marginTop: 4
                      }}
                      textStyle={{ fontSize: 10, color: theme.colors.white }}
                    >
                      {goal.status.toUpperCase()}
                    </Chip>
                  </View>
                  
                  <Icon 
                    name={
                      goal.category === 'Travel' 
                        ? 'airplane' 
                        : goal.category === 'Education'
                          ? 'school'
                          : goal.category === 'Emergency'
                            ? 'lifebuoy'
                            : 'piggy-bank'
                    } 
                    size={32} 
                    color={theme.colors.primary}
                  />
                </View>
                
                <View style={styles.goalListProgress}>
                  <Text style={styles.goalListProgressText}>
                    {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                    {' '}({Math.round(progress)}%)
                  </Text>
                  
                  <View style={styles.goalListProgressBarContainer}>
                    <View 
                      style={[
                        styles.goalListProgressBar, 
                        { width: `${Math.min(progress, 100)}%` }
                      ]} 
                    />
                  </View>
                </View>
                
                <View style={styles.goalListDetails}>
                  <View style={styles.goalListDetailItem}>
                    <Text style={styles.goalListDetailLabel}>Target Date</Text>
                    <Text style={styles.goalListDetailValue}>{formatDate(goal.targetDate)}</Text>
                  </View>
                  
                  <View style={styles.goalListDetailItem}>
                    <Text style={styles.goalListDetailLabel}>Created</Text>
                    <Text style={styles.goalListDetailValue}>{formatDate(goal.createdAt)}</Text>
                  </View>
                  
                  {goal.description && (
                    <View style={styles.goalListDetailItem}>
                      <Text style={styles.goalListDetailLabel}>Description</Text>
                      <Text style={styles.goalListDetailValue}>{goal.description}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.goalListActions}>
                  <Button 
                    mode="contained" 
                    style={styles.goalListButton}
                    disabled={goal.status !== 'active'}
                    onPress={() => navigation.navigate('ContributeToGoal' as never, { goalId: goal.id })}
                  >
                    Contribute
                  </Button>
                  
                  <Button 
                    mode="outlined" 
                    style={[styles.goalListButton, { marginLeft: 8 }]}
                    onPress={() => navigation.navigate('SavingsGoalDetails' as never, { goalId: goal.id })}
                  >
                    Details
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
  
  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ScrollView 
            style={styles.overviewContainer}
            contentContainerStyle={styles.overviewContentContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {renderPendingRequests()}
            {renderChildAccounts()}
            {renderTransactions()}
            {renderSavingsGoals()}
            {renderRecurringPayments()}
          </ScrollView>
        );
      case 'transactions':
        return renderAllTransactions();
      case 'children':
        return renderAllChildren();
      case 'goals':
        return renderAllSavingsGoals();
      default:
        return null;
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello, {currentUser?.firstName}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationIcon}>
            <Icon name="bell-outline" size={24} color={theme.colors.textDark} />
            {pendingTransactions.length > 0 && (
              <Badge style={styles.notificationBadge}>{pendingTransactions.length}</Badge>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profilePic}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <Text style={styles.profileInitial}>
              {currentUser?.firstName?.charAt(0) || 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {renderAccountSelector()}
      {renderActionsRow()}
      {renderTabSelector()}
      {renderTabContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
  },
  date: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: theme.spacing[3],
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.error,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold as any,
  },
  
  // Account selector styles
  accountSelectorContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[3],
  },
  accountCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    minWidth: 180,
    marginRight: theme.spacing[2],
    ...theme.shadows.sm,
  },
  accountCardSelected: {
    backgroundColor: theme.colors.backgroundPrimary,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  accountCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[1],
  },
  accountCardName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textDark,
  },
  defaultBadge: {
    backgroundColor: theme.colors.primary,
    fontSize: 10,
  },
  accountCardBalance: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
    marginVertical: theme.spacing[1],
  },
  accountCardType: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
  addAccountCard: {
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  addAccountText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium as any,
    marginTop: theme.spacing[1],
  },
  
  // Actions row styles
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[1],
    ...theme.shadows.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDark,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  
  // Tab selector styles
  tabSelectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButton: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    marginRight: theme.spacing[3],
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textMuted,
  },
  activeTabButtonText: {
    color: theme.colors.primary,
  },
  
  // Section styles
  sectionContainer: {
    marginBottom: theme.spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
  },
  sectionAction: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning,
    color: theme.colors.white,
    marginLeft: theme.spacing[1],
  },
  
  // Empty state styles
  emptyCard: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
    ...theme.shadows.sm,
  },
  emptyCardContent: {
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: theme.spacing[3],
    color: theme.colors.textMuted,
  },
  emptyButton: {
    marginTop: theme.spacing[2],
  },
  
  // Child accounts styles
  childAccountsContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  childCard: {
    width: 220,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    marginRight: theme.spacing[3],
    ...theme.shadows.sm,
  },
  childCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  childName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  childCardContent: {
    marginBottom: theme.spacing[3],
  },
  childBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  childBalanceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  childBalance: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
  },
  childInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[1],
  },
  childInfoLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
  childInfoValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textDark,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  childCardButton: {
    borderRadius: theme.borderRadius.md,
  },
  
  // Transaction styles
  transactionsCard: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
    ...theme.shadows.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[2],
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textDark,
  },
  transactionMeta: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing[1],
  },
  
  // Savings goals styles
  savingsGoalsContainer: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  savingsGoalCard: {
    width: 250,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[3],
    marginRight: theme.spacing[3],
    backgroundColor: theme.colors.backgroundPrimary,
    ...theme.shadows.sm,
  },
  savingsGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  savingsGoalName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  savingsGoalContent: {
    marginBottom: theme.spacing[3],
  },
  savingsGoalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing[2],
  },
  savingsGoalCurrentAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
  },
  savingsGoalTargetAmount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing[1],
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: 3,
    marginBottom: theme.spacing[3],
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  savingsGoalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savingsGoalInfoLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
  savingsGoalInfoValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textDark,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  savingsGoalButton: {
    borderRadius: theme.borderRadius.md,
  },
  
  // Pending request styles
  pendingRequestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[2],
  },
  pendingRequestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pendingRequestDetails: {
    marginLeft: theme.spacing[2],
  },
  pendingRequestDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textDark,
  },
  pendingRequestMeta: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  pendingRequestAmount: {
    alignItems: 'flex-end',
  },
  pendingAmount: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.textDark,
    marginBottom: theme.spacing[1],
  },
  pendingRequestActions: {
    flexDirection: 'row',
  },
  pendingActionButton: {
    marginLeft: theme.spacing[1],
    height: 28,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  declineButton: {
    borderColor: theme.colors.error,
  },
  
  // Recurring payments styles
  recurringPaymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
  },
  recurringPaymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[2],
  },
  recurringPaymentDetails: {
    flex: 1,
  },
  recurringPaymentName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textDark,
  },
  recurringPaymentMeta: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  recurringPaymentAmount: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.error,
  },
  
  // Tab content styles
  overviewContainer: {
    flex: 1,
  },
  overviewContentContainer: {
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },
  tabContent: {
    flex: 1,
    paddingTop: theme.spacing[3],
  },
  
  // List views styles
  addButton: {
    marginHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  childListCard: {
    marginHorizontal: theme.spacing[4],
    ...theme.shadows.sm,
  },
  childListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  childListDetails: {
    flex: 1,
    marginLeft: theme.spacing[2],
  },
  childListName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.textDark,
  },
  childListInfo: {
    marginTop: theme.spacing[2],
  },
  childListBalance: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDark,
    marginBottom: 4,
  },
  childListAllowance: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  childListActions: {
    alignItems: 'flex-end',
  },
  childListButton: {
    width: 80,
  },
  
  // Goal list styles
  goalListCard: {
    marginHorizontal: theme.spacing[4],
    ...theme.shadows.sm,
  },
  goalListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  goalListHeaderLeft: {
    flex: 1,
  },
  goalListName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold as any,
    color: theme.colors.textDark,
  },
  goalListProgress: {
    marginBottom: theme.spacing[3],
  },
  goalListProgressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDark,
    marginBottom: theme.spacing[1],
  },
  goalListProgressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: 3,
  },
  goalListProgressBar: {
    height: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  goalListDetails: {
    marginBottom: theme.spacing[3],
  },
  goalListDetailItem: {
    marginBottom: theme.spacing[1],
  },
  goalListDetailLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
  },
  goalListDetailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDark,
  },
  goalListActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  goalListButton: {
    flex: 1,
    maxWidth: 120,
  },
});

export default ParentWalletScreen;