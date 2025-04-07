import { StyleSheet, Dimensions, Platform } from 'react-native';

/**
 * Base color palette
 */
export const colors = {
  // Primary color variations
  primary: '#007AFF',
  primaryLight: '#66B3FF',
  primaryDark: '#0055B3',
  primaryGradient: ['#007AFF', '#0055B3'],
  
  // Secondary color variations
  secondary: '#5856D6',
  secondaryLight: '#9593E3',
  secondaryDark: '#3A39A0',
  secondaryGradient: ['#5856D6', '#3A39A0'],
  
  // Status colors
  success: '#34C759',
  warning: '#FFCC00',
  danger: '#FF3B30',
  info: '#5AC8FA',
  
  // Grayscale
  white: '#FFFFFF',
  gray1: '#F7F7F7',
  gray2: '#E5E5EA',
  gray3: '#D1D1D6',
  gray4: '#C7C7CC',
  gray5: '#AEAEB2',
  gray6: '#8E8E93',
  gray7: '#636366',
  gray8: '#48484A',
  gray9: '#3A3A3C',
  gray10: '#2C2C2E',
  gray11: '#1C1C1E',
  black: '#000000',
  
  // Semantic colors
  text: '#000000',
  textLight: '#8E8E93',
  background: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E5E5EA',
  notification: '#FF3B30',
  disabled: '#C7C7CC',
  placeholder: '#C7C7CC',
  
  // Brand colors for 3rd party services
  stripe: '#6772E5',
  plaid: '#00CA8E',
  helcim: '#003057',
  venmo: '#3D95CE',
  paypal: '#0070E0',
  zelle: '#6D1ED4',
  apple: '#000000',
};

/**
 * Dark theme color palette
 */
export const darkColors = {
  // Primary color variations (adjust for dark theme)
  primary: '#0A84FF',
  primaryLight: '#66B3FF',
  primaryDark: '#0055B3',
  primaryGradient: ['#0A84FF', '#0055B3'],
  
  // Secondary color variations
  secondary: '#5E5CE6',
  secondaryLight: '#9593E3',
  secondaryDark: '#3A39A0',
  secondaryGradient: ['#5E5CE6', '#3A39A0'],
  
  // Status colors (adjusted for dark theme)
  success: '#30D158',
  warning: '#FFD60A',
  danger: '#FF453A',
  info: '#64D2FF',
  
  // Grayscale (inverted for dark theme)
  white: '#000000',
  gray1: '#1C1C1E',
  gray2: '#2C2C2E',
  gray3: '#3A3A3C',
  gray4: '#48484A',
  gray5: '#636366',
  gray6: '#8E8E93',
  gray7: '#AEAEB2',
  gray8: '#C7C7CC',
  gray9: '#D1D1D6',
  gray10: '#E5E5EA',
  gray11: '#F7F7F7',
  black: '#FFFFFF',
  
  // Semantic colors (adjusted for dark theme)
  text: '#FFFFFF',
  textLight: '#8E8E93',
  background: '#000000',
  card: '#1C1C1E',
  border: '#38383A',
  notification: '#FF453A',
  disabled: '#636366',
  placeholder: '#636366',
  
  // Brand colors remain the same in dark mode
  stripe: '#6772E5',
  plaid: '#00CA8E',
  helcim: '#003057',
  venmo: '#3D95CE',
  paypal: '#0070E0',
  zelle: '#6D1ED4',
  apple: '#FFFFFF', // Inverted for dark mode
};

/**
 * Typography settings
 */
export const typography = {
  // Font families
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'System' : 'Roboto-Medium',
    bold: Platform.OS === 'ios' ? 'System' : 'Roboto-Bold',
    light: Platform.OS === 'ios' ? 'System' : 'Roboto-Light',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  
  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 40,
    display: 48,
  },
  
  // Font weights (using strings for cross-platform compatibility)
  fontWeight: {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
};

/**
 * Spacing sizes
 */
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  screen: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
};

/**
 * Border radius sizes
 */
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: 9999,
};

/**
 * Shadow presets
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
};

/**
 * z-index values
 */
export const zIndex = {
  base: 0,
  card: 10,
  header: 20,
  modal: 30,
  toast: 40,
  tooltip: 50,
  dropdown: 60,
  overlay: 70,
  popover: 80,
  drawer: 90,
  alert: 100,
};

/**
 * Common styles for reuse
 */
export const commonStyles = StyleSheet.create({
  // Flex layouts
  flex1: {
    flex: 1,
  },
  flexGrow1: {
    flexGrow: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexColumnCenter: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexWrap: {
    flexWrap: 'wrap',
  },
  
  // Padding & Margins
  padding1: { padding: spacing[1] },
  padding2: { padding: spacing[2] },
  padding3: { padding: spacing[3] },
  padding4: { padding: spacing[4] },
  
  paddingHorizontal1: { paddingHorizontal: spacing[1] },
  paddingHorizontal2: { paddingHorizontal: spacing[2] },
  paddingHorizontal3: { paddingHorizontal: spacing[3] },
  paddingHorizontal4: { paddingHorizontal: spacing[4] },
  
  paddingVertical1: { paddingVertical: spacing[1] },
  paddingVertical2: { paddingVertical: spacing[2] },
  paddingVertical3: { paddingVertical: spacing[3] },
  paddingVertical4: { paddingVertical: spacing[4] },
  
  margin1: { margin: spacing[1] },
  margin2: { margin: spacing[2] },
  margin3: { margin: spacing[3] },
  margin4: { margin: spacing[4] },
  
  marginHorizontal1: { marginHorizontal: spacing[1] },
  marginHorizontal2: { marginHorizontal: spacing[2] },
  marginHorizontal3: { marginHorizontal: spacing[3] },
  marginHorizontal4: { marginHorizontal: spacing[4] },
  
  marginVertical1: { marginVertical: spacing[1] },
  marginVertical2: { marginVertical: spacing[2] },
  marginVertical3: { marginVertical: spacing[3] },
  marginVertical4: { marginVertical: spacing[4] },
  
  // Typography
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  textLeft: {
    textAlign: 'left',
  },
  
  // Screen layouts
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing[4],
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionContainer: {
    marginVertical: spacing[4],
  },
  
  // Card styles
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    ...shadows.md,
  },
  cardHeader: {
    marginBottom: spacing[3],
  },
  cardFooter: {
    marginTop: spacing[3],
  },
  
  // Form elements
  formGroup: {
    marginBottom: spacing[4],
  },
  formLabel: {
    marginBottom: spacing[2],
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.md,
  },
  
  // Button styles
  button: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  buttonText: {
    color: colors.white,
    textAlign: 'center',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  
  // List styles
  listItem: {
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  
  // Utility
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[4],
  },
  shadow: {
    ...shadows.md,
  },
});

/**
 * Color schemes for different wallet types
 */
export const walletColorSchemes = {
  parent: {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.success,
    gradient: colors.primaryGradient,
    backgroundGradient: ['#F0F8FF', '#FFFFFF'],
  },
  child: {
    primary: '#8A2BE2', // BlueViolet
    secondary: '#9370DB', // MediumPurple
    accent: '#BA55D3', // MediumOrchid
    gradient: ['#8A2BE2', '#9370DB'],
    backgroundGradient: ['#F5F0FF', '#FFFFFF'],
  },
  employer: {
    primary: '#006064', // Dark Cyan
    secondary: '#00ACC1', // Cyan
    accent: '#26C6DA', // Light Cyan
    gradient: ['#006064', '#00ACC1'],
    backgroundGradient: ['#E0F7FA', '#FFFFFF'],
  },
  employee: {
    primary: '#1B5E20', // Dark Green
    secondary: '#43A047', // Green
    accent: '#66BB6A', // Light Green
    gradient: ['#1B5E20', '#43A047'],
    backgroundGradient: ['#E8F5E9', '#FFFFFF'],
  },
  personal: {
    primary: '#C2185B', // Dark Pink
    secondary: '#E91E63', // Pink
    accent: '#EC407A', // Light Pink
    gradient: ['#C2185B', '#E91E63'],
    backgroundGradient: ['#FCE4EC', '#FFFFFF'],
  },
  business: {
    primary: '#004D40', // Dark Teal
    secondary: '#00796B', // Teal
    accent: '#009688', // Light Teal
    gradient: ['#004D40', '#00796B'],
    backgroundGradient: ['#E0F2F1', '#FFFFFF'],
  },
};