import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';

import { useWallet } from '../../hooks/useWallet';
import { colors, commonStyles } from '../../utils/theme';
import ParentWalletScreen from './ParentWalletScreen';
import ChildWalletScreen from './ChildWalletScreen';
import EmployerWalletScreen from './EmployerWalletScreen';
import EmployeeWalletScreen from './EmployeeWalletScreen';
import PersonalWalletScreen from './PersonalWalletScreen';
import BusinessWalletScreen from './BusinessWalletScreen';

type WalletStackParamList = {
  WalletRouter: undefined;
  ParentWallet: undefined;
  ChildWallet: undefined;
  EmployerWallet: undefined;
  EmployeeWallet: undefined;
  PersonalWallet: undefined;
  BusinessWallet: undefined;
  WalletSelection: undefined;
};

type WalletRouterScreenProps = {
  navigation: StackNavigationProp<WalletStackParamList, 'WalletRouter'>;
};

/**
 * WalletRouterScreen serves as the entry point to wallet functionality
 * and routes users to their appropriate wallet interface based on their role
 */
const WalletRouterScreen: React.FC<WalletRouterScreenProps> = ({ navigation }) => {
  const { isLoading, error, currentUser, userRoles, loadWalletData } = useWallet();
  const [selectedWalletType, setSelectedWalletType] = useState<string | null>(null);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  // Handle automatic role-based routing
  useEffect(() => {
    if (!isLoading && currentUser && userRoles.length > 0) {
      // If user has only one role, route them directly to the appropriate wallet
      if (userRoles.length === 1) {
        setSelectedWalletType(userRoles[0]);
      }
    }
  }, [isLoading, currentUser, userRoles]);

  // Handle selected wallet type change
  useEffect(() => {
    if (selectedWalletType) {
      switch (selectedWalletType) {
        case 'parent':
          navigation.navigate('ParentWallet');
          break;
        case 'child':
          navigation.navigate('ChildWallet');
          break;
        case 'employer':
          navigation.navigate('EmployerWallet');
          break;
        case 'employee':
          navigation.navigate('EmployeeWallet');
          break;
        case 'personal':
          navigation.navigate('PersonalWallet');
          break;
        case 'business':
          navigation.navigate('BusinessWallet');
          break;
        default:
          break;
      }
    }
  }, [selectedWalletType, navigation]);

  if (isLoading) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorText}>Error: {error.message}</Text>
          <Button 
            mode="contained" 
            onPress={() => loadWalletData()}
            style={styles.retryButton}
          >
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.messageText}>Please log in to access your wallet.</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Login' as any)}
            style={styles.actionButton}
          >
            Go to Login
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (userRoles.length === 0) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.messageText}>You don't have any wallet accounts yet.</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('CreateWallet' as any)}
            style={styles.actionButton}
          >
            Create a Wallet
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // If user has multiple roles, show wallet selection screen
  if (userRoles.length > 1 && !selectedWalletType) {
    navigation.navigate('WalletSelection');
    return null;
  }

  // This should not be reached if navigation works correctly, but provide a fallback
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.messageText}>Preparing your wallet...</Text>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 16,
  },
  messageText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
  },
  actionButton: {
    backgroundColor: colors.primary,
  },
});

export default WalletRouterScreen;