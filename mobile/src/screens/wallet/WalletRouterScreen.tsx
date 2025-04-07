import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useWallet } from '../../hooks/useWallet';
import theme from '../../utils/theme';

// Import our role-specific wallet screens
import ParentWalletScreen from './ParentWalletScreen';
import ChildWalletScreen from './ChildWalletScreen';
import EmployerWalletScreen from './EmployerWalletScreen';
import EmployeeWalletScreen from './EmployeeWalletScreen';

/**
 * The WalletRouterScreen serves as the entry point to wallet functionality
 * It routes users to their appropriate wallet interface based on their role
 */
const WalletRouterScreen: React.FC = () => {
  const { 
    currentUser, 
    isLoading, 
    error, 
    refreshWalletData 
  } = useWallet();
  
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  
  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshWalletData();
    } finally {
      setRefreshing(false);
    }
  }, [refreshWalletData]);
  
  // Display loading state
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your wallet...</Text>
      </SafeAreaView>
    );
  }
  
  // Display error state
  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Icon 
          name="alert-circle-outline" 
          size={64} 
          color={theme.colors.error} 
        />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={refreshWalletData}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </SafeAreaView>
    );
  }
  
  // Display no user state
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.noUserContainer}>
        <Icon 
          name="account-alert-outline" 
          size={64} 
          color={theme.colors.warning} 
        />
        <Text style={styles.noUserTitle}>Account Required</Text>
        <Text style={styles.noUserMessage}>
          Please log in or create an account to access your digital wallet.
        </Text>
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Login' as never)}
            style={styles.loginButton}
          >
            Log In
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => navigation.navigate('Signup' as never)}
            style={styles.signupButton}
          >
            Sign Up
          </Button>
        </View>
      </SafeAreaView>
    );
  }
  
  // Route to the appropriate wallet screen based on user role
  const renderWalletByRole = () => {
    switch (currentUser.role) {
      case 'parent':
        return <ParentWalletScreen onRefresh={onRefresh} refreshing={refreshing} />;
        
      case 'child':
        return <ChildWalletScreen onRefresh={onRefresh} refreshing={refreshing} />;
        
      case 'employer':
        return <EmployerWalletScreen onRefresh={onRefresh} refreshing={refreshing} />;
        
      case 'employee':
        return <EmployeeWalletScreen onRefresh={onRefresh} refreshing={refreshing} />;
        
      default:
        // Fallback to parent wallet if role is not recognized
        return <ParentWalletScreen onRefresh={onRefresh} refreshing={refreshing} />;
    }
  };
  
  return renderWalletByRole();
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundPrimary,
  },
  loadingText: {
    marginTop: theme.spacing[4],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundPrimary,
    paddingHorizontal: theme.spacing[6],
  },
  errorTitle: {
    marginTop: theme.spacing[4],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
    textAlign: 'center',
  },
  errorMessage: {
    marginTop: theme.spacing[2],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  retryButton: {
    minWidth: 150,
    backgroundColor: theme.colors.primary,
  },
  noUserContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundPrimary,
    paddingHorizontal: theme.spacing[6],
  },
  noUserTitle: {
    marginTop: theme.spacing[4],
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textDark,
    textAlign: 'center',
  },
  noUserMessage: {
    marginTop: theme.spacing[2],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  loginButton: {
    minWidth: 120,
    marginRight: theme.spacing[2],
    backgroundColor: theme.colors.primary,
  },
  signupButton: {
    minWidth: 120,
    marginLeft: theme.spacing[2],
    borderColor: theme.colors.primary,
  },
});

export default WalletRouterScreen;