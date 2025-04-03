import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Card, Text, Button, IconButton, Searchbar, Chip, Divider, FAB, Modal, Portal, Provider, TextInput, List, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Sample inventory data
const initialInventory = [
  { id: 1, name: "Ground Beef", category: "Meat", supplier: "Premium Meats", quantity: 15, unit: "lb", price: 4.99, lowStock: 5, sku: "MB001", lastOrdered: "2025-03-25" },
  { id: 2, name: "Burger Buns", category: "Bakery", supplier: "Local Bakery", quantity: 45, unit: "pc", price: 0.49, lowStock: 20, sku: "BB001", lastOrdered: "2025-03-27" },
  { id: 3, name: "Cheddar Cheese", category: "Dairy", supplier: "Dairy Farms", quantity: 8, unit: "lb", price: 3.99, lowStock: 4, sku: "CC001", lastOrdered: "2025-03-26" },
  { id: 4, name: "Lettuce", category: "Produce", supplier: "Fresh Produce Inc", quantity: 10, unit: "head", price: 1.99, lowStock: 3, sku: "LT001", lastOrdered: "2025-03-28" },
  { id: 5, name: "Tomatoes", category: "Produce", supplier: "Fresh Produce Inc", quantity: 25, unit: "lb", price: 2.49, lowStock: 10, sku: "TM001", lastOrdered: "2025-03-28" },
  { id: 6, name: "French Fries", category: "Frozen", supplier: "Frozen Foods Co", quantity: 50, unit: "lb", price: 1.99, lowStock: 15, sku: "FF001", lastOrdered: "2025-03-20" },
  { id: 7, name: "Ketchup", category: "Condiments", supplier: "Food Supplies", quantity: 12, unit: "bottle", price: 3.49, lowStock: 5, sku: "KT001", lastOrdered: "2025-03-15" },
  { id: 8, name: "Mayo", category: "Condiments", supplier: "Food Supplies", quantity: 8, unit: "bottle", price: 4.29, lowStock: 3, sku: "MY001", lastOrdered: "2025-03-15" },
  { id: 9, name: "Soda Syrup (Cola)", category: "Beverages", supplier: "Beverage Distributors", quantity: 4, unit: "box", price: 65.99, lowStock: 2, sku: "SS001", lastOrdered: "2025-03-10" },
  { id: 10, name: "Chicken Breasts", category: "Meat", supplier: "Premium Meats", quantity: 18, unit: "lb", price: 3.99, lowStock: 7, sku: "CB001", lastOrdered: "2025-03-25" }
];

// Filter categories based on the inventory data
const getCategories = (inventory) => {
  const categories = new Set(inventory.map(item => item.category));
  return Array.from(categories);
};

// Supplier list based on the inventory data
const getSuppliers = (inventory) => {
  const suppliers = new Set(inventory.map(item => item.supplier));
  return Array.from(suppliers);
};

const POSInventoryScreen = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showLowStock, setShowLowStock] = useState(false);
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editableItem, setEditableItem] = useState({
    name: '',
    category: '',
    supplier: '',
    quantity: '',
    unit: '',
    price: '',
    lowStock: '',
    sku: '',
  });
  
  const categories = ['All', ...getCategories(inventory)];
  const suppliers = getSuppliers(inventory);

  // Handle search
  const onChangeSearch = (query) => setSearchQuery(query);
  
  // Filter inventory based on search query, category and low stock
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesLowStock = showLowStock ? item.quantity <= item.lowStock : true;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Open item details modal
  const openItemDetails = (item) => {
    setCurrentItem(item);
    setIsItemModalVisible(true);
  };

  // Open order modal for a specific item
  const openOrderModal = (item) => {
    setCurrentItem(item);
    setEditableItem({
      ...item,
      orderQuantity: '1', // Default order quantity
    });
    setIsOrderModalVisible(true);
  };

  // Open new item form
  const openNewItemForm = () => {
    setCurrentItem(null);
    setEditableItem({
      name: '',
      category: '',
      supplier: '',
      quantity: '',
      unit: '',
      price: '',
      lowStock: '',
      sku: '',
    });
    setIsItemModalVisible(true);
  };

  // Update existing item or add new item
  const saveItem = () => {
    // Basic validation
    if (!editableItem.name || !editableItem.category || !editableItem.quantity) {
      // Show validation error
      return;
    }
    
    // Convert string inputs to appropriate types
    const processedItem = {
      ...editableItem,
      quantity: parseInt(editableItem.quantity),
      price: parseFloat(editableItem.price),
      lowStock: parseInt(editableItem.lowStock),
    };
    
    if (currentItem) {
      // Update existing item
      setInventory(prev => 
        prev.map(item => item.id === currentItem.id ? {...processedItem, id: item.id} : item)
      );
    } else {
      // Add new item with a new ID
      const newId = Math.max(...inventory.map(item => item.id)) + 1;
      const newItem = {
        ...processedItem,
        id: newId,
        lastOrdered: new Date().toISOString().split('T')[0],
      };
      setInventory(prev => [...prev, newItem]);
    }
    
    setIsItemModalVisible(false);
  };

  // Place order for an item
  const placeOrder = () => {
    if (!editableItem.orderQuantity || parseInt(editableItem.orderQuantity) <= 0) {
      // Show validation error
      return;
    }
    
    // Update item quantity and last ordered date
    const orderQuantity = parseInt(editableItem.orderQuantity);
    setInventory(prev => 
      prev.map(item => {
        if (item.id === currentItem.id) {
          return {
            ...item,
            quantity: item.quantity + orderQuantity,
            lastOrdered: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );
    
    setIsOrderModalVisible(false);
  };

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Inventory Management</Text>
        </View>
        
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search inventory..."
            onChangeText={onChangeSearch}
            value={searchQuery}
            style={styles.searchBar}
          />
          
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={styles.filterChip}
                  selectedColor={theme.colors.primary}
                >
                  {category}
                </Chip>
              ))}
            </ScrollView>
            
            <View style={styles.switchContainer}>
              <Text>Low Stock Only</Text>
              <Switch
                value={showLowStock}
                onValueChange={setShowLowStock}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </View>
        
        <FlatList
          data={filteredInventory}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={[
              styles.itemCard,
              item.quantity <= item.lowStock && styles.lowStockCard
            ]} onPress={() => openItemDetails(item)}>
              <Card.Content style={styles.itemContent}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemCategory}>{item.category} • {item.supplier}</Text>
                    
                    <View style={styles.stockRow}>
                      <Text>Stock: </Text>
                      <Text style={[
                        styles.stockText,
                        item.quantity <= item.lowStock && styles.lowStock
                      ]}>
                        {item.quantity} {item.unit}
                        {item.quantity <= item.lowStock && " (Low)"}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.itemActions}>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)}/{item.unit}</Text>
                  <Button
                    mode="contained"
                    compact
                    style={styles.orderButton}
                    onPress={() => openOrderModal(item)}
                  >
                    Order
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="package-variant" size={60} color={theme.colors.disabled} />
              <Text style={styles.emptyStateText}>No items found</Text>
              <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
            </View>
          }
        />
        
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={openNewItemForm}
        />
        
        {/* Item Details/Edit Modal */}
        <Portal>
          <Modal
            visible={isItemModalVisible}
            onDismiss={() => setIsItemModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <ScrollView>
              <Text style={styles.modalTitle}>
                {currentItem ? 'Edit Item' : 'Add New Item'}
              </Text>
              
              <TextInput
                label="Item Name *"
                value={editableItem.name}
                onChangeText={(text) => setEditableItem({...editableItem, name: text})}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Category *"
                value={editableItem.category}
                onChangeText={(text) => setEditableItem({...editableItem, category: text})}
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Supplier *"
                value={editableItem.supplier}
                onChangeText={(text) => setEditableItem({...editableItem, supplier: text})}
                mode="outlined"
                style={styles.input}
              />
              
              <View style={styles.rowInputs}>
                <TextInput
                  label="Quantity *"
                  value={editableItem.quantity?.toString()}
                  onChangeText={(text) => setEditableItem({...editableItem, quantity: text})}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
                
                <TextInput
                  label="Unit *"
                  value={editableItem.unit}
                  onChangeText={(text) => setEditableItem({...editableItem, unit: text})}
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>
              
              <View style={styles.rowInputs}>
                <TextInput
                  label="Price *"
                  value={editableItem.price?.toString()}
                  onChangeText={(text) => setEditableItem({...editableItem, price: text})}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                  left={<TextInput.Affix text="$" />}
                />
                
                <TextInput
                  label="Low Stock Alert"
                  value={editableItem.lowStock?.toString()}
                  onChangeText={(text) => setEditableItem({...editableItem, lowStock: text})}
                  keyboardType="numeric"
                  mode="outlined"
                  style={[styles.input, styles.halfInput]}
                />
              </View>
              
              <TextInput
                label="SKU"
                value={editableItem.sku}
                onChangeText={(text) => setEditableItem({...editableItem, sku: text})}
                mode="outlined"
                style={styles.input}
              />
            </ScrollView>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setIsItemModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={saveItem}
                style={styles.modalButton}
              >
                Save
              </Button>
            </View>
          </Modal>
        </Portal>
        
        {/* Order Modal */}
        <Portal>
          <Modal
            visible={isOrderModalVisible}
            onDismiss={() => setIsOrderModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Order {currentItem?.name}</Text>
            
            <List.Item
              title="Current Stock"
              description={`${currentItem?.quantity} ${currentItem?.unit}`}
              left={props => <List.Icon {...props} icon="package-variant" />}
            />
            
            <List.Item
              title="Supplier"
              description={currentItem?.supplier}
              left={props => <List.Icon {...props} icon="truck" />}
            />
            
            <Divider style={styles.divider} />
            
            <TextInput
              label="Order Quantity"
              value={editableItem.orderQuantity}
              onChangeText={(text) => setEditableItem({...editableItem, orderQuantity: text})}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              right={<TextInput.Affix text={currentItem?.unit} />}
            />
            
            <TextInput
              label="Notes"
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            
            <View style={styles.orderSummary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text>Item Price:</Text>
                <Text>{formatCurrency(currentItem?.price)} / {currentItem?.unit}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Order Quantity:</Text>
                <Text>{editableItem.orderQuantity || 0} {currentItem?.unit}</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalText}>Estimated Total:</Text>
                <Text style={styles.totalAmount}>
                  {formatCurrency((currentItem?.price || 0) * (parseInt(editableItem.orderQuantity) || 0))}
                </Text>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setIsOrderModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={placeOrder}
                style={styles.modalButton}
              >
                Place Order
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  searchContainer: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterChip: {
    marginRight: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCard: {
    margin: 8,
    marginHorizontal: 16,
  },
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMain: {
    flex: 1,
    paddingRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDetails: {
    marginTop: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stockText: {
    fontWeight: '500',
  },
  lowStock: {
    color: '#f44336',
  },
  itemActions: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  orderButton: {
    height: 36,
    paddingHorizontal: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  divider: {
    marginVertical: 12,
  },
  orderSummary: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalText: {
    fontWeight: 'bold',
  },
  totalAmount: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default POSInventoryScreen;