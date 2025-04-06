import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, useTheme } from 'react-native-paper';
import { colors, walletColorSchemes } from '../utils/theme';
import { WalletProvider } from '../hooks/useWallet';

// Import screens
// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

// Wallet screens
import TransactionDetailsScreen from '../screens/wallet/TransactionDetailsScreen';
import SendMoneyScreen from '../screens/wallet/SendMoneyScreen';
import RequestMoneyScreen from '../screens/wallet/RequestMoneyScreen';
import ScanQRScreen from '../screens/wallet/ScanQRScreen';
import AddPaymentMethodScreen from '../screens/wallet/AddPaymentMethodScreen';
import AddChildScreen from '../screens/wallet/AddChildScreen';
import AddEmployeeScreen from '../screens/wallet/AddEmployeeScreen';
import PayrollDetailsScreen from '../screens/wallet/PayrollDetailsScreen';
import RunPayrollScreen from '../screens/wallet/RunPayrollScreen';
import PayslipDetailsScreen from '../screens/wallet/PayslipDetailsScreen';
import BenefitDetailsScreen from '../screens/wallet/BenefitDetailsScreen';
import CreateExpenseReportScreen from '../screens/wallet/CreateExpenseReportScreen';
import SubmitTimeEntryScreen from '../screens/wallet/SubmitTimeEntryScreen';
import RequestTimeOffScreen from '../screens/wallet/RequestTimeOffScreen';
import AddTaskScreen from '../screens/wallet/AddTaskScreen';
import TaskDetailsScreen from '../screens/wallet/TaskDetailsScreen';
import AddSavingsGoalScreen from '../screens/wallet/AddSavingsGoalScreen';
import SavingsGoalDetailsScreen from '../screens/wallet/SavingsGoalDetailsScreen';
import EmployeeDetailsScreen from '../screens/wallet/EmployeeDetailsScreen';

// Role-specific wallet screens
import ParentWalletScreen from '../screens/wallet/ParentWalletScreen';
import ChildWalletScreen from '../screens/wallet/ChildWalletScreen';
import EmployerWalletScreen from '../screens/wallet/EmployerWalletScreen';
import EmployeeWalletScreen from '../screens/wallet/EmployeeWalletScreen';
import WalletRouterScreen from '../screens/wallet/WalletRouterScreen';

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Define your navigation theme
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
  },
};

// Authentication stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
);

// Wallet stack
const WalletStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={{ marginLeft: 10 }}
            >
              <Icon name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          ) : null,
      })}
    >
      <Stack.Screen 
        name="WalletRouter" 
        component={WalletRouterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ParentWalletScreen" 
        component={ParentWalletScreen}
        options={{ title: "Parent Wallet", headerShown: false }}
      />
      <Stack.Screen 
        name="ChildWalletScreen" 
        component={ChildWalletScreen}
        options={{ title: "Child Wallet", headerShown: false }}
      />
      <Stack.Screen 
        name="EmployerWalletScreen" 
        component={EmployerWalletScreen}
        options={{ title: "Employer Wallet", headerShown: false }}
      />
      <Stack.Screen 
        name="EmployeeWalletScreen" 
        component={EmployeeWalletScreen}
        options={{ title: "Employee Wallet", headerShown: false }}
      />
      <Stack.Screen 
        name="TransactionDetails" 
        component={TransactionDetailsScreen}
        options={{ title: "Transaction Details" }}
      />
      <Stack.Screen 
        name="SendMoney" 
        component={SendMoneyScreen}
        options={{ title: "Send Money" }}
      />
      <Stack.Screen 
        name="RequestMoney" 
        component={RequestMoneyScreen}
        options={{ title: "Request Money" }}
      />
      <Stack.Screen 
        name="ScanQR" 
        component={ScanQRScreen}
        options={{ title: "Scan QR Code" }}
      />
      <Stack.Screen 
        name="AddPaymentMethod" 
        component={AddPaymentMethodScreen}
        options={{ title: "Add Payment Method" }}
      />
      <Stack.Screen 
        name="AddChild" 
        component={AddChildScreen}
        options={{ title: "Add Child" }}
      />
      <Stack.Screen 
        name="AddEmployee" 
        component={AddEmployeeScreen}
        options={{ title: "Add Employee" }}
      />
      <Stack.Screen 
        name="PayrollDetails" 
        component={PayrollDetailsScreen}
        options={{ title: "Payroll Details" }}
      />
      <Stack.Screen 
        name="RunPayroll" 
        component={RunPayrollScreen}
        options={{ title: "Run Payroll" }}
      />
      <Stack.Screen 
        name="PayslipDetails" 
        component={PayslipDetailsScreen}
        options={{ title: "Payslip Details" }}
      />
      <Stack.Screen 
        name="BenefitDetails" 
        component={BenefitDetailsScreen}
        options={{ title: "Benefit Details" }}
      />
      <Stack.Screen 
        name="CreateExpenseReport" 
        component={CreateExpenseReportScreen}
        options={{ title: "Create Expense Report" }}
      />
      <Stack.Screen 
        name="SubmitTimeEntry" 
        component={SubmitTimeEntryScreen}
        options={{ title: "Submit Time Entry" }}
      />
      <Stack.Screen 
        name="RequestTimeOff" 
        component={RequestTimeOffScreen}
        options={{ title: "Request Time Off" }}
      />
      <Stack.Screen 
        name="AddTask" 
        component={AddTaskScreen}
        options={{ title: "Add Task" }}
      />
      <Stack.Screen 
        name="TaskDetails" 
        component={TaskDetailsScreen}
        options={{ title: "Task Details" }}
      />
      <Stack.Screen 
        name="AddSavingsGoal" 
        component={AddSavingsGoalScreen}
        options={{ title: "Add Savings Goal" }}
      />
      <Stack.Screen 
        name="SavingsGoalDetails" 
        component={SavingsGoalDetailsScreen}
        options={{ title: "Savings Goal Details" }}
      />
      <Stack.Screen 
        name="EmployeeDetails" 
        component={EmployeeDetailsScreen}
        options={{ title: "Employee Details" }}
      />
    </Stack.Navigator>
  );
};

// Home stack
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// Profile stack
const ProfileStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
  </Stack.Navigator>
);

// Bottom tab navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Wallet') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'Notifications') {
          iconName = focused ? 'bell' : 'bell-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'account' : 'account-outline';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarLabel: ({ focused, color }) => {
        return (
          <Text
            style={{
              fontSize: 12,
              color,
              marginBottom: Platform.OS === 'ios' ? 0 : 5,
            }}
          >
            {route.name}
          </Text>
        );
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
    <Tab.Screen name="Wallet" component={WalletStack} options={{ headerShown: false }} />
    <Tab.Screen name="Notifications" component={NotificationsScreen} />
    <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
  </Tab.Navigator>
);

// Main app navigator
const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.error('Error checking authentication', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    // Show loading screen
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <WalletProvider>
        {isAuthenticated ? <TabNavigator /> : <AuthStack />}
      </WalletProvider>
    </NavigationContainer>
  );
};

export default AppNavigator;