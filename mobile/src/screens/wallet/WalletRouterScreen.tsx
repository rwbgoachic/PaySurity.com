import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Text, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useWallet, WalletType } from '../../hooks/useWallet';
import { colors, spacing, borderRadius, walletColorSchemes, shadows, typography } from '../../utils/theme';

/**
 * WalletRouterScreen serves as the entry point to wallet functionality
 * It allows users to choose their wallet type (parent, child, employer, employee)
 * and routes them to the appropriate wallet screen
 */
const WalletRouterScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setWalletType, currentWallet } = useWallet();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Redirect to specific wallet screen if user already has a wallet
  useEffect(() => {
    if (currentWallet) {
      redirectToWalletScreen(currentWallet.type);
    }
  }, [currentWallet]);

  // Navigate to specific wallet screen based on type
  const redirectToWalletScreen = (type: WalletType) => {
    if (type === 'parent') {
      navigation.navigate('ParentWallet' as never);
    } else if (type === 'child') {
      navigation.navigate('ChildWallet' as never);
    } else if (type === 'employer') {
      navigation.navigate('EmployerWallet' as never);
    } else if (type === 'employee') {
      navigation.navigate('EmployeeWallet' as never);
    }
  };

  // Handle wallet type selection
  const handleWalletTypeSelect = async (type: WalletType) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set wallet type in context
      await setWalletType(type);
      
      // Navigate to appropriate wallet screen
      redirectToWalletScreen(type);
    } catch (err: any) {
      setError(err.message || 'Failed to set wallet type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Wallet type options
  const walletTypes: { type: WalletType; title: string; description: string; icon: string }[] = [
    {
      type: 'parent',
      title: 'Family Wallet - Parent',
      description: 'Manage your family finances, set up allowances, and track your children\'s spending.',
      icon: 'account-child-circle',
    },
    {
      type: 'child',
      title: 'Family Wallet - Child', 
      description: 'Manage your allowance, create savings goals, and learn financial responsibility.',
      icon: 'account-child',
    },
    {
      type: 'employer',
      title: 'Business Wallet - Employer',
      description: 'Manage payroll, expenses, and employee financial benefits for your business.',
      icon: 'domain',
    },
    {
      type: 'employee',
      title: 'Business Wallet - Employee',
      description: 'Receive payments, manage benefits, and submit expenses to your employer.',
      icon: 'account-tie',
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Wallet</Text>
        <Text style={styles.headerSubtitle}>
          Select the wallet type that best fits your needs
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Setting up your wallet...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {error && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={24} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {walletTypes.map((wallet) => (
            <TouchableOpacity
              key={wallet.type}
              style={styles.walletCard}
              onPress={() => handleWalletTypeSelect(wallet.type)}
              disabled={loading}
            >
              <View style={[
                styles.walletIconContainer,
                { backgroundColor: walletColorSchemes[wallet.type].primary }
              ]}>
                <Icon 
                  name={wallet.icon} 
                  size={32} 
                  color="white" 
                />
              </View>
              <View style={styles.walletContent}>
                <Text style={styles.walletTitle}>{wallet.title}</Text>
                <Text style={styles.walletDescription}>{wallet.description}</Text>
              </View>
              <Icon 
                name="chevron-right" 
                size={24} 
                color={colors.textSecondary} 
                style={styles.chevron}
              />
            </TouchableOpacity>
          ))}

          <View style={styles.infoSection}>
            <Card style={styles.infoCard}>
              <Card.Content>
                <Title style={styles.infoTitle}>Why Choose PaySurity?</Title>
                <Paragraph style={styles.infoParagraph}>
                  Our digital wallet solutions offer secure transactions, 
                  comprehensive financial management, and tailored features 
                  for families and businesses.
                </Paragraph>
                <View style={styles.featureRow}>
                  <Icon name="shield-check" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Bank-level security</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="cash-multiple" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Multiple payment methods</Text>
                </View>
                <View style={styles.featureRow}>
                  <Icon name="chart-line" size={20} color={colors.success} />
                  <Text style={styles.featureText}>Financial insights</Text>
                </View>
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontSize: typography.fontSizes['2xl'],
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.normal as any,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSizes.md,
    color: colors.error,
  },
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  walletIconContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  walletContent: {
    flex: 1,
  },
  walletTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold as any,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  walletDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSizes.sm * 1.4,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
  infoSection: {
    marginTop: spacing.xl,
  },
  infoCard: {
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold as any,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoParagraph: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    lineHeight: typography.fontSizes.md * 1.5,
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
});

export default WalletRouterScreen;