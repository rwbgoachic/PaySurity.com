import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import useWallet from '../../hooks/useWallet';
import { colors, spacing, shadows, walletColorSchemes } from '../../utils/theme';

import ParentWalletScreen from './ParentWalletScreen';
import ChildWalletScreen from './ChildWalletScreen';
import EmployerWalletScreen from './EmployerWalletScreen';
import EmployeeWalletScreen from './EmployeeWalletScreen';

/**
 * WalletRouterScreen
 * 
 * This component routes the user to the appropriate wallet screen based on their role:
 * - Parent: For family head accounts managing children's wallets
 * - Child: For dependent accounts connected to a parent wallet
 * - Employer: For business accounts managing employee payroll
 * - Employee: For employee accounts connected to an employer wallet
 * 
 * If no wallet exists, it shows a wallet selection screen to create a new wallet.
 */
const WalletRouterScreen = () => {
  const navigation = useNavigation();
  const { currentWallet, loading, error, setWalletType, getCurrentWalletInfo } = useWallet();
  
  // Local state
  const [selectingWallet, setSelectingWallet] = useState(false);
  
  // Load wallet info on mount
  useEffect(() => {
    const loadWalletInfo = async () => {
      try {
        const walletInfo = await getCurrentWalletInfo();
        
        // If no wallet exists, show selection screen
        if (!walletInfo) {
          setSelectingWallet(true);
        }
      } catch (error) {
        console.error('Error loading wallet info:', error);
        setSelectingWallet(true);
      }
    };
    
    loadWalletInfo();
  }, []);
  
  // Create new wallet and navigate to the appropriate screen
  const handleCreateWallet = async (type: 'parent' | 'child' | 'employer' | 'employee') => {
    try {
      await setWalletType(type);
      setSelectingWallet(false);
    } catch (error) {
      console.error('Error creating wallet:', error);
    }
  };
  
  // If loading
  if (loading && !selectingWallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your wallet...</Text>
      </View>
    );
  }
  
  // If error and not selecting wallet
  if (error && !selectingWallet) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => getCurrentWalletInfo()}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }
  
  // If selecting wallet type (no wallet exists yet)
  if (selectingWallet || !currentWallet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Choose Your Wallet Type</Text>
          <Text style={styles.headerSubtitle}>
            Select the type of wallet that best suits your needs. You can have multiple wallet types.
          </Text>
        </View>
        
        <View style={styles.optionsContainer}>
          {/* Personal Wallets Section */}
          <Text style={styles.sectionTitle}>Personal Wallets</Text>
          
          {/* Parent Wallet Option */}
          <View style={styles.walletOption}>
            <View style={[styles.walletIconContainer, { backgroundColor: walletColorSchemes.parent.primary }]}>
              <Icon name="account-supervisor" size={32} color="#fff" />
            </View>
            <View style={styles.walletInfoContainer}>
              <Text style={styles.walletTitle}>Parent Wallet</Text>
              <Text style={styles.walletDescription}>
                For managing family finances, controlling children's accounts, setting allowances, and reward tasks.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => handleCreateWallet('parent')}
                style={[styles.walletButton, { backgroundColor: walletColorSchemes.parent.primary }]}
              >
                Set Up Parent Wallet
              </Button>
            </View>
          </View>
          
          {/* Child Wallet Option */}
          <View style={styles.walletOption}>
            <View style={[styles.walletIconContainer, { backgroundColor: walletColorSchemes.child.primary }]}>
              <Icon name="account-child" size={32} color="#fff" />
            </View>
            <View style={styles.walletInfoContainer}>
              <Text style={styles.walletTitle}>Child Wallet</Text>
              <Text style={styles.walletDescription}>
                For kids and teenagers to manage allowances, save money, complete tasks, and learn financial skills.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => handleCreateWallet('child')}
                style={[styles.walletButton, { backgroundColor: walletColorSchemes.child.primary }]}
              >
                Set Up Child Wallet
              </Button>
            </View>
          </View>
          
          {/* Business Wallets Section */}
          <Text style={styles.sectionTitle}>Business Wallets</Text>
          
          {/* Employer Wallet Option */}
          <View style={styles.walletOption}>
            <View style={[styles.walletIconContainer, { backgroundColor: walletColorSchemes.employer.primary }]}>
              <Icon name="domain" size={32} color="#fff" />
            </View>
            <View style={styles.walletInfoContainer}>
              <Text style={styles.walletTitle}>Employer Wallet</Text>
              <Text style={styles.walletDescription}>
                For businesses to manage employee payroll, expense reimbursements, track time, and handle benefits.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => handleCreateWallet('employer')}
                style={[styles.walletButton, { backgroundColor: walletColorSchemes.employer.primary }]}
              >
                Set Up Employer Wallet
              </Button>
            </View>
          </View>
          
          {/* Employee Wallet Option */}
          <View style={styles.walletOption}>
            <View style={[styles.walletIconContainer, { backgroundColor: walletColorSchemes.employee.primary }]}>
              <Icon name="account-tie" size={32} color="#fff" />
            </View>
            <View style={styles.walletInfoContainer}>
              <Text style={styles.walletTitle}>Employee Wallet</Text>
              <Text style={styles.walletDescription}>
                For receiving salary, submitting time entries, expense reports, and managing workplace benefits.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => handleCreateWallet('employee')}
                style={[styles.walletButton, { backgroundColor: walletColorSchemes.employee.primary }]}
              >
                Set Up Employee Wallet
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  // Router to appropriate wallet screen based on type
  switch (currentWallet.type) {
    case 'parent':
      return <ParentWalletScreen />;
    case 'child':
      return <ChildWalletScreen />;
    case 'employer':
      return <EmployerWalletScreen />;
    case 'employee':
      return <EmployeeWalletScreen />;
    default:
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorTitle}>Invalid Wallet Type</Text>
          <Text style={styles.errorText}>The wallet type '{currentWallet.type}' is not recognized.</Text>
          <Button 
            mode="contained" 
            onPress={() => setSelectingWallet(true)}
            style={styles.retryButton}
          >
            Select Different Wallet
          </Button>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
  },
  headerContainer: {
    padding: spacing.lg,
    backgroundColor: colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  optionsContainer: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  walletOption: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12, // Using value directly from our theme's borderRadius.md
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  walletIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30, // Half of width/height for circle
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  walletInfoContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  walletDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  walletButton: {
    alignSelf: 'flex-start',
  },
});

export default WalletRouterScreen;