import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Define the extended theme colors
const primaryColor = '#0D6EFD'; // Primary blue color matching web app
const secondaryColor = '#6C757D';
const errorColor = '#DC3545';
const successColor = '#28A745';
const warningColor = '#FFC107';
const infoColor = '#17A2B8';

// Light theme
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    error: errorColor,
    success: successColor,
    warning: warningColor,
    info: infoColor,
    background: '#F8F9FA',
    surface: '#FFFFFF',
    text: '#212529',
    placeholder: '#6C757D',
    disabled: '#ADB5BD',
    elevation: {
      level0: 'transparent',
      level1: '#F1F3F5',
      level2: '#E9ECEF',
      level3: '#DEE2E6',
      level4: '#CED4DA',
      level5: '#ADB5BD',
    },
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Dark theme
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: primaryColor,
    secondary: secondaryColor,
    error: errorColor,
    success: successColor,
    warning: warningColor,
    info: infoColor,
    background: '#212529',
    surface: '#343A40',
    text: '#F8F9FA',
    placeholder: '#ADB5BD',
    disabled: '#6C757D',
    elevation: {
      level0: 'transparent',
      level1: '#2B3035',
      level2: '#343A40',
      level3: '#495057',
      level4: '#6C757D',
      level5: '#ADB5BD',
    },
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Export the theme based on device settings or user preference
// For now, default to light theme
export const theme = lightTheme;

// Function to toggle between light and dark themes
export const getTheme = (isDarkMode: boolean) => {
  return isDarkMode ? darkTheme : lightTheme;
};

// Typography scale
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

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Common styling mixins
export const mixins = {
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  card: {
    default: {
      borderRadius: 8,
      padding: spacing.md,
      backgroundColor: lightTheme.colors.surface,
      ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
      },
    },
  },
};