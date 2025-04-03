import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Text, Title, Searchbar, Chip, List, Avatar, Divider, Button, Menu, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Sample data for demonstration
const sampleTransactions = [
  { id: 1, title: 'Grocery Shopping', amount: -125.42, date: '2025-04-02', category: 'Shopping', icon: 'basket' },
  { id: 2, title: 'Salary Deposit', amount: 2450.00, date: '2025-04-01', category: 'Income', icon: 'cash-plus' },
  { id: 3, title: 'Restaurant Bill', amount: -85.40, date: '2025-03-31', category: 'Dining', icon: 'food' },
  { id: 4, title: 'Gas Station', amount: -42.50, date: '2025-03-30', category: 'Transport', icon: 'gas-station' },
  { id: 5, title: 'Online Purchase', amount: -129.99, date: '2025-03-29', category: 'Shopping', icon: 'shopping' },
  { id: 6, title: 'Utility Bill', amount: -75.25, date: '2025-03-28', category: 'Bills', icon: 'lightning-bolt' },
  { id: 7, title: 'Contractor Payment', amount: 850.00, date: '2025-03-27', category: 'Income', icon: 'cash-plus' },
  { id: 8, title: 'Movie Tickets', amount: -32.50, date: '2025-03-26', category: 'Entertainment', icon: 'movie' },
  { id: 9, title: 'Coffee Shop', amount: -6.75, date: '2025-03-25', category: 'Dining', icon: 'coffee' },
  { id: 10, title: 'Gym Membership', amount: -59.99, date: '2025-03-25', category: 'Health', icon: 'dumbbell' },
];

// Filter categories
const filterCategories = [
  { id: 'all', name: 'All' },
  { id: 'income', name: 'Income' },
  { id: 'expenses', name: 'Expenses' },
  { id: 'shopping', name: 'Shopping' },
  { id: 'dining', name: 'Dining' },
  { id: 'transport', name: 'Transport' },
  { id: 'bills', name: 'Bills' },
  { id: 'entertainment', name: 'Entertainment' },
  { id: 'health', name: 'Health' },
];

const WalletTransactionsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Handle search
  const onChangeSearch = (query) => setSearchQuery(query);

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter transactions
  const filteredTransactions = sampleTransactions.filter((transaction) => {
    // Search filter
    const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    let matchesFilter = true;
    if (activeFilter !== 'all') {
      if (activeFilter === 'income') {
        matchesFilter = transaction.amount > 0;
      } else if (activeFilter === 'expenses') {
        matchesFilter = transaction.amount < 0;
      } else {
        matchesFilter = transaction.category.toLowerCase() === activeFilter.toLowerCase();
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  // Group transactions by date
  const groupTransactionsByDate = (transactions) => {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const dateKey = transaction.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });
    
    // Convert to array of objects for FlatList
    return Object.keys(grouped).map(date => ({
      date,
      transactions: grouped[date]
    }));
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  return (
    <SafeAreaView style={styles.container}>
      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search transactions"
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
          />
        </Card.Content>
      </Card>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        {filterCategories.map((category) => (
          <Chip
            key={category.id}
            selected={activeFilter === category.id}
            onPress={() => setActiveFilter(category.id)}
            style={styles.filterChip}
            selectedColor={theme.colors.primary}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>
      
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="credit-card-search-outline" size={60} color={theme.colors.disabled} />
          <Text style={styles.emptyStateText}>No transactions found</Text>
          <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={groupedTransactions}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
            <View style={styles.dateSection}>
              <Text style={styles.dateHeader}>{formatDate(item.date)}</Text>
              {item.transactions.map((transaction) => (
                <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
                  <List.Item
                    title={transaction.title}
                    description={transaction.category}
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
                        <IconButton
                          icon="dots-vertical"
                          size={20}
                          onPress={() => setIsMenuVisible(true)}
                        />
                      </View>
                    )}
                  />
                  <Divider />
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      )}
      
      <Menu
        visible={isMenuVisible}
        onDismiss={() => setIsMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
      >
        <Menu.Item onPress={() => {}} title="View Details" />
        <Menu.Item onPress={() => {}} title="Edit Category" />
        <Menu.Item onPress={() => {}} title="Split Transaction" />
        <Divider />
        <Menu.Item onPress={() => {}} title="Report Issue" />
      </Menu>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchCard: {
    margin: 16,
    marginBottom: 8,
  },
  searchBar: {
    backgroundColor: theme.colors.background,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
  },
  transactionItem: {
    backgroundColor: 'white',
  },
  transactionAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.placeholder,
    textAlign: 'center',
  },
});

export default WalletTransactionsScreen;