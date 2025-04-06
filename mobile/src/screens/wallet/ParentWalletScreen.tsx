import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Card, Text, Title, Paragraph, Button, Divider, List, Avatar, FAB, Surface, Badge, ProgressBar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWallets, useTransactions } from '../../hooks/useWallet';

const ParentWalletScreen = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedChild, setExpandedChild] = useState<number | null>(null);
  
  // Fetch parent wallets and child wallets
  const { data: wallets = [], isLoading: walletsLoading, refetch: refetchWallets } = useWallets();
  
  // Filter parent and child wallets
  const parentWallets = wallets.filter(wallet => wallet.isMain);
  const childWallets = wallets.filter(wallet => wallet.walletType === 'child');
  
  // Group child wallets by user
  const childWalletsByUser = childWallets.reduce((acc, wallet) => {
    if (!acc[wallet.userId]) {
      acc[wallet.userId] = [];
    }
    acc[wallet.userId].push(wallet);
    return acc;
  }, {});
  
  // Format currency
  const formatCurrency = (amount: string) => {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Calculate remaining allowance percentage
  const calculateAllowancePercentage = (wallet) => {
    if (!wallet.monthlyLimit) return 1;
    
    const limit = parseFloat(wallet.monthlyLimit);
    const balance = parseFloat(wallet.balance);
    
    return Math.min(Math.max(balance / limit, 0), 1);
  };
  
  // Calculate spending by category
  const getSpendingByCategory = (userId) => {
    // In a real app, this would fetch from the API
    // This is sample data for demonstration
    return [
      { category: 'Food', amount: 45.25 },
      { category: 'Entertainment', amount: 20.00 },
      { category: 'Education', amount: 15.50 },
      { category: 'Clothing', amount: 35.00 },
    ];
  };
  
  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetchWallets();
    setRefreshing(false);
  };
  
  // Toggle expanded child section
  const toggleExpandChild = (userId) => {
    if (expandedChild === userId) {
      setExpandedChild(null);
    } else {
      setExpandedChild(userId);
    }
  };
  
  // Navigate to child settings
  const goToChildSettings = (userId) => {
    // @ts-ignore
    navigation.navigate('ChildSettings', { userId });
  };
  
  // Navigate to add child
  const goToAddChild = () => {
    // @ts-ignore
    navigation.navigate('AddChild');
  };
  
  // Navigate to transfer funds
  const goToTransferFunds = (walletId) => {
    // @ts-ignore
    navigation.navigate('TransferFunds', { walletId });
  };
  
  // Sample child users data (in a real app, this would come from the API)
  const childUsers = [
    { id: 101, name: 'Emily', age: 14, avatar: 'face-woman' },
    { id: 102, name: 'Michael', age: 10, avatar: 'face-man' },
  ];

  // Get child name for wallet
  const getChildName = (userId) => {
    const child = childUsers.find(c => c.id === userId);
    return child ? child.name : 'Child';
  };
  
  // Get child avatar for wallet
  const getChildAvatar = (userId) => {
    const child = childUsers.find(c => c.id === userId);
    return child ? child.avatar : 'face';
  };
  
  // Get approval requests count (in a real app, this would come from the API)
  const getApprovalRequestsCount = () => {
    return 3;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Parent Wallet Card */}
        {parentWallets.map((wallet) => (
          <Surface key={wallet.id} style={styles.walletCard} elevation={2}>
            <View style={styles.walletHeader}>
              <View>
                <Text style={styles.walletTitle}>Family Wallet</Text>
                <Text style={styles.walletBalance}>{formatCurrency(wallet.balance)}</Text>
              </View>
              <Avatar.Icon size={40} icon="wallet" color="white" style={styles.walletIcon} />
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => goToTransferFunds(wallet.id)}
              >
                <Avatar.Icon size={36} icon="bank-transfer" style={styles.actionIcon} />
                <Text style={styles.actionText}>Transfer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Avatar.Icon size={36} icon="account-cash" style={styles.actionIcon} />
                <Text style={styles.actionText}>Allowance</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Avatar.Icon size={36} icon="chart-bar" style={styles.actionIcon} />
                <Text style={styles.actionText}>Analytics</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <View>
                  <Avatar.Icon size={36} icon="check-decagram" style={styles.actionIcon} />
                  <Badge style={styles.notificationBadge}>{getApprovalRequestsCount()}</Badge>
                </View>
                <Text style={styles.actionText}>Approvals</Text>
              </TouchableOpacity>
            </View>
          </Surface>
        ))}
        
        {/* Child Wallets Section */}
        <Card style={styles.childrenCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Children's Wallets</Title>
              <Button 
                icon="plus"
                mode="contained"
                compact
                onPress={goToAddChild}
              >
                Add Child
              </Button>
            </View>
            
            {walletsLoading ? (
              <View style={styles.loadingContainer}>
                <Text>Loading children's wallets...</Text>
              </View>
            ) : Object.keys(childWalletsByUser).length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="wallet-outline" size={48} color={theme.colors.placeholder} />
                <Text style={styles.emptyStateText}>No child wallets found</Text>
                <Button 
                  mode="contained" 
                  icon="plus" 
                  onPress={goToAddChild}
                  style={styles.emptyStateButton}
                >
                  Add Your First Child
                </Button>
              </View>
            ) : (
              Object.keys(childWalletsByUser).map((userId) => {
                const userWallets = childWalletsByUser[userId];
                const isExpanded = expandedChild === parseInt(userId);
                
                // Get main wallet for this child
                const mainWallet = userWallets.find(w => w.isMain) || userWallets[0];
                
                return (
                  <Card key={userId} style={styles.childCard}>
                    <TouchableOpacity
                      onPress={() => toggleExpandChild(parseInt(userId))}
                      style={styles.childCardHeader}
                    >
                      <View style={styles.childInfo}>
                        <Avatar.Icon 
                          size={40} 
                          icon={getChildAvatar(parseInt(userId))} 
                          style={styles.childAvatar} 
                        />
                        <View>
                          <Text style={styles.childName}>{getChildName(parseInt(userId))}</Text>
                          <Text style={styles.childBalance}>{formatCurrency(mainWallet.balance)}</Text>
                        </View>
                      </View>
                      <View style={styles.allowanceContainer}>
                        <Text style={styles.allowanceText}>Monthly Allowance</Text>
                        <ProgressBar 
                          progress={calculateAllowancePercentage(mainWallet)} 
                          color={theme.colors.primary}
                          style={styles.allowanceBar}
                        />
                        <Text style={styles.allowanceAmount}>
                          {formatCurrency(mainWallet.balance)} of {mainWallet.monthlyLimit ? formatCurrency(mainWallet.monthlyLimit) : 'Unlimited'}
                        </Text>
                      </View>
                      <Icon 
                        name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                        size={24} 
                        color={theme.colors.primary} 
                      />
                    </TouchableOpacity>
                    
                    {isExpanded && (
                      <View style={styles.childDetails}>
                        <Divider />
                        
                        {/* Child's wallets */}
                        {userWallets.length > 1 && (
                          <View style={styles.subWalletsContainer}>
                            <Text style={styles.subWalletsTitle}>Sub-Wallets</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              {userWallets.map((wallet) => (
                                <Surface key={wallet.id} style={[
                                  styles.subWalletCard,
                                  wallet.walletType === 'savings' && styles.savingsWalletCard,
                                  wallet.walletType === 'education' && styles.educationWalletCard,
                                ]} elevation={1}>
                                  <Text style={styles.subWalletType}>
                                    {wallet.walletType.charAt(0).toUpperCase() + wallet.walletType.slice(1)}
                                  </Text>
                                  <Text style={styles.subWalletBalance}>{formatCurrency(wallet.balance)}</Text>
                                  <TouchableOpacity 
                                    style={styles.topUpButton}
                                    onPress={() => goToTransferFunds(wallet.id)}
                                  >
                                    <Text style={styles.topUpText}>Top Up</Text>
                                  </TouchableOpacity>
                                </Surface>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                        
                        {/* Spending by category */}
                        <View style={styles.spendingContainer}>
                          <Text style={styles.spendingTitle}>Recent Spending</Text>
                          {getSpendingByCategory(parseInt(userId)).map((item, index) => (
                            <View key={index} style={styles.categoryItem}>
                              <Text style={styles.categoryName}>{item.category}</Text>
                              <Text style={styles.categoryAmount}>{formatCurrency(item.amount.toString())}</Text>
                            </View>
                          ))}
                        </View>
                        
                        {/* Action buttons */}
                        <View style={styles.childActions}>
                          <Button 
                            mode="outlined" 
                            icon="cog" 
                            onPress={() => goToChildSettings(parseInt(userId))}
                            style={styles.childActionButton}
                          >
                            Settings
                          </Button>
                          <Button 
                            mode="outlined" 
                            icon="history" 
                            style={styles.childActionButton}
                          >
                            Transaction History
                          </Button>
                        </View>
                      </View>
                    )}
                  </Card>
                );
              })
            )}
          </Card.Content>
        </Card>
        
        {/* Educational Content Section */}
        <Card style={styles.educationCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Financial Education</Title>
            <Text style={styles.educationSubtitle}>
              Teaching resources to help your children learn about money
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resourcesContainer}>
              <Card style={styles.resourceCard}>
                <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1579621970590-9d624316904b?auto=format&fit=crop&q=80&w=300&h=200' }} />
                <Card.Content>
                  <Title style={styles.resourceTitle}>Saving Basics</Title>
                  <Paragraph>Help your kids understand the importance of saving money early.</Paragraph>
                </Card.Content>
                <Card.Actions>
                  <Button>View</Button>
                </Card.Actions>
              </Card>
              
              <Card style={styles.resourceCard}>
                <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=300&h=200' }} />
                <Card.Content>
                  <Title style={styles.resourceTitle}>Budgeting 101</Title>
                  <Paragraph>Interactive lessons on creating and maintaining a budget.</Paragraph>
                </Card.Content>
                <Card.Actions>
                  <Button>View</Button>
                </Card.Actions>
              </Card>
              
              <Card style={styles.resourceCard}>
                <Card.Cover source={{ uri: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&q=80&w=300&h=200' }} />
                <Card.Content>
                  <Title style={styles.resourceTitle}>Goal Setting</Title>
                  <Paragraph>Learn to set financial goals and work towards them.</Paragraph>
                </Card.Content>
                <Card.Actions>
                  <Button>View</Button>
                </Card.Actions>
              </Card>
            </ScrollView>
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* FAB for new transaction */}
      <FAB
        style={styles.fab}
        icon="plus"
        label="New Transaction"
        onPress={() => console.log('New transaction')}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  walletCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletBalance: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  walletIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionText: {
    color: 'white',
    marginTop: 4,
    fontSize: 12,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  childrenCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    marginVertical: 10,
  },
  emptyStateButton: {
    marginTop: 10,
  },
  childCard: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  childCardHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  childAvatar: {
    marginRight: 12,
    backgroundColor: theme.colors.primary,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  childBalance: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  allowanceContainer: {
    flex: 2,
    marginHorizontal: 12,
  },
  allowanceText: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  allowanceBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  allowanceAmount: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  childDetails: {
    padding: 16,
  },
  subWalletsContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  subWalletsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subWalletCard: {
    padding: 12,
    width: 140,
    height: 90,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
  savingsWalletCard: {
    backgroundColor: '#4CAF50',
  },
  educationWalletCard: {
    backgroundColor: '#2196F3',
  },
  subWalletType: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  subWalletBalance: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  topUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  topUpText: {
    color: 'white',
    fontSize: 12,
  },
  spendingContainer: {
    marginBottom: 16,
  },
  spendingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 14,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  childActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  childActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  educationCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 80, // Extra space for FAB
  },
  educationSubtitle: {
    color: theme.colors.placeholder,
    marginBottom: 16,
  },
  resourcesContainer: {
    marginTop: 8,
  },
  resourceCard: {
    width: 250,
    marginRight: 16,
  },
  resourceTitle: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default ParentWalletScreen;