import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, commonStyles, shadows } from '../../utils/theme';

type Transaction = {
  id: string;
  date: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  status: 'completed' | 'pending' | 'failed';
  merchantLogo?: string;
  merchantName?: string;
};

type TransactionsListProps = {
  transactions: Transaction[];
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onLoadMore?: () => void;
  hasMoreData?: boolean;
};

const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  isLoading,
  hasError,
  errorMessage,
  onRetry,
  onLoadMore,
  hasMoreData = false,
}) => {
  const navigation = useNavigation();

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      food: 'food',
      shopping: 'cart',
      entertainment: 'movie',
      transport: 'car',
      health: 'medical-bag',
      utilities: 'flash',
      education: 'school',
      travel: 'airplane',
      salary: 'cash-multiple',
      transfer: 'bank-transfer',
      default: 'currency-usd',
    };

    return iconMap[category.toLowerCase()] || iconMap.default;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return colors.success;
      case 'expense':
        return colors.danger;
      case 'transfer':
        return colors.info;
      default:
        return colors.gray7;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'clock-outline';
      case 'failed':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'failed':
        return colors.danger;
      default:
        return colors.gray7;
    }
  };

  const handleTransactionPress = (transaction: Transaction) => {
    navigation.navigate('TransactionDetails', { transactionId: transaction.id });
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          {item.merchantLogo ? (
            <Image source={{ uri: item.merchantLogo }} style={styles.merchantLogo} />
          ) : (
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: `${getTypeColor(item.type)}20` },
              ]}
            >
              <Icon
                name={getCategoryIcon(item.category)}
                size={24}
                color={getTypeColor(item.type)}
              />
            </View>
          )}
          <View style={styles.transactionDetails}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.transactionSubtitle}>
              <Text style={styles.transactionDate}>
                {format(new Date(item.date), 'MMM dd, yyyy')}
              </Text>
              <Icon
                name={getStatusIcon(item.status)}
                size={14}
                color={getStatusColor(item.status)}
                style={styles.statusIcon}
              />
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text
            style={[
              styles.transactionAmount,
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
          <Text style={styles.merchantName} numberOfLines={1}>
            {item.merchantName || item.category}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (isLoading && transactions.length > 0) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    if (hasMoreData) {
      return (
        <TouchableOpacity style={styles.loadMoreButton} onPress={onLoadMore}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      );
    }

    if (transactions.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.endOfListText}>End of transactions</Text>
        </View>
      );
    }

    return null;
  };

  if (isLoading && transactions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle" size={48} color={colors.danger} />
        <Text style={styles.errorText}>{errorMessage || 'Failed to load transactions'}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="credit-card-outline" size={48} color={colors.gray6} />
        <Text style={styles.emptyStateTitle}>No transactions yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Your transactions will appear here once you start using your wallet
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      renderItem={renderTransactionItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 8,
    ...shadows.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    marginBottom: 4,
  },
  transactionSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
  },
  statusIcon: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  merchantName: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    maxWidth: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.fontSize.md,
    color: colors.gray7,
  },
  errorText: {
    marginTop: 12,
    fontSize: typography.fontSize.md,
    color: colors.danger,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  emptyStateTitle: {
    marginTop: 16,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray8,
  },
  emptyStateSubtitle: {
    marginTop: 8,
    fontSize: typography.fontSize.sm,
    color: colors.gray6,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  endOfListText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray6,
  },
});

export default TransactionsList;