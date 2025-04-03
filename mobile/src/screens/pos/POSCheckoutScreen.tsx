import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Text, Button, IconButton, Divider, List, Surface, TextInput, Modal, Portal, Provider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Sample cart data
const initialCart = [
  { id: 1, name: 'Burger Deluxe', price: 12.99, quantity: 2, category: 'Entrees', modifiers: ['No onions'] },
  { id: 2, name: 'Caesar Salad', price: 8.99, quantity: 1, category: 'Starters', modifiers: ['Extra dressing'] },
  { id: 3, name: 'French Fries', price: 4.99, quantity: 1, category: 'Sides', modifiers: [] },
  { id: 4, name: 'Soda', price: 2.99, quantity: 2, category: 'Beverages', modifiers: ['No ice'] },
];

// Payment methods
const paymentMethods = [
  { id: 'card', name: 'Credit Card', icon: 'credit-card' },
  { id: 'cash', name: 'Cash', icon: 'cash' },
  { id: 'wallet', name: 'Digital Wallet', icon: 'wallet' },
  { id: 'gift', name: 'Gift Card', icon: 'gift' },
];

// Tip options
const tipOptions = [
  { percent: 0, label: 'No Tip' },
  { percent: 0.15, label: '15%' },
  { percent: 0.18, label: '18%' },
  { percent: 0.20, label: '20%' },
  { percent: 0.25, label: '25%' },
  { percent: -1, label: 'Custom' }, // -1 indicates custom
];

const POSCheckoutScreen = () => {
  const navigation = useNavigation();
  const [cart, setCart] = useState(initialCart);
  const [tipPercent, setTipPercent] = useState(0.18); // Default 18% tip
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [customerNote, setCustomerNote] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customDiscountAmount, setCustomDiscountAmount] = useState('');
  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);
  const [isTipModalVisible, setIsTipModalVisible] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tipAmount = tipPercent === -1 
    ? parseFloat(customTipAmount) || 0 
    : subtotal * tipPercent;
  const discountAmount = discountPercent === -1 
    ? parseFloat(customDiscountAmount) || 0 
    : subtotal * discountPercent;
  const taxRate = 0.0825; // 8.25% tax rate
  const taxAmount = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + taxAmount + tipAmount;

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Update item quantity
  const updateQuantity = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(0, item.quantity + delta);
          if (newQuantity === 0) {
            return null; // Remove item if quantity is 0
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean); // Remove null items
    });
  };

  // Apply custom tip amount
  const applyCustomTip = () => {
    setIsTipModalVisible(false);
  };

  // Apply custom discount
  const applyDiscount = () => {
    setIsDiscountModalVisible(false);
  };

  // Process payment
  const processPayment = () => {
    setIsPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsPaymentProcessing(false);
      setPaymentComplete(true);
      
      // Navigate back to dashboard after successful payment
      setTimeout(() => {
        navigation.navigate('POSDashboard');
      }, 2000);
    }, 2000);
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon="close"
              size={24}
              onPress={() => navigation.goBack()}
            />
          </View>
        </View>
        
        <View style={styles.content}>
          {/* Left side - Cart items */}
          <View style={styles.cartContainer}>
            <Surface style={styles.cartHeader}>
              <Text style={styles.cartTitle}>Order Items</Text>
              <Button 
                mode="text" 
                onPress={() => {}} 
                icon="playlist-edit"
              >
                Edit Order
              </Button>
            </Surface>
            
            <FlatList
              data={cart}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Card style={styles.cartItem}>
                  <Card.Content style={styles.cartItemContent}>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.modifiers.length > 0 && (
                        <Text style={styles.itemModifiers}>
                          {item.modifiers.join(', ')}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.itemQuantity}>
                      <IconButton
                        icon="minus"
                        size={20}
                        onPress={() => updateQuantity(item.id, -1)}
                      />
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <IconButton
                        icon="plus"
                        size={20}
                        onPress={() => updateQuantity(item.id, 1)}
                      />
                    </View>
                    
                    <Text style={styles.itemPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </Text>
                  </Card.Content>
                </Card>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCart}>
                  <Icon name="cart-off" size={60} color={theme.colors.disabled} />
                  <Text style={styles.emptyCartText}>Cart is empty</Text>
                </View>
              }
            />
            
            <Card style={styles.notesCard}>
              <Card.Content>
                <Text style={styles.notesTitle}>Customer Notes</Text>
                <TextInput
                  value={customerNote}
                  onChangeText={setCustomerNote}
                  mode="outlined"
                  multiline
                  numberOfLines={3}
                  placeholder="Add special instructions or notes..."
                />
              </Card.Content>
            </Card>
          </View>
          
          {/* Right side - Payment summary */}
          <View style={styles.paymentContainer}>
            <Surface style={styles.paymentSummary}>
              <Text style={styles.paymentTitle}>Payment Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text>Subtotal</Text>
                <Text>{formatCurrency(subtotal)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryRowLeft}>
                  <Text>Discount</Text>
                  <Button 
                    mode="text" 
                    compact 
                    onPress={() => setIsDiscountModalVisible(true)}
                  >
                    Change
                  </Button>
                </View>
                <Text>
                  {discountAmount > 0 
                    ? `- ${formatCurrency(discountAmount)}` 
                    : formatCurrency(0)}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text>Tax ({(taxRate * 100).toFixed(2)}%)</Text>
                <Text>{formatCurrency(taxAmount)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryRowLeft}>
                  <Text>Tip</Text>
                  <Button 
                    mode="text" 
                    compact 
                    onPress={() => setIsTipModalVisible(true)}
                  >
                    Change
                  </Button>
                </View>
                <Text>{formatCurrency(tipAmount)}</Text>
              </View>
              
              <Divider style={styles.divider} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>Total</Text>
                <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
              </View>
            </Surface>
            
            <Text style={styles.paymentMethodsTitle}>Payment Method</Text>
            
            <View style={styles.paymentMethods}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                  ]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  <Icon 
                    name={method.icon} 
                    size={24} 
                    color={selectedPaymentMethod === method.id 
                      ? theme.colors.primary 
                      : theme.colors.text} 
                  />
                  <Text style={[
                    styles.paymentMethodText,
                    selectedPaymentMethod === method.id && { color: theme.colors.primary }
                  ]}>
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                style={styles.payButton}
                loading={isPaymentProcessing}
                disabled={cart.length === 0 || isPaymentProcessing || paymentComplete}
                onPress={processPayment}
              >
                {paymentComplete ? 'Payment Complete!' : 'Process Payment'}
              </Button>
            </View>
          </View>
        </View>
        
        {/* Modals */}
        <Portal>
          {/* Discount Modal */}
          <Modal
            visible={isDiscountModalVisible}
            onDismiss={() => setIsDiscountModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Apply Discount</Text>
            
            <View style={styles.discountOptions}>
              <TouchableOpacity
                style={[
                  styles.discountOption,
                  discountPercent === 0 && styles.selectedDiscountOption
                ]}
                onPress={() => setDiscountPercent(0)}
              >
                <Text>No Discount</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.discountOption,
                  discountPercent === 0.1 && styles.selectedDiscountOption
                ]}
                onPress={() => setDiscountPercent(0.1)}
              >
                <Text>10% Off</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.discountOption,
                  discountPercent === 0.15 && styles.selectedDiscountOption
                ]}
                onPress={() => setDiscountPercent(0.15)}
              >
                <Text>15% Off</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.discountOption,
                  discountPercent === 0.2 && styles.selectedDiscountOption
                ]}
                onPress={() => setDiscountPercent(0.2)}
              >
                <Text>20% Off</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.discountOption,
                  discountPercent === -1 && styles.selectedDiscountOption
                ]}
                onPress={() => setDiscountPercent(-1)}
              >
                <Text>Custom Amount</Text>
              </TouchableOpacity>
            </View>
            
            {discountPercent === -1 && (
              <TextInput
                label="Custom Discount Amount"
                value={customDiscountAmount}
                onChangeText={setCustomDiscountAmount}
                keyboardType="numeric"
                mode="outlined"
                style={styles.customInput}
                left={<TextInput.Affix text="$" />}
              />
            )}
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setIsDiscountModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={applyDiscount}
                style={styles.modalButton}
              >
                Apply
              </Button>
            </View>
          </Modal>
          
          {/* Tip Modal */}
          <Modal
            visible={isTipModalVisible}
            onDismiss={() => setIsTipModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Add Tip</Text>
            
            <View style={styles.tipOptions}>
              {tipOptions.map((option) => (
                <TouchableOpacity
                  key={option.percent}
                  style={[
                    styles.tipOption,
                    tipPercent === option.percent && styles.selectedTipOption
                  ]}
                  onPress={() => setTipPercent(option.percent)}
                >
                  <Text>{option.label}</Text>
                  {option.percent > 0 && (
                    <Text style={styles.tipAmount}>
                      {formatCurrency(subtotal * option.percent)}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {tipPercent === -1 && (
              <TextInput
                label="Custom Tip Amount"
                value={customTipAmount}
                onChangeText={setCustomTipAmount}
                keyboardType="numeric"
                mode="outlined"
                style={styles.customInput}
                left={<TextInput.Affix text="$" />}
              />
            )}
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setIsTipModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={applyCustomTip}
                style={styles.modalButton}
              >
                Apply
              </Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
    backgroundColor: theme.colors.surface,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  cartContainer: {
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    elevation: 2,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartItem: {
    marginHorizontal: 16,
    marginTop: 8,
    elevation: 1,
  },
  cartItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemModifiers: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  itemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  quantityText: {
    fontSize: 16,
    width: 30,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
    width: 80,
    textAlign: 'right',
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyCartText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.placeholder,
  },
  notesCard: {
    margin: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  paymentContainer: {
    flex: 1.5,
    padding: 16,
  },
  paymentSummary: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  paymentMethodsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  paymentMethodText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  payButton: {
    flex: 2,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  discountOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  discountOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedDiscountOption: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  tipOptions: {
    marginBottom: 16,
  },
  tipOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedTipOption: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  tipAmount: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  customInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default POSCheckoutScreen;