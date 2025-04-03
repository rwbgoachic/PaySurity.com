import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Text, Title, Paragraph, Button, Divider, List, Avatar, FAB, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Sample data for demonstration
const sampleWallets = [
  { id: 1, name: 'Personal Wallet', balance: 2547.85, currency: 'USD', type: 'primary' },
  { id: 2, name: 'Business Account', balance: 14250.42, currency: 'USD', type: 'business' },
  { id: 3, name: 'Savings', balance: 5680.00, currency: 'USD', type: 'savings' },
];

const sampleTransactions = [
  { id: 1, title: 'Grocery Shopping', amount: -125.42, date: '2025-04-02', category: 'Shopping', icon: 'basket' },
  { id: 2, title: 'Salary Deposit', amount: 2450.00, date: '2025-04-01', category: 'Income', icon: 'cash-plus' },
  { id: 3, title: 'Restaurant Bill', amount: -85.40, date: '2025-03-31', category: 'Dining', icon: 'food' },
  { id: 4, title: 'Gas Station', amount: -42.50, date: '2025-03-30', category: 'Transport', icon: 'gas-station' },
  { id: 5, title: 'Online Purchase', amount: -129.99, date: '2025-03-29', category: 'Shopping', icon: 'shopping' },
];

const sampleCards = [
  { id: 1, type: 'visa', name: 'Visa Signature', last4: '4321', expiry: '05/28', color: '#1A1F71' },
  { id: 2, type: 'mastercard', name: 'Mastercard Gold', last4: '8765', expiry: '12/26', color: '#EB001B' },
];

const WalletDashboardScreen = () => {
  const navigation = useNavigation();
  const [activeWallet, setActiveWallet] = useState(sampleWallets[0]);

  // Navigate to transactions screen
  const goToTransactions = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('WalletTransactions');
  };

  // Navigate to cards screen
  const goToCards = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('WalletCards');
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Wallet Cards Section */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.walletCardsContainer}
        >
          {sampleWallets.map((wallet) => (
            <TouchableOpacity
              key={wallet.id}
              onPress={() => setActiveWallet(wallet)}
              style={{ width: 300, marginRight: 16 }}
            >
              <Surface 
                style={[
                  styles.walletCard,
                  activeWallet.id === wallet.id && styles.activeWalletCard,
                  wallet.type === 'business' && styles.businessWalletCard,
                  wallet.type === 'savings' && styles.savingsWalletCard,
                ]}
                elevation={2}
              >
                <View style={styles.walletCardHeader}>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                  <Icon 
                    name={
                      wallet.type === 'primary' ? 'wallet' : 
                      wallet.type === 'business' ? 'briefcase' : 'piggy-bank'
                    } 
                    size={24} 
                    color="white" 
                  />
                </View>
                <Text style={styles.walletBalanceLabel}>Available Balance</Text>
                <Text style={styles.walletBalance}>{formatCurrency(wallet.balance)}</Text>
                <View style={styles.walletCardFooter}>
                  <Text style={styles.walletCardFooterText}>Tap for details</Text>
                </View>
              </Surface>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Quick Actions Section */}
        <Card style={styles.quickActionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Quick Actions</Title>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#4CAF50' }]}>
                  <Icon name="bank-transfer" size={24} color="white" />
                </View>
                <Text style={styles.quickActionText}>Transfer</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#2196F3' }]}>
                  <Icon name="qrcode-scan" size={24} color="white" />
                </View>
                <Text style={styles.quickActionText}>Scan & Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#FFC107' }]}>
                  <Icon name="credit-card-plus" size={24} color="white" />
                </View>
                <Text style={styles.quickActionText}>Top Up</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionButton}>
                <View style={[styles.quickActionIcon, { backgroundColor: '#9C27B0' }]}>
                  <Icon name="cash-multiple" size={24} color="white" />
                </View>
                <Text style={styles.quickActionText}>Request</Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Payment Methods Section */}
        <Card style={styles.paymentMethodsCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Payment Methods</Title>
              <Button mode="text" onPress={goToCards}>View All</Button>
            </View>
            {sampleCards.map((card) => (
              <Surface key={card.id} style={styles.cardSurface} elevation={1}>
                <View style={[styles.cardBackground, { backgroundColor: card.color }]}>
                  <View style={styles.cardDetails}>
                    <Icon 
                      name={card.type === 'visa' ? 'credit-card' : 'credit-card-outline'} 
                      size={28} 
                      color="white" 
                    />
                    <Text style={styles.cardName}>{card.name}</Text>
                    <Text style={styles.cardNumber}>•••• {card.last4}</Text>
                    <Text style={styles.cardExpiry}>Expires {card.expiry}</Text>
                  </View>
                </View>
              </Surface>
            ))}
            <Button 
              mode="outlined" 
              icon="plus" 
              onPress={() => navigation.navigate('WalletAddCard')}
              style={styles.addCardButton}
            >
              Add Payment Method
            </Button>
          </Card.Content>
        </Card>

        {/* Recent Transactions Section */}
        <Card style={styles.recentTransactionsCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Recent Transactions</Title>
              <Button mode="text" onPress={goToTransactions}>View All</Button>
            </View>
            {sampleTransactions.slice(0, 3).map((transaction) => (
              <View key={transaction.id}>
                <List.Item
                  title={transaction.title}
                  description={transaction.date}
                  left={(props) => (
                    <Avatar.Icon 
                      {...props} 
                      icon={transaction.icon}
                      style={{
                        backgroundColor: transaction.amount > 0 ? '#4CAF50' : '#F44336',
                      }} 
                      size={40} 
                    />
                  )}
                  right={() => (
                    <View style={styles.transactionAmount}>
                      <Text style={[
                        styles.amount,
                        { color: transaction.amount > 0 ? '#4CAF50' : '#F44336' }
                      ]}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </Text>
                      <Text style={styles.category}>{transaction.category}</Text>
                    </View>
                  )}
                />
                <Divider />
              </View>
            ))}
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
  walletCardsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  walletCard: {
    padding: 16,
    borderRadius: 12,
    height: 180,
    backgroundColor: theme.colors.primary,
    justifyContent: 'space-between',
  },
  activeWalletCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  businessWalletCard: {
    backgroundColor: '#1E88E5',
  },
  savingsWalletCard: {
    backgroundColor: '#43A047',
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletBalanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 20,
  },
  walletBalance: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  walletCardFooter: {
    alignItems: 'flex-end',
  },
  walletCardFooterText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  quickActionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  paymentMethodsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardSurface: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBackground: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
  },
  cardDetails: {
    height: 100,
    justifyContent: 'space-between',
  },
  cardName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cardNumber: {
    color: 'white',
    fontSize: 16,
  },
  cardExpiry: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  addCardButton: {
    marginTop: 8,
  },
  recentTransactionsCard: {
    marginHorizontal: 16,
    marginBottom: 80, // Extra space at the bottom for the FAB
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  category: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default WalletDashboardScreen;