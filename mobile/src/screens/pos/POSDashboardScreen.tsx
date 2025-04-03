import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Avatar, Chip, FAB, Divider, Badge } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Sample data for demonstration
const sampleCategories = [
  { id: 1, name: 'Appetizers', icon: 'food' },
  { id: 2, name: 'Main Courses', icon: 'food-steak' },
  { id: 3, name: 'Desserts', icon: 'cake' },
  { id: 4, name: 'Drinks', icon: 'glass-cocktail' },
  { id: 5, name: 'Specials', icon: 'star' },
];

const sampleMenuItems = [
  { id: 1, name: 'Garlic Bread', price: 5.99, category: 1, image: 'bread-slice' },
  { id: 2, name: 'Mozzarella Sticks', price: 7.99, category: 1, image: 'food' },
  { id: 3, name: 'Grilled Salmon', price: 19.99, category: 2, image: 'fish' },
  { id: 4, name: 'Ribeye Steak', price: 24.99, category: 2, image: 'food-steak' },
  { id: 5, name: 'Chocolate Cake', price: 6.99, category: 3, image: 'cake' },
  { id: 6, name: 'Craft Beer', price: 6.99, category: 4, image: 'beer' },
  { id: 7, name: 'Chef Special', price: 29.99, category: 5, image: 'star' },
];

const sampleTables = [
  { id: 1, name: 'Table 1', status: 'occupied', customers: 4, timeSeated: '18:30' },
  { id: 2, name: 'Table 2', status: 'available', customers: 0, timeSeated: '' },
  { id: 3, name: 'Table 3', status: 'occupied', customers: 2, timeSeated: '19:15' },
  { id: 4, name: 'Table 4', status: 'reserved', customers: 0, timeSeated: '20:00' },
  { id: 5, name: 'Table 5', status: 'available', customers: 0, timeSeated: '' },
  { id: 6, name: 'Table 6', status: 'occupied', customers: 6, timeSeated: '18:45' },
];

const POSDashboardScreen = () => {
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState(1);
  const [cart, setCart] = useState<any[]>([]);
  const [activeTable, setActiveTable] = useState<number | null>(null);

  // Filter menu items by active category
  const filteredMenuItems = sampleMenuItems.filter(item => item.category === activeCategory);

  // Add item to cart
  const addToCart = (item: any) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Item already in cart, increase quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId: number) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === itemId);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      if (updatedCart[existingItemIndex].quantity > 1) {
        // Decrease quantity
        updatedCart[existingItemIndex].quantity -= 1;
      } else {
        // Remove item
        updatedCart.splice(existingItemIndex, 1);
      }
      setCart(updatedCart);
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Go to checkout
  const goToCheckout = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('POSCheckout', { cart, tableId: activeTable });
  };

  // Navigate to inventory screen
  const goToInventory = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('POSInventory');
  };

  // Navigate to staff screen
  const goToStaff = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('POSStaff');
  };

  // Select table
  const selectTable = (tableId: number) => {
    setActiveTable(tableId);
  };

  // Render status badge for table
  const renderTableStatus = (status: string) => {
    let color;
    switch (status) {
      case 'occupied':
        color = theme.colors.error;
        break;
      case 'available':
        color = 'green';
        break;
      case 'reserved':
        color = theme.colors.notification;
        break;
      default:
        color = theme.colors.disabled;
    }
    
    return (
      <Badge style={[styles.tableBadge, { backgroundColor: color }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.leftPanel}>
          {/* Tables Section */}
          <Card style={styles.tablesCard}>
            <Card.Title title="Tables" />
            <Card.Content>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tablesContainer}>
                  {sampleTables.map(table => (
                    <TouchableOpacity
                      key={table.id}
                      onPress={() => selectTable(table.id)}
                      style={[
                        styles.tableButton,
                        activeTable === table.id && styles.activeTableButton
                      ]}
                    >
                      <Text style={styles.tableName}>{table.name}</Text>
                      {renderTableStatus(table.status)}
                      {table.status === 'occupied' && (
                        <Text style={styles.tableDetails}>
                          {table.customers} guests - {table.timeSeated}
                        </Text>
                      )}
                      {table.status === 'reserved' && (
                        <Text style={styles.tableDetails}>
                          Reserved for {table.timeSeated}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>
          
          {/* Categories Section */}
          <Card style={styles.categoriesCard}>
            <Card.Title title="Menu Categories" />
            <Card.Content>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriesContainer}>
                  {sampleCategories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setActiveCategory(category.id)}
                      style={[
                        styles.categoryButton,
                        activeCategory === category.id && styles.activeCategoryButton
                      ]}
                    >
                      <Icon name={category.icon} size={24} color={activeCategory === category.id ? 'white' : theme.colors.primary} />
                      <Text style={[
                        styles.categoryText,
                        activeCategory === category.id && styles.activeCategoryText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>

          {/* Menu Items Section */}
          <Card style={styles.menuItemsCard}>
            <Card.Title title={sampleCategories.find(cat => cat.id === activeCategory)?.name || 'Menu Items'} />
            <Card.Content>
              <FlatList
                data={filteredMenuItems}
                numColumns={2}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.menuItemButton}
                    onPress={() => addToCart(item)}
                  >
                    <View style={styles.menuItem}>
                      <Icon name={item.image} size={40} color={theme.colors.primary} />
                      <Text style={styles.menuItemName}>{item.name}</Text>
                      <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id.toString()}
              />
            </Card.Content>
          </Card>
        </View>

        {/* Right Panel - Cart */}
        <View style={styles.rightPanel}>
          <Card style={styles.cartCard}>
            <Card.Title 
              title={activeTable ? `Order for ${sampleTables.find(t => t.id === activeTable)?.name}` : "Current Order"} 
              subtitle={activeTable && sampleTables.find(t => t.id === activeTable)?.status === 'occupied' ? "Table Occupied" : ""}
            />
            <Card.Content>
              {cart.length === 0 ? (
                <View style={styles.emptyCart}>
                  <Icon name="cart-outline" size={50} color={theme.colors.disabled} />
                  <Text style={styles.emptyCartText}>Your cart is empty</Text>
                  <Text style={styles.emptyCartSubtext}>Add items from the menu</Text>
                </View>
              ) : (
                <>
                  <FlatList
                    data={cart}
                    renderItem={({ item }) => (
                      <View style={styles.cartItem}>
                        <View style={styles.cartItemDetails}>
                          <Text style={styles.cartItemName}>{item.name}</Text>
                          <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                        <View style={styles.cartItemQuantity}>
                          <Button
                            mode="text"
                            compact
                            onPress={() => removeFromCart(item.id)}
                          >
                            -
                          </Button>
                          <Text>{item.quantity}</Text>
                          <Button
                            mode="text"
                            compact
                            onPress={() => addToCart(item)}
                          >
                            +
                          </Button>
                        </View>
                      </View>
                    )}
                    keyExtractor={item => item.id.toString()}
                  />
                  <Divider style={styles.divider} />
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalText}>Total:</Text>
                    <Text style={styles.totalAmount}>${calculateTotal()}</Text>
                  </View>
                </>
              )}
            </Card.Content>
            <Card.Actions style={styles.cartActions}>
              <Button
                mode="contained"
                onPress={goToCheckout}
                disabled={cart.length === 0 || !activeTable}
                style={styles.checkoutButton}
              >
                Checkout
              </Button>
              <Button
                mode="outlined"
                onPress={() => setCart([])}
                disabled={cart.length === 0}
              >
                Clear
              </Button>
            </Card.Actions>
          </Card>
        </View>
      </View>

      {/* Action Buttons */}
      <FAB.Group
        open={false}
        icon="plus"
        actions={[
          {
            icon: 'food-variant',
            label: 'Inventory',
            onPress: goToInventory,
          },
          {
            icon: 'account-group',
            label: 'Staff',
            onPress: goToStaff,
          },
          {
            icon: 'cog',
            label: 'Settings',
            onPress: () => navigation.navigate('POSSettings'),
          },
        ]}
        onStateChange={() => {}}
        fabStyle={{ backgroundColor: theme.colors.primary }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 2,
    padding: 10,
  },
  rightPanel: {
    flex: 1,
    padding: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  tablesCard: {
    marginBottom: 10,
  },
  tablesContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  tableButton: {
    width: 120,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginRight: 10,
    padding: 10,
    justifyContent: 'center',
  },
  activeTableButton: {
    backgroundColor: theme.colors.primary + '20', // primary color with opacity
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  tableName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tableDetails: {
    fontSize: 12,
    color: theme.colors.text,
  },
  tableBadge: {
    alignSelf: 'flex-start',
    fontSize: 10,
    marginBottom: 5,
  },
  categoriesCard: {
    marginBottom: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    marginLeft: 5,
    color: theme.colors.text,
  },
  activeCategoryText: {
    color: 'white',
  },
  menuItemsCard: {
    flex: 1,
  },
  menuItemButton: {
    flex: 1,
    margin: 5,
    maxWidth: '48%',
  },
  menuItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  menuItemName: {
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  menuItemPrice: {
    color: theme.colors.primary,
    marginTop: 5,
  },
  cartCard: {
    flex: 1,
  },
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyCartText: {
    fontSize: 18,
    marginTop: 10,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: theme.colors.text,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontWeight: 'bold',
  },
  cartItemPrice: {
    color: theme.colors.primary,
  },
  cartItemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginVertical: 15,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  cartActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  checkoutButton: {
    flex: 1,
    marginRight: 10,
  },
});

export default POSDashboardScreen;