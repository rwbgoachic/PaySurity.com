import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, commonStyles, shadows } from '../../utils/theme';
import PaymentCard from '../../components/wallet/PaymentCard';

type PaymentMethod = {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  cardType?: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  bankName?: string;
  accountNumber?: string;
  walletProvider?: string;
  isDefault: boolean;
};

type PaymentProcessScreenParams = {
  amount: number;
  recipientId?: string;
  recipientName?: string;
  merchantId?: string;
  merchantName?: string;
  description?: string;
  transactionType: 'send' | 'request' | 'payment';
};

const PaymentProcessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as PaymentProcessScreenParams;

  const [amount, setAmount] = useState(params?.amount || 0);
  const [description, setDescription] = useState(params?.description || '');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);

  // Transaction details
  const recipientName = params?.recipientName || params?.merchantName || 'Recipient';
  const transactionType = params?.transactionType || 'payment';

  // Mock payment methods for demonstration
  const mockPaymentMethods = [
    {
      id: '1',
      type: 'card',
      cardType: 'visa',
      cardNumber: '4111111111111111',
      cardHolder: 'John Doe',
      expiryDate: '12/25',
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      cardType: 'mastercard',
      cardNumber: '5555555555554444',
      cardHolder: 'John Doe',
      expiryDate: '10/24',
      isDefault: false,
    },
    {
      id: '3',
      type: 'bank',
      bankName: 'Chase Bank',
      accountNumber: '****5678',
      isDefault: false,
    },
  ];

  // Load payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        // In a real app, fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setPaymentMethods(mockPaymentMethods);
        setSelectedPaymentMethodId(mockPaymentMethods.find(method => method.isDefault)?.id || null);
        setLoadingPaymentMethods(false);
      } catch (error) {
        setError('Failed to load payment methods');
        setLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Process payment
  const processPayment = async () => {
    if (!selectedPaymentMethodId) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate payment processing
      setProcessingStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStep(2);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProcessingStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Payment success
      setIsPaymentComplete(true);
    } catch (error) {
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Go back to wallet
  const goBackToWallet = () => {
    navigation.navigate('WalletRouter');
  };

  // Render selected payment method
  const renderSelectedPaymentMethod = () => {
    if (loadingPaymentMethods) {
      return (
        <View style={styles.paymentMethodLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      );
    }

    const selectedMethod = paymentMethods.find(
      method => method.id === selectedPaymentMethodId
    );

    if (!selectedMethod) {
      return (
        <TouchableOpacity
          style={styles.selectPaymentMethod}
          onPress={() => Alert.alert('Select Payment Method', 'Choose how you want to pay')}
        >
          <Icon name="credit-card-plus-outline" size={24} color={colors.primary} />
          <Text style={styles.selectPaymentMethodText}>Select Payment Method</Text>
        </TouchableOpacity>
      );
    }

    if (selectedMethod.type === 'card') {
      return (
        <View style={styles.selectedPaymentMethod}>
          <PaymentCard
            id={selectedMethod.id}
            cardHolder={selectedMethod.cardHolder || ''}
            cardNumber={selectedMethod.cardNumber || ''}
            expiryDate={selectedMethod.expiryDate || ''}
            cardType={selectedMethod.cardType as any || 'default'}
            isDefault={selectedMethod.isDefault}
            small={true}
            showBalance={false}
          />
        </View>
      );
    }

    return (
      <View style={styles.selectedPaymentMethod}>
        <View style={styles.alternativePaymentMethod}>
          <Icon
            name={selectedMethod.type === 'bank' ? 'bank' : 'wallet'}
            size={24}
            color={colors.primary}
          />
          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodTitle}>
              {selectedMethod.type === 'bank'
                ? selectedMethod.bankName
                : selectedMethod.walletProvider}
            </Text>
            <Text style={styles.paymentMethodSubtitle}>
              {selectedMethod.type === 'bank'
                ? selectedMethod.accountNumber
                : 'Digital Wallet'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Render payment methods
  const renderPaymentMethods = () => {
    return (
      <View style={styles.paymentMethodsList}>
        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethodItem,
              selectedPaymentMethodId === method.id && styles.selectedPaymentMethodItem,
            ]}
            onPress={() => setSelectedPaymentMethodId(method.id)}
          >
            <Icon
              name={
                method.type === 'card'
                  ? 'credit-card'
                  : method.type === 'bank'
                  ? 'bank'
                  : 'wallet'
              }
              size={24}
              color={
                selectedPaymentMethodId === method.id ? colors.primary : colors.gray7
              }
            />
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodName}>
                {method.type === 'card'
                  ? `${method.cardType?.toUpperCase()} ****${method.cardNumber?.slice(-4)}`
                  : method.type === 'bank'
                  ? method.bankName
                  : method.walletProvider}
              </Text>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
            </View>
            {selectedPaymentMethodId === method.id && (
              <Icon name="check-circle" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.addPaymentMethod}
          onPress={() => navigation.navigate('AddPaymentMethod')}
        >
          <Icon name="plus-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.addPaymentMethodText}>Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render payment processing UI
  const renderPaymentProcessing = () => {
    return (
      <View style={styles.processingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.processingText}>
          {processingStep === 1
            ? 'Connecting to payment provider...'
            : processingStep === 2
            ? 'Processing payment...'
            : 'Finalizing transaction...'}
        </Text>
        <View style={styles.processingSteps}>
          <View
            style={[
              styles.processingStep,
              { backgroundColor: processingStep >= 1 ? colors.primary : colors.gray3 },
            ]}
          />
          <View
            style={[
              styles.processingStep,
              { backgroundColor: processingStep >= 2 ? colors.primary : colors.gray3 },
            ]}
          />
          <View
            style={[
              styles.processingStep,
              { backgroundColor: processingStep >= 3 ? colors.primary : colors.gray3 },
            ]}
          />
        </View>
      </View>
    );
  };

  // Render payment success UI
  const renderPaymentSuccess = () => {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIconContainer}>
          <Icon name="check-circle" size={80} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>Payment Complete!</Text>
        <Text style={styles.successAmount}>${amount.toFixed(2)}</Text>
        <Text style={styles.successDescription}>
          Your payment to {recipientName} has been processed successfully.
        </Text>
        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsText}>View Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneButton} onPress={goBackToWallet}>
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          {!isPaymentComplete && (
            <TouchableOpacity style={styles.backButton} onPress={goBackToWallet}>
              <Icon name="arrow-left" size={24} color={colors.gray9} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {isPaymentComplete
              ? 'Payment Successful'
              : isProcessing
              ? 'Processing Payment'
              : transactionType === 'send'
              ? 'Send Money'
              : transactionType === 'request'
              ? 'Request Money'
              : 'Payment'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isPaymentComplete ? (
            renderPaymentSuccess()
          ) : isProcessing ? (
            renderPaymentProcessing()
          ) : (
            <View style={styles.content}>
              {/* Transaction Details */}
              <View style={styles.transactionDetails}>
                <Text style={styles.sectionTitle}>Transaction Details</Text>
                <View style={styles.recipientContainer}>
                  <Text style={styles.recipientLabel}>
                    {transactionType === 'request' ? 'Request From' : 'Paying To'}
                  </Text>
                  <Text style={styles.recipientName}>{recipientName}</Text>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={amount.toString()}
                      onChangeText={(text) => setAmount(parseFloat(text) || 0)}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                    />
                  </View>
                </View>

                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Description (Optional)</Text>
                  <TextInput
                    style={styles.descriptionInput}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What's this for?"
                    multiline
                  />
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.paymentMethodSection}>
                <Text style={styles.sectionTitle}>Payment Method</Text>
                {renderSelectedPaymentMethod()}
                <TouchableOpacity
                  style={styles.changePaymentMethodButton}
                  onPress={() => {
                    /* Toggle payment methods visibility */
                  }}
                >
                  <Text style={styles.changePaymentMethodText}>Change Payment Method</Text>
                </TouchableOpacity>
                {renderPaymentMethods()}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        {!isPaymentComplete && !isProcessing && (
          <View style={styles.footer}>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={[styles.payButton, !selectedPaymentMethodId && styles.payButtonDisabled]}
              onPress={processPayment}
              disabled={!selectedPaymentMethodId || isProcessing}
            >
              <Text style={styles.payButtonText}>
                {transactionType === 'send'
                  ? 'Send Money'
                  : transactionType === 'request'
                  ? 'Request Money'
                  : 'Pay Now'}
              </Text>
              {isProcessing && (
                <ActivityIndicator size="small" color={colors.white} style={styles.buttonLoader} />
              )}
            </TouchableOpacity>
            <Text style={styles.securePaymentText}>
              <Icon name="shield-check" size={14} color={colors.success} /> Secure payment
              processing
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
  },
  transactionDetails: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginBottom: 16,
  },
  recipientContainer: {
    marginBottom: 16,
  },
  recipientLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
    marginBottom: 4,
  },
  recipientName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray9,
  },
  amountContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
    marginBottom: 4,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  currencySymbol: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray8,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
    marginBottom: 4,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: colors.gray3,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 80,
    fontSize: typography.fontSize.md,
    color: colors.gray9,
    textAlignVertical: 'top',
  },
  paymentMethodSection: {
    marginBottom: 24,
  },
  paymentMethodLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.gray1,
    borderRadius: 12,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
  },
  selectedPaymentMethod: {
    marginBottom: 16,
  },
  alternativePaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.sm,
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray9,
  },
  paymentMethodSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray7,
  },
  selectPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.gray1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray3,
    marginBottom: 16,
  },
  selectPaymentMethodText: {
    marginLeft: 8,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  changePaymentMethodButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  changePaymentMethodText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  paymentMethodsList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 8,
    ...shadows.sm,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectedPaymentMethodItem: {
    backgroundColor: colors.gray1,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray9,
  },
  defaultBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray2,
    marginTop: 8,
  },
  addPaymentMethodText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray2,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
    marginBottom: 8,
    textAlign: 'center',
  },
  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.md,
  },
  payButtonDisabled: {
    backgroundColor: colors.gray4,
  },
  payButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  buttonLoader: {
    marginLeft: 8,
  },
  securePaymentText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray7,
    textAlign: 'center',
    marginTop: 8,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  processingText: {
    fontSize: typography.fontSize.md,
    color: colors.gray8,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  processingSteps: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingStep: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginBottom: 8,
  },
  successAmount: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginBottom: 16,
  },
  successDescription: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
    textAlign: 'center',
    marginBottom: 32,
  },
  viewDetailsButton: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  viewDetailsText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    ...shadows.md,
  },
  doneButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});

export default PaymentProcessScreen;