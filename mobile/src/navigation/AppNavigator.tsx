import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// POS Screens
import POSDashboardScreen from '../screens/pos/POSDashboardScreen';
import POSCheckoutScreen from '../screens/pos/POSCheckoutScreen';
import POSInventoryScreen from '../screens/pos/POSInventoryScreen';
import POSStaffScreen from '../screens/pos/POSStaffScreen';
import POSSettingsScreen from '../screens/pos/POSSettingsScreen';

// Wallet Screens
import WalletDashboardScreen from '../screens/wallet/WalletDashboardScreen';
import WalletTransactionsScreen from '../screens/wallet/WalletTransactionsScreen';
import WalletCardsScreen from '../screens/wallet/WalletCardsScreen';
import WalletAddCardScreen from '../screens/wallet/WalletAddCardScreen';
import WalletSettingsScreen from '../screens/wallet/WalletSettingsScreen';
import ParentWalletScreen from '../screens/wallet/ParentWalletScreen';
import ChildWalletScreen from '../screens/wallet/ChildWalletScreen';
import EmployerWalletScreen from '../screens/wallet/EmployerWalletScreen';
import EmployeeWalletScreen from '../screens/wallet/EmployeeWalletScreen';

// Other Screens
import ProfileScreen from '../screens/common/ProfileScreen';
import SettingsScreen from '../screens/common/SettingsScreen';

// Stacks
const AuthStack = createNativeStackNavigator();
const POSStack = createNativeStackNavigator();
const WalletStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

// Tabs
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// POS Stack Navigator
const POSNavigator = () => (
  <POSStack.Navigator>
    <POSStack.Screen name="POSDashboard" component={POSDashboardScreen} options={{ title: 'BistroBeast POS' }} />
    <POSStack.Screen name="POSCheckout" component={POSCheckoutScreen} options={{ title: 'Checkout' }} />
    <POSStack.Screen name="POSInventory" component={POSInventoryScreen} options={{ title: 'Inventory' }} />
    <POSStack.Screen name="POSStaff" component={POSStaffScreen} options={{ title: 'Staff Management' }} />
    <POSStack.Screen name="POSSettings" component={POSSettingsScreen} options={{ title: 'POS Settings' }} />
  </POSStack.Navigator>
);

// Wallet Stack Navigator
const WalletNavigator = () => (
  <WalletStack.Navigator>
    <WalletStack.Screen name="WalletDashboard" component={WalletDashboardScreen} options={{ title: 'PaySurity Wallet' }} />
    <WalletStack.Screen name="WalletTransactions" component={WalletTransactionsScreen} options={{ title: 'Transactions' }} />
    <WalletStack.Screen name="WalletCards" component={WalletCardsScreen} options={{ title: 'Payment Methods' }} />
    <WalletStack.Screen name="WalletAddCard" component={WalletAddCardScreen} options={{ title: 'Add Payment Method' }} />
    <WalletStack.Screen name="WalletSettings" component={WalletSettingsScreen} options={{ title: 'Wallet Settings' }} />
    
    {/* User Role-specific Wallet Screens */}
    <WalletStack.Screen name="ParentWallet" component={ParentWalletScreen} options={{ title: 'Family Wallet' }} />
    <WalletStack.Screen name="ChildWallet" component={ChildWalletScreen} options={{ title: 'My Wallet' }} />
    <WalletStack.Screen name="EmployerWallet" component={EmployerWalletScreen} options={{ title: 'Company Wallet' }} />
    <WalletStack.Screen name="EmployeeWallet" component={EmployeeWalletScreen} options={{ title: 'Employee Wallet' }} />
    
    {/* Additional Screens for Parent Wallet */}
    <WalletStack.Screen name="AddChild" component={WalletAddCardScreen} options={{ title: 'Add Child' }} />
    <WalletStack.Screen name="ChildSettings" component={WalletSettingsScreen} options={{ title: 'Child Settings' }} />
    <WalletStack.Screen name="TransferFunds" component={WalletTransactionsScreen} options={{ title: 'Transfer Funds' }} />
    <WalletStack.Screen name="SavingsGoals" component={WalletTransactionsScreen} options={{ title: 'Savings Goals' }} />
    <WalletStack.Screen name="AddSavingsGoal" component={WalletTransactionsScreen} options={{ title: 'Add Savings Goal' }} />
    
    {/* Additional Screens for Employer/Employee Wallet */}
    <WalletStack.Screen name="Payroll" component={WalletTransactionsScreen} options={{ title: 'Payroll Management' }} />
    <WalletStack.Screen name="TimeTracking" component={WalletTransactionsScreen} options={{ title: 'Time Tracking' }} />
    <WalletStack.Screen name="RequestTimeOff" component={WalletTransactionsScreen} options={{ title: 'Request Time Off' }} />
    <WalletStack.Screen name="AddEmployee" component={WalletAddCardScreen} options={{ title: 'Add Employee' }} />
    <WalletStack.Screen name="EmployeeProfile" component={WalletSettingsScreen} options={{ title: 'Employee Profile' }} />
    <WalletStack.Screen name="PayrollDetails" component={WalletTransactionsScreen} options={{ title: 'Payroll Details' }} />
    <WalletStack.Screen name="PaycheckSettings" component={WalletSettingsScreen} options={{ title: 'Paycheck Settings' }} />
    <WalletStack.Screen name="TaxDocuments" component={WalletTransactionsScreen} options={{ title: 'Tax Documents' }} />
  </WalletStack.Navigator>
);

// Settings Stack Navigator
const ProfileNavigator = () => (
  <SettingsStack.Navigator>
    <SettingsStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    <SettingsStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'App Settings' }} />
  </SettingsStack.Navigator>
);

// Main App Navigator with Authentication Logic
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen if auth state is being determined
  if (isLoading) {
    return null; // Or a loading component
  }

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Main App tabs when authenticated
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'POS') {
            iconName = focused ? 'point-of-sale' : 'point-of-sale';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account-circle' : 'account-circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="POS" 
        component={POSNavigator} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'BistroBeast'
        }} 
      />
      <Tab.Screen 
        name="Wallet" 
        component={WalletNavigator} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Wallet'
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileNavigator} 
        options={{ 
          headerShown: false,
          tabBarLabel: 'Profile'
        }} 
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;