import { Platform, Dimensions } from 'react-native';

// Get screen dimensions
const { width, height } = Dimensions.get('window');

// Platform specific values
const isIOS = Platform.OS === 'ios';

// Color Palettes
const primaryPalette = {
  50: '#F0F7FF',
  100: '#E0EFFF',
  200: '#C0DFFF',
  300: '#80BFFF',
  400: '#4099FF',
  500: '#0073E6',
  600: '#0059B3',
  700: '#004080',
  800: '#00264D',
  900: '#001226',
};

const grayPalette = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
};

// Core colors
const colors = {
  // Brand Colors
  primary: primaryPalette[500],
  primaryLight: primaryPalette[300],
  primaryDark: primaryPalette[700],
  secondary: '#FF9900',
  secondaryLight: '#FFCC80',
  secondaryDark: '#F57C00',
  
  // Text Colors
  textDark: grayPalette[900],
  textMedium: grayPalette[700],
  textMuted: grayPalette[500],
  textLight: grayPalette[300],
  
  // UI Colors
  backgroundPrimary: '#FFFFFF',
  backgroundSecondary: grayPalette[50],
  backgroundTertiary: grayPalette[100],
  border: grayPalette[200],
  borderDark: grayPalette[300],
  
  // State Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Additional Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gradient Base Colors
  gradientStart: '#0073E6',
  gradientEnd: '#00C6FF',
  
  // Additional Gray Palette
  gray50: grayPalette[50],
  gray100: grayPalette[100],
  gray200: grayPalette[200],
  gray300: grayPalette[300],
  gray400: grayPalette[400],
  gray500: grayPalette[500],
  gray600: grayPalette[600],
  gray700: grayPalette[700],
  gray800: grayPalette[800],
  gray900: grayPalette[900],
};

// Wallet color schemes based on account type
const walletColorSchemes = {
  personal: {
    primary: colors.primary,
    secondary: colors.gradientEnd,
    background: colors.backgroundPrimary,
    accent: '#3B82F6',
  },
  family: {
    primary: '#8B5CF6',
    secondary: '#C4B5FD',
    background: '#F5F3FF',
    accent: '#7C3AED',
  },
  business: {
    primary: '#2563EB',
    secondary: '#93C5FD',
    background: '#EFF6FF',
    accent: '#1D4ED8',
  },
  child: {
    primary: '#EC4899',
    secondary: '#FBCFE8',
    background: '#FCE7F3',
    accent: '#DB2777',
  },
  employee: {
    primary: '#10B981',
    secondary: '#6EE7B7',
    background: '#ECFDF5',
    accent: '#059669',
  },
};

// Spacing
const baseSpacing = 4;
const spacing = {
  '0': 0,
  '0.5': baseSpacing / 2,
  '1': baseSpacing,
  '2': baseSpacing * 2,
  '3': baseSpacing * 3,
  '4': baseSpacing * 4,
  '5': baseSpacing * 5,
  '6': baseSpacing * 6,
  '8': baseSpacing * 8,
  '10': baseSpacing * 10,
  '12': baseSpacing * 12,
  '14': baseSpacing * 14,
  '16': baseSpacing * 16,
  '20': baseSpacing * 20,
  '24': baseSpacing * 24,
  '28': baseSpacing * 28,
  '32': baseSpacing * 32,
  '36': baseSpacing * 36,
  '40': baseSpacing * 40,
  '48': baseSpacing * 48,
  '56': baseSpacing * 56,
  '64': baseSpacing * 64,
  '72': baseSpacing * 72,
  '80': baseSpacing * 80,
  '96': baseSpacing * 96,
};

// Typography
const fontFamily = {
  sans: isIOS ? 'System' : 'Roboto',
  serif: isIOS ? 'Georgia' : 'serif',
  mono: isIOS ? 'Courier' : 'monospace',
};

const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
};

const fontWeight = {
  hairline: '100',
  thin: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
    widest: 1.6,
  },
};

// Border radius
const borderRadius = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

// Shadows
const shadows = {
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  '2xl': {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 12,
  },
};

// Common styles for reuse
const commonStyles = {
  card: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundPrimary,
    padding: spacing[4],
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  cardContent: {
    marginVertical: spacing[2],
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing[3],
  },
  section: {
    marginBottom: spacing[8],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    fontSize: fontSize.base,
    color: colors.textDark,
    backgroundColor: colors.backgroundPrimary,
  },
  button: {
    primary: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  buttonText: {
    primary: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      color: colors.white,
    },
    secondary: {
      fontSize: fontSize.base,
      fontWeight: fontWeight.medium,
      color: colors.primary,
    },
  },
  containerPadding: {
    paddingHorizontal: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[4],
  },
};

// Define responsive dimensions
const responsive = {
  isSmallDevice: width < 375,
  screen: {
    width,
    height,
  },
};

// Export the theme
const theme = {
  colors,
  walletColorSchemes,
  spacing,
  typography,
  borderRadius,
  shadows,
  commonStyles,
  responsive,
};

export default theme;