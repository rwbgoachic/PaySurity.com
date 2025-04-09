import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, commonStyles, shadows } from '../../utils/theme';
import AnimatedCard from '../../components/animations/AnimatedCard';
import AnimatedButton from '../../components/animations/AnimatedButton';
import AnimatedTransactionsList from '../../components/animations/AnimatedTransactionsList';
import { useAnimationToolkit } from '../../components/animations/AnimationToolkit';
import ScreenTransition from '../../components/animations/ScreenTransition';
import { Transaction } from '../../hooks/useWallet';

const { width } = Dimensions.get('window');

// Sample data for demonstration
const mockCards = [
  {
    id: '1',
    cardHolder: 'John Doe',
    cardNumber: '4111111111111111',
    expiryDate: '12/25',
    cardType: 'visa',
    isDefault: true,
    balance: 5782.45,
    cardStyle: 'pattern1',
  },
  {
    id: '2',
    cardHolder: 'John Doe',
    cardNumber: '5555555555554444',
    expiryDate: '10/24',
    cardType: 'mastercard',
    isDefault: false,
    balance: 2340.12,
    cardStyle: 'pattern2',
  },
];

const mockTransactions = [
  {
    id: '1',
    date: '2023-07-20T14:30:00Z',
    title: 'Grocery Store',
    amount: 85.43,
    type: 'expense' as const,
    category: 'shopping',
    status: 'completed' as const,
    merchantName: 'Whole Foods',
  },
  {
    id: '2',
    date: '2023-07-18T09:15:00Z',
    title: 'Salary Deposit',
    amount: 2500.00,
    type: 'income' as const,
    category: 'salary',
    status: 'completed' as const,
    merchantName: 'Company Inc.',
  },
  {
    id: '3',
    date: '2023-07-15T20:45:00Z',
    title: 'Restaurant',
    amount: 67.80,
    type: 'expense' as const,
    category: 'food',
    status: 'completed' as const,
    merchantName: 'Italian Bistro',
  },
  {
    id: '4',
    date: '2023-07-12T13:20:00Z',
    title: 'Uber Ride',
    amount: 24.50,
    type: 'expense' as const,
    category: 'transport',
    status: 'completed' as const,
    merchantName: 'Uber',
  },
  {
    id: '5',
    date: '2023-07-10T11:00:00Z',
    title: 'Transfer to Savings',
    amount: 500.00,
    type: 'transfer' as const,
    category: 'transfer',
    status: 'completed' as const,
    merchantName: 'Internal Transfer',
  },
];

const WalletDashboard = () => {
  const navigation = useNavigation();
  const animationToolkit = useAnimationToolkit();
  const [refreshing, setRefreshing] = useState(false);
  const [cards, setCards] = useState(mockCards);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [screenVisible, setScreenVisible] = useState(false);

  // Animated values
  const scrollX = useRef(new Animated.Value(0)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.95)).current;
  const headerOpacityAnim = useRef(new Animated.Value(0)).current;

  // Refresh wallet data
  const refreshWallet = async () => {
    setRefreshing(true);
    
    // Show loading animation
    animationToolkit.showLoading({
      type: 'card',
      message: 'Refreshing wallet data...',
      showIcon: true,
    });
    
    try {
      // In a real app, you would fetch fresh data here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network request
      // setCards(freshCardsData);
      // setTransactions(freshTransactionsData);
      setError(false);
      
      // Show success notification
      animationToolkit.showNotification({
        type: 'success',
        title: 'Wallet Updated',
        message: 'Your wallet data has been refreshed successfully',
        autoHide: true,
      });
    } catch (err) {
      console.error('Error refreshing wallet data:', err);
      setError(true);
      
      // Show error notification
      animationToolkit.showNotification({
        type: 'failed',
        title: 'Update Failed',
        message: 'Failed to refresh wallet data. Please try again.',
        autoHide: true,
      });
    } finally {
      // Hide loading animation
      animationToolkit.hideLoading();
      setRefreshing(false);
    }
  };

  // Load wallet data
  useEffect(() => {
    const loadWalletData = async () => {
      setLoading(true);
      
      // Show loading animation
      animationToolkit.showLoading({
        type: 'spinner',
        message: 'Loading wallet data...',
      });
      
      try {
        // In a real app, you would fetch data here
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network request
        // setCards(cardsData);
        // setTransactions(transactionsData);
      } catch (err) {
        console.error('Error loading wallet data:', err);
        setError(true);
        
        // Show error notification
        animationToolkit.showNotification({
          type: 'failed',
          title: 'Loading Failed',
          message: 'Failed to load wallet data. Please try again.',
          autoHide: true,
        });
      } finally {
        // Hide loading animation
        animationToolkit.hideLoading();
        setLoading(false);
        
        // Show animated entrance
        setScreenVisible(true);
      }
    };

    loadWalletData();
    
    // Animate header
    Animated.parallel([
      Animated.spring(headerScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle card press
  const handleCardPress = (cardId: string) => {
    const selectedCard = cards.find(card => card.id === cardId);
    
    if (selectedCard) {
      // Show card details in a notification
      animationToolkit.showNotification({
        type: 'info',
        title: `${selectedCard.cardType.toUpperCase()} Card`,
        message: `Balance: $${selectedCard.balance.toFixed(2)}`,
        icon: selectedCard.cardType === 'visa' ? 'credit-card' : 'credit-card-outline',
      });
      
      // Navigate to card details or perform action
      navigation.navigate('TransactionDetails', { transactionId: '1' });
    }
  };

  // Navigate to add payment method
  const handleAddPaymentMethod = () => {
    navigation.navigate('PaymentProcess', {
      amount: 0,
      transactionType: 'send',
    });
  };

  // Navigate to send money
  const handleSendMoney = () => {
    navigation.navigate('SendMoney');
  };

  // Navigate to request money
  const handleRequestMoney = () => {
    navigation.navigate('RequestMoney');
  };

  // Navigate to scan QR code
  const handleScanQR = () => {
    // Show animation demo screen
    navigation.navigate('AnimationDemo');
  };

  // Render card indicator dots
  const renderCardIndicator = () => {
    return (
      <View style={styles.cardIndicatorContainer}>
        {cards.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp',
          });

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.cardIndicatorDot,
                {
                  opacity,
                  transform: [{ scale }],
                  backgroundColor:
                    index === currentCardIndex ? colors.white : 'rgba(255, 255, 255, 0.5)',
                },
              ]}
            />
          );
        })}
      </View>
    );
  };
  
  // Custom render for transaction items
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => {
          // Navigate to transaction details
          navigation.navigate('TransactionDetails', { transactionId: item.id });
        }}
      >
        <View style={styles.transactionIcon}>
          <Icon
            name={
              item.type === 'income'
                ? 'arrow-down'
                : item.type === 'expense'
                ? 'arrow-up'
                : 'bank-transfer'
            }
            size={20}
            color={
              item.type === 'income'
                ? colors.success
                : item.type === 'expense'
                ? colors.danger
                : colors.info
            }
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.transactionSubtitle} numberOfLines={1}>
            {item.merchantName || item.category}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              {
                color:
                  item.type === 'income'
                    ? colors.success
                    : item.type === 'expense'
                    ? colors.danger
                    : colors.info,
              },
            ]}
          >
            {item.type === 'income' ? '+' : item.type === 'expense' ? '-' : ''}$
            {Math.abs(item.amount).toFixed(2)}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent={false}
      />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacityAnim,
            transform: [{ scale: headerScaleAnim }],
          },
        ]}
      >
        <Text style={styles.headerTitle}>Wallet</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            // Show animation demo screen
            navigation.navigate('AnimationDemo');
          }}
        >
          <Icon name="animation" size={24} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>

      <ScreenTransition 
        visible={screenVisible}
        transitionType="fade"
        duration={500}
      >
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshWallet}
              tintColor={colors.white}
              colors={[colors.white]}
              progressBackgroundColor={colors.primary}
            />
          }
        >
          {/* Cards Section */}
          <View style={styles.cardsSection}>
            <Animated.ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              decelerationRate="fast"
              contentContainerStyle={styles.cardsScrollContainer}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setCurrentCardIndex(index);
              }}
            >
              {cards.map((card, index) => (
                <View key={card.id} style={styles.cardContainer}>
                  <AnimatedCard
                    id={card.id}
                    cardHolder={card.cardHolder}
                    cardNumber={card.cardNumber}
                    expiryDate={card.expiryDate}
                    cardType={card.cardType as any}
                    isDefault={card.isDefault}
                    balance={card.balance}
                    cardStyle={card.cardStyle as any}
                    onPress={handleCardPress}
                    gradientColors={
                      index === 0
                        ? [colors.primaryDark, colors.primary]
                        : index === 1
                        ? ['#6B2FBC', '#9850DD']
                        : ['#2F86BC', '#50B8DD']
                    }
                    isActive={index === currentCardIndex}
                    entryAnimation={true}
                    animationType={index === currentCardIndex ? 'pulse' : 'none'}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={styles.addCardButton}
                onPress={handleAddPaymentMethod}
              >
                <View style={styles.addCardContent}>
                  <Icon name="plus-circle-outline" size={48} color={colors.gray6} />
                  <Text style={styles.addCardText}>Add Payment Method</Text>
                </View>
              </TouchableOpacity>
            </Animated.ScrollView>

            {renderCardIndicator()}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleSendMoney}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
                <Icon name="send" size={24} color={colors.primary} />
              </View>
              <Text style={styles.quickActionText}>Send</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleRequestMoney}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(88, 86, 214, 0.1)' }]}>
                <Icon name="cash-multiple" size={24} color={colors.secondary} />
              </View>
              <Text style={styles.quickActionText}>Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={handleScanQR}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(52, 199, 89, 0.1)' }]}>
                <Icon name="animation-outline" size={24} color={colors.success} />
              </View>
              <Text style={styles.quickActionText}>Animate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255, 149, 0, 0.1)' }]}>
                <Icon name="bell-outline" size={24} color="#FF9500" />
              </View>
              <Text style={styles.quickActionText}>Activity</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
              <AnimatedButton
                label="See All"
                onPress={() => {}}
                variant="ghost"
                size="small"
                iconName="chevron-right"
                iconPosition="right"
              />
            </View>

            <AnimatedTransactionsList
              transactions={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No transactions found</Text>
                </View>
              }
              refreshing={refreshing}
              onRefresh={refreshWallet}
              contentContainerStyle={styles.transactionsListContainer}
              animationType="fade"
              animationDelay={100}
            />
          </View>
        </ScrollView>
      </ScreenTransition>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  settingsButton: {
    padding: 8,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  cardsSection: {
    backgroundColor: colors.primary,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.lg,
  },
  cardsScrollContainer: {
    paddingBottom: 16,
  },
  cardContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cardIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 8,
  },
  cardIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  addCardButton: {
    width: width - 32,
    height: (width - 32) / 1.586, // Standard credit card aspect ratio
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gray3,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  addCardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    marginTop: 12,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray7,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    ...shadows.sm,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
  },
  transactionsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
  },
  seeAllButton: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  transactionsListContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 8,
    ...shadows.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray9,
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray6,
  },
});

export default WalletDashboard;