import { DefaultTheme } from 'react-native-paper';
import { Dimensions, StyleSheet } from 'react-native';

// Screen dimensions
export const { width, height } = Dimensions.get('window');

// Colors
export const colors = {
  // Primary colors
  primary: '#0066FF',
  primaryDark: '#0052CC',
  primaryLight: '#4D94FF',
  
  // Secondary colors
  secondary: '#7E57C2',
  secondaryDark: '#5E35B1',
  secondaryLight: '#9575CD',
  
  // Tertiary colors
  tertiary: '#26A69A',
  tertiaryDark: '#00897B',
  tertiaryLight: '#4DB6AC',
  
  // Neutral colors
  background: '#FFFFFF',
  backgroundLight: '#F5F7FA',
  backgroundDark: '#E0E4E8',
  
  // Text colors
  text: '#14213D',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  textDisabled: '#A0AEC0',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#48BB78',
  warning: '#F6AD55',
  error: '#F56565',
  info: '#4299E1',
  
  // Border colors
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  borderDark: '#CBD5E0',
  
  // Gradient stops
  gradientStart: '#0066FF',
  gradientEnd: '#5E35B1',
  
  // Dividers
  divider: '#E2E8F0',
};

// Typography
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const shadows = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Wallet color schemes
export const walletColorSchemes = {
  parent: {
    primary: '#3B82F6', // Blue
    secondary: '#60A5FA',
    tertiary: '#93C5FD',
    dark: '#1D4ED8',
    light: '#DBEAFE',
    gradient: ['#3B82F6', '#1D4ED8'],
  },
  child: {
    primary: '#10B981', // Emerald/Green
    secondary: '#34D399',
    tertiary: '#6EE7B7',
    dark: '#059669',
    light: '#D1FAE5',
    gradient: ['#10B981', '#059669'],
  },
  employer: {
    primary: '#6366F1', // Indigo/Purple
    secondary: '#818CF8',
    tertiary: '#A5B4FC',
    dark: '#4F46E5',
    light: '#E0E7FF',
    gradient: ['#6366F1', '#4F46E5'],
  },
  employee: {
    primary: '#F59E0B', // Amber/Orange
    secondary: '#FBBF24',
    tertiary: '#FCD34D',
    dark: '#D97706',
    light: '#FEF3C7',
    gradient: ['#F59E0B', '#D97706'],
  },
};

// Theme object for React Native Paper
export const paperTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.secondary,
    background: colors.background,
    surface: colors.background,
    text: colors.text,
    error: colors.error,
  },
};

// Common styles
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.medium,
  },
  section: {
    marginBottom: spacing.lg,
  },
  header: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.textSecondary,
  },
  text: {
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  textSecondary: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  textSmall: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  spacer: {
    height: spacing.md,
  },
});

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  walletColorSchemes,
  paperTheme,
  commonStyles,
};