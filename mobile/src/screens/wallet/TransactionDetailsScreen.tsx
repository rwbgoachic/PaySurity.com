import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Share,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { colors, typography, commonStyles, shadows } from '../../utils/theme';
import { useWallet, Transaction } from '../../hooks/useWallet';

const TransactionDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { transactions } = useWallet();
  
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transactionId = route.params?.transactionId;

  useEffect(() => {
    if (!transactionId) {
      setError('Transaction ID not provided');
      setIsLoading(false);
      return;
    }

    // In a real app, this would be an API call
    const fetchTransaction = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call with delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Find transaction in the cached list
        const foundTransaction = transactions.find(t => t.id === transactionId);
        
        if (foundTransaction) {
          setTransaction(foundTransaction);
        } else {
          setError('Transaction not found');
        }
      } catch (err: any) {
        console.error('Error fetching transaction details:', err);
        setError(err.message || 'Failed to load transaction details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionId, transactions]);

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

  const getTransactionTypeDetails = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'income':
        return {
          icon: 'arrow-down',
          color: colors.success,
          title: transaction.senderName || 'Income',
          subtitle: 'Money received',
        };
      case 'expense':
        return {
          icon: 'arrow-up',
          color: colors.danger,
          title: transaction.merchantName || 'Expense',
          subtitle: 'Payment sent',
        };
      case 'transfer':
        return {
          icon: 'bank-transfer',
          color: colors.info,
          title: transaction.recipientName || transaction.senderName || 'Transfer',
          subtitle: transaction.recipientName ? 'Money sent' : 'Money received',
        };
      default:
        return {
          icon: 'cash',
          color: colors.gray7,
          title: 'Transaction',
          subtitle: 'Unknown type',
        };
    }
  };

  const handleShareReceipt = async () => {
    if (!transaction) return;
    
    try {
      const result = await Share.share({
        message: `Transaction Receipt\n\nAmount: $${Math.abs(
          transaction.amount
        ).toFixed(2)}\nDate: ${format(
          new Date(transaction.date),
          'MMM dd, yyyy HH:mm'
        )}\nDescription: ${transaction.description || 'N/A'}\nStatus: ${
          transaction.status
        }\nTransaction ID: ${transaction.id}`,
        title: 'Transaction Receipt',
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share was dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to share receipt');
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report an Issue',
      'Would you like to report an issue with this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Report',
          onPress: () => {
            // In a real app, navigate to a form or open a support ticket
            Alert.alert(
              'Issue Reported',
              'Our support team will review your transaction and contact you soon.'
            );
          },
        },
      ]
    );
  };

  const renderTransactionDetails = () => {
    if (!transaction) return null;

    const typeDetails = getTransactionTypeDetails(transaction);
    const formattedDate = format(new Date(transaction.date), 'MMMM dd, yyyy');
    const formattedTime = format(new Date(transaction.date), 'h:mm a');

    return (
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerSection}>
          <View style={[styles.iconContainer, { backgroundColor: typeDetails.color + '20' }]}>
            <Icon name={typeDetails.icon} size={32} color={typeDetails.color} />
          </View>
          <Text style={styles.transactionTitle}>{typeDetails.title}</Text>
          <Text style={styles.transactionSubtitle}>{typeDetails.subtitle}</Text>
          <Text
            style={[
              styles.transactionAmount,
              { color: transaction.type === 'income' ? colors.success : colors.gray9 },
            ]}
          >
            {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}$
            {Math.abs(transaction.amount).toFixed(2)}
          </Text>
          <View style={styles.statusContainer}>
            <Icon
              name={getStatusIcon(transaction.status)}
              size={16}
              color={getStatusColor(transaction.status)}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) },
              ]}
            >
              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formattedDate}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{formattedTime}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
              {transaction.id}
            </Text>
          </View>
          {transaction.description && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{transaction.description}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{transaction.category}</Text>
          </View>
          {transaction.merchantName && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Merchant</Text>
              <Text style={styles.detailValue}>{transaction.merchantName}</Text>
            </View>
          )}
          {transaction.recipientName && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Recipient</Text>
              <Text style={styles.detailValue}>{transaction.recipientName}</Text>
            </View>
          )}
          {transaction.senderName && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Sender</Text>
              <Text style={styles.detailValue}>{transaction.senderName}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryActionButton]}
            onPress={handleShareReceipt}
          >
            <Icon name="share" size={20} color={colors.white} style={styles.actionIcon} />
            <Text style={styles.primaryActionText}>Share Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryActionButton]}
            onPress={handleReportIssue}
          >
            <Icon name="flag" size={20} color={colors.danger} style={styles.actionIcon} />
            <Text style={styles.secondaryActionText}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        {transaction.type === 'expense' && transaction.status === 'completed' && (
          <TouchableOpacity
            style={styles.repeatPaymentButton}
            onPress={() => {
              // Navigate to payment process with prefilled data
              navigation.navigate('PaymentProcess', {
                amount: transaction.amount,
                recipientId: transaction.recipientId,
                recipientName: transaction.recipientName || transaction.title,
                description: transaction.description,
                transactionType: 'send',
              });
            }}
          >
            <Icon name="repeat" size={20} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.repeatPaymentText}>Repeat This Payment</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.gray9} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading transaction details...</Text>
        </View>
      </View>
    );
  }

  if (error || !transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={colors.gray9} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={colors.danger} />
          <Text style={styles.errorText}>{error || 'Transaction not found'}</Text>
          <TouchableOpacity
            style={styles.backToWalletButton}
            onPress={() => navigation.navigate('WalletDashboard')}
          >
            <Text style={styles.backToWalletText}>Back to Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.gray9} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Details</Text>
        <View style={{ width: 24 }} />
      </View>
      {renderTransactionDetails()}
    </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
  },
  scrollContainer: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.white,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
    marginBottom: 16,
  },
  transactionAmount: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.gray1,
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginLeft: 4,
  },
  detailsSection: {
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 8,
  },
  detailItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray2,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    color: colors.gray9,
    fontWeight: typography.fontWeight.medium,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  secondaryActionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  actionIcon: {
    marginRight: 8,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  secondaryActionText: {
    color: colors.danger,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  repeatPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.white,
    marginTop: 8,
    marginBottom: 24,
  },
  repeatPaymentText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.danger,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backToWalletButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    ...shadows.sm,
  },
  backToWalletText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
});

export default TransactionDetailsScreen;