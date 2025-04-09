import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Switch
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { colors, typography, shadows } from '../../utils/theme';
import AnimatedButton from '../../components/animations/AnimatedButton';
import { useAnimationToolkit } from '../../components/animations/AnimationToolkit';
import ScreenTransition from '../../components/animations/ScreenTransition';

const { width } = Dimensions.get('window');

interface PaymentDetails {
  merchantId: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  reference: string;
  currency: string;
  allowTip: boolean;
  tipOptions: number[];
  timestamp: number;
}

const GeneratePaymentScreen = () => {
  const navigation = useNavigation();
  const animationToolkit = useAnimationToolkit();
  
  // State for payment details
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [includeTax, setIncludeTax] = useState(false);
  const [taxRate, setTaxRate] = useState('8.25'); // Default tax rate
  const [allowTip, setAllowTip] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [paymentGenerated, setPaymentGenerated] = useState(false);
  const [qrData, setQrData] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  
  // Animation states
  const [screenVisible, setScreenVisible] = useState(false);
  
  // Make the screen visible with animation
  useEffect(() => {
    setScreenVisible(true);
  }, []);
  
  // Calculate payment details
  const calculatePaymentDetails = (): PaymentDetails | null => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      animationToolkit.showNotification({
        type: 'failed',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount',
        autoHide: true,
      });
      return null;
    }
    
    // Calculate tax if included
    const taxRateValue = includeTax ? parseFloat(taxRate) : 0;
    const taxAmount = includeTax ? (amountValue * (taxRateValue / 100)) : 0;
    const totalAmount = amountValue + taxAmount;
    
    // Generate a unique reference if not provided
    const paymentReference = reference || `PAY-${Date.now().toString().substring(7)}`;
    
    // Default tip options as percentages
    const tipOptions = [10, 15, 20];
    
    // Generate the payment details
    return {
      merchantId: 'MERCHANT-123', // This would come from merchant account
      amount: amountValue,
      taxRate: taxRateValue,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      reference: paymentReference,
      currency: currency,
      allowTip: allowTip,
      tipOptions: tipOptions,
      timestamp: Date.now()
    };
  };
  
  // Generate QR code for payment
  const generatePayment = () => {
    // Show loading animation
    animationToolkit.showLoading({
      type: 'transaction',
      message: 'Generating payment...',
      showIcon: true,
    });
    
    // Calculate payment details
    const details = calculatePaymentDetails();
    if (!details) {
      animationToolkit.hideLoading();
      return;
    }
    
    // In a real app, we would send this to the server and get a payment ID
    // For now, we'll just use the details directly
    setPaymentDetails(details);
    
    // Create the payment URL that will be encoded in the QR code
    // In production, this would be a URL to your payment page with a unique ID
    const paymentUrl = `https://paysurity.com/pay?` +
                       `ref=${details.reference}&` +
                       `amt=${details.amount}&` +
                       `tax=${details.taxAmount}&` +
                       `total=${details.totalAmount}&` +
                       `tip=${details.allowTip ? '1' : '0'}&` +
                       `curr=${details.currency}&` +
                       `mid=${details.merchantId}&` +
                       `ts=${details.timestamp}`;
    
    // Set the QR data
    setQrData(paymentUrl);
    
    // Simulate server processing time
    setTimeout(() => {
      animationToolkit.hideLoading();
      setPaymentGenerated(true);
      
      // Show success notification
      animationToolkit.showNotification({
        type: 'success',
        title: 'Payment Ready',
        message: `${currency} ${details.totalAmount.toFixed(2)} payment ready to be scanned`,
        autoHide: true,
      });
    }, 1500);
  };
  
  // Reset the payment
  const resetPayment = () => {
    setPaymentGenerated(false);
    setQrData('');
    setPaymentDetails(null);
  };
  
  // Render main input form
  const renderInputForm = () => {
    return (
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>{currency === 'USD' ? '$' : currency}</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.gray5}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Reference (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={reference}
              onChangeText={setReference}
              placeholder="Invoice #, Table #, etc."
              placeholderTextColor={colors.gray5}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Include Tax</Text>
            <Switch
              value={includeTax}
              onValueChange={setIncludeTax}
              trackColor={{ false: colors.gray4, true: `${colors.primary}80` }}
              thumbColor={includeTax ? colors.primary : colors.white}
            />
          </View>
          
          {includeTax && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tax Rate (%)</Text>
              <TextInput
                style={styles.textInput}
                value={taxRate}
                onChangeText={setTaxRate}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={colors.gray5}
              />
            </View>
          )}
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Allow Customer Tips</Text>
            <Switch
              value={allowTip}
              onValueChange={setAllowTip}
              trackColor={{ false: colors.gray4, true: `${colors.primary}80` }}
              thumbColor={allowTip ? colors.primary : colors.white}
            />
          </View>
          
          <View style={styles.currencySelector}>
            <Text style={styles.inputLabel}>Currency</Text>
            <View style={styles.currencyOptions}>
              {['USD', 'CAD', 'EUR', 'GBP'].map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyOption,
                    currency === curr && styles.selectedCurrency,
                  ]}
                  onPress={() => setCurrency(curr)}
                >
                  <Text
                    style={[
                      styles.currencyText,
                      currency === curr && styles.selectedCurrencyText,
                    ]}
                  >
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Base Amount:</Text>
              <Text style={styles.summaryValue}>
                {parseFloat(amount || '0').toFixed(2)} {currency}
              </Text>
            </View>
            
            {includeTax && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax ({taxRate}%):</Text>
                <Text style={styles.summaryValue}>
                  {(parseFloat(amount || '0') * (parseFloat(taxRate || '0') / 100)).toFixed(2)} {currency}
                </Text>
              </View>
            )}
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {(
                  parseFloat(amount || '0') +
                  (includeTax ? parseFloat(amount || '0') * (parseFloat(taxRate || '0') / 100) : 0)
                ).toFixed(2)} {currency}
              </Text>
            </View>
          </View>
          
          <AnimatedButton
            label="Generate Payment QR"
            onPress={generatePayment}
            variant="primary"
            size="large"
            iconName="qrcode-scan"
            iconPosition="left"
            fullWidth={true}
            style={styles.generateButton}
            disabled={!amount || parseFloat(amount) <= 0}
          />
        </View>
      </ScrollView>
    );
  };
  
  // Render QR code display
  const renderQRCode = () => {
    if (!paymentDetails) return null;
    
    return (
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>Payment QR Code</Text>
          <Text style={styles.qrSubtitle}>
            Have your customer scan this code to pay
          </Text>
          
          <View style={styles.qrCodeWrapper}>
            {qrData ? (
              <QRCode
                value={qrData}
                size={width * 0.6}
                color={colors.gray9}
                backgroundColor={colors.white}
                logo={require('../../assets/icons/payment-logo.png')}
                logoSize={width * 0.15}
                logoBackgroundColor="white"
              />
            ) : (
              <View style={[styles.qrPlaceholder, { width: width * 0.6, height: width * 0.6 }]}>
                <Icon name="qrcode" size={width * 0.3} color={colors.gray4} />
              </View>
            )}
          </View>
          
          <View style={styles.paymentInfoContainer}>
            <View style={styles.paymentInfoRow}>
              <Text style={styles.paymentInfoLabel}>Amount:</Text>
              <Text style={styles.paymentInfoValue}>
                {paymentDetails.currency} {paymentDetails.amount.toFixed(2)}
              </Text>
            </View>
            
            {paymentDetails.taxAmount > 0 && (
              <View style={styles.paymentInfoRow}>
                <Text style={styles.paymentInfoLabel}>Tax:</Text>
                <Text style={styles.paymentInfoValue}>
                  {paymentDetails.currency} {paymentDetails.taxAmount.toFixed(2)}
                </Text>
              </View>
            )}
            
            <View style={[styles.paymentInfoRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                {paymentDetails.currency} {paymentDetails.totalAmount.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.paymentInfoRow}>
              <Text style={styles.paymentInfoLabel}>Reference:</Text>
              <Text style={styles.paymentInfoValue}>{paymentDetails.reference}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <AnimatedButton
              label="New Payment"
              onPress={resetPayment}
              variant="outline"
              size="medium"
              iconName="refresh"
              iconPosition="left"
              style={styles.actionButton}
            />
            
            <AnimatedButton
              label="Share QR"
              onPress={() => {
                // In a real app, implement sharing functionality
                Alert.alert("Share QR", "Sharing functionality would be implemented here.");
              }}
              variant="secondary"
              size="medium"
              iconName="share-variant"
              iconPosition="left"
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Payment</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScreenTransition 
          visible={screenVisible}
          transitionType="fade"
          duration={300}
        >
          {paymentGenerated ? renderQRCode() : renderInputForm()}
        </ScreenTransition>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray7,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray3,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    height: 56,
  },
  currencySymbol: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    height: 56,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray3,
    borderRadius: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    height: 50,
    fontSize: typography.fontSize.md,
    color: colors.gray9,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
  },
  currencySelector: {
    marginBottom: 16,
  },
  currencyOptions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  currencyOption: {
    borderWidth: 1,
    borderColor: colors.gray3,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: colors.white,
  },
  selectedCurrency: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
  },
  selectedCurrencyText: {
    color: colors.white,
  },
  summaryContainer: {
    backgroundColor: colors.gray1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
  },
  summaryValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray3,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  generateButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray9,
    marginBottom: 8,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
    marginBottom: 24,
    textAlign: 'center',
  },
  qrCodeWrapper: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPlaceholder: {
    backgroundColor: colors.gray1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfoContainer: {
    width: '100%',
    backgroundColor: colors.gray1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentInfoLabel: {
    fontSize: typography.fontSize.md,
    color: colors.gray7,
  },
  paymentInfoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.gray8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  actionButton: {
    marginHorizontal: 8,
    minWidth: 140,
  },
});

export default GeneratePaymentScreen;