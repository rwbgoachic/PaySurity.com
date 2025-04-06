import { DefaultTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';

// PaySurity brand colors
export const colors = {
  // Primary colors
  primary: '#4F46E5', // Main brand color - Indigo
  primaryLight: '#6366F1', // Light variant
  primaryDark: '#4338CA', // Dark variant
  
  // Secondary and accent colors
  secondary: '#10B981', // Green for positive actions
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  tertiary: '#F59E0B', // Amber for child accounts/features
  tertiaryLight: '#FBBF24',
  tertiaryDark: '#D97706',
  
  // UI and feedback colors
  success: '#10B981', // Green for success states
  warning: '#F59E0B', // Amber for warnings
  error: '#EF4444', // Red for errors
  info: '#3B82F6', // Blue for information
  
  // Neutral colors
  background: '#F9FAFB', // Light background
  surface: '#FFFFFF', // White surface
  border: '#E5E7EB', // Light gray border
  
  // Text colors
  textPrimary: '#111827', // Dark gray for primary text
  textSecondary: '#6B7280', // Medium gray for secondary text
  textDisabled: '#9CA3AF', // Light gray for disabled text
  textInverted: '#FFFFFF', // White text for dark backgrounds
};

// Wallet-specific color schemes
export const walletColorSchemes = {
  parent: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
  },
  child: {
    primary: colors.tertiary,
    secondary: colors.primary,
    background: colors.background,
  },
  employer: {
    primary: '#0891B2', // Cyan
    secondary: colors.secondary,
    background: colors.background,
  },
  employee: {
    primary: '#8B5CF6', // Violet
    secondary: colors.secondary,
    background: colors.background,
  },
};

// Application theme definition
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    text: colors.textPrimary,
    error: colors.error,
    disabled: colors.textDisabled,
    placeholder: colors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: colors.primary,
  },
  roundness: 8,
  fonts: {
    ...DefaultTheme.fonts,
  },
};

// Common styles used across components
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  textSmall: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
});

export default {
  colors,
  walletColorSchemes,
  theme,
  commonStyles,
};