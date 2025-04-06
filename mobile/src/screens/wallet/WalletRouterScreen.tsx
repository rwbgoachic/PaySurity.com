import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, Title, Paragraph } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useWallet, { WalletRole } from '../../hooks/useWallet';
import { colors, commonStyles } from '../../utils/theme';

/**
 * WalletRouterScreen
 * 
 * This screen helps users select which wallet type they want to use,
 * and routes them to the appropriate wallet screen based on their role.
 */
const WalletRouterScreen = () => {
  const navigation = useNavigation();
  const { currentWallet, setCurrentWallet, navigateToWallet } = useWallet();
  const [userRoles, setUserRoles] = useState<WalletRole[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's available wallet roles
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call to get the user's available roles
        // For demo purposes, we're hardcoding roles
        // This would be replaced with actual API data
        const roles: WalletRole[] = ['parent', 'employer'];
        setUserRoles(roles);
      } catch (error) {
        console.error('Error fetching user roles', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, []);

  // Handle wallet selection
  const selectWallet = (role: WalletRole) => {
    navigateToWallet(role);
  };

  // Render a role card
  const renderRoleCard = (role: WalletRole) => {
    let title: string;
    let description: string;
    let iconName: string;
    let color: string;
    
    switch (role) {
      case 'parent':
        title = 'Family Wallet';
        description = 'Manage your family finances, set allowances, and track your children\'s spending.';
        iconName = 'account-child';
        color = colors.primary;
        break;
      case 'child':
        title = 'Kid\'s Wallet';
        description = 'Manage your money, track your savings goals, and learn about finances.';
        iconName = 'piggy-bank';
        color = colors.tertiary;
        break;
      case 'employer':
        title = 'Business Wallet';
        description = 'Manage your business finances, payroll, and employee expenses.';
        iconName = 'domain';
        color = '#0891B2'; // Cyan
        break;
      case 'employee':
        title = 'Work Wallet';
        description = 'Manage your work finances, track your time, and submit expenses.';
        iconName = 'briefcase';
        color = '#8B5CF6'; // Violet
        break;
      default:
        title = 'Wallet';
        description = 'Manage your finances.';
        iconName = 'wallet';
        color = colors.primary;
    }
    
    return (
      <Card 
        style={styles.card} 
        onPress={() => selectWallet(role)}
        key={role}
      >
        <Card.Content style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Icon name={iconName} size={32} color="#FFF" />
          </View>
          <View style={styles.cardText}>
            <Title style={styles.cardTitle}>{title}</Title>
            <Paragraph style={styles.cardDescription}>{description}</Paragraph>
          </View>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button 
            mode="contained"
            onPress={() => selectWallet(role)}
            style={[styles.button, { backgroundColor: color }]}
          >
            Open
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  // If there's only one role, automatically navigate to that wallet
  useEffect(() => {
    if (userRoles.length === 1 && !loading) {
      navigateToWallet(userRoles[0]);
    }
  }, [userRoles, loading, navigateToWallet]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your wallets...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Wallets</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {userRoles.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="wallet-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateText}>You don't have any wallets yet.</Text>
            <Button 
              mode="contained" 
              style={styles.createButton}
              onPress={() => {
                // In a real app, this would navigate to a screen to create a wallet
                console.log('Create wallet');
              }}
            >
              Create Your First Wallet
            </Button>
          </View>
        ) : (
          <View>
            <Text style={styles.subtitle}>Select a wallet to continue</Text>
            {userRoles.map(role => renderRoleCard(role))}
            
            <View style={styles.additionalRoles}>
              <Text style={styles.additionalRolesTitle}>Add a New Wallet Type</Text>
              
              {!userRoles.includes('parent') && (
                <TouchableOpacity 
                  style={styles.additionalRoleItem}
                  onPress={() => {
                    // In a real app, this would navigate to a screen to create a family wallet
                    console.log('Create family wallet');
                  }}
                >
                  <View style={[styles.smallIconContainer, { backgroundColor: colors.primary }]}>
                    <Icon name="account-child" size={20} color="#FFF" />
                  </View>
                  <Text style={styles.additionalRoleText}>Add Family Wallet</Text>
                  <Icon name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              
              {!userRoles.includes('employer') && (
                <TouchableOpacity 
                  style={styles.additionalRoleItem}
                  onPress={() => {
                    // In a real app, this would navigate to a screen to create a business wallet
                    console.log('Create business wallet');
                  }}
                >
                  <View style={[styles.smallIconContainer, { backgroundColor: '#0891B2' }]}>
                    <Icon name="domain" size={20} color="#FFF" />
                  </View>
                  <Text style={styles.additionalRoleText}>Add Business Wallet</Text>
                  <Icon name="chevron-right" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    padding: 16,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...commonStyles.shadow,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'flex-end',
  },
  button: {
    marginRight: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: colors.primary,
  },
  additionalRoles: {
    marginTop: 24,
    marginBottom: 32,
  },
  additionalRolesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  additionalRoleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...commonStyles.shadow,
  },
  smallIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  additionalRoleText: {
    flex: 1,
    fontSize: 16,
  },
});

export default WalletRouterScreen;