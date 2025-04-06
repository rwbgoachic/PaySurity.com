import { DefaultTheme, DarkTheme } from 'react-native-paper';
import { Appearance } from 'react-native';

// PaySurity brand colors
const brandColors = {
  primary: '#4F46E5', // Primary indigo
  primaryDark: '#3730A3', // Darker indigo for hover states
  primaryLight: '#818CF8', // Lighter indigo for backgrounds
  secondary: '#10B981', // Emerald green for success and actions
  secondaryDark: '#059669', // Darker emerald for hover states
  accent: '#F59E0B', // Amber for accents and highlights
  success: '#10B981', // Emerald for success states
  warning: '#F59E0B', // Amber for warnings
  error: '#EF4444', // Red for errors
  info: '#3B82F6', // Blue for information
  background: '#F9FAFB', // Light gray for backgrounds
  backgroundDark: '#1F2937', // Dark background
  surface: '#FFFFFF', // White for surfaces
  surfaceDark: '#111827', // Dark surface
  text: '#1F2937', // Dark gray for text
  textDark: '#F9FAFB', // Light gray for text on dark
  textSecondary: '#6B7280', // Medium gray for secondary text
  textSecondaryDark: '#9CA3AF', // Medium light gray for secondary text on dark
  border: '#E5E7EB', // Light gray for borders
  borderDark: '#374151', // Dark gray for borders on dark
};

// Light theme
export const lightTheme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: brandColors.primary,
    accent: brandColors.accent,
    background: brandColors.background,
    surface: brandColors.surface,
    text: brandColors.text,
    placeholder: brandColors.textSecondary,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    error: brandColors.error,
    notification: brandColors.primary,
    onSurface: brandColors.text,
    disabled: brandColors.textSecondary,
    // Additional custom colors
    success: brandColors.success,
    warning: brandColors.warning,
    info: brandColors.info,
    border: brandColors.border,
    primaryDark: brandColors.primaryDark,
    primaryLight: brandColors.primaryLight,
    secondaryDark: brandColors.secondaryDark,
    textSecondary: brandColors.textSecondary,
    primaryContainer: 'rgba(79, 70, 229, 0.1)', // Light indigo for containers
    secondaryContainer: 'rgba(16, 185, 129, 0.1)', // Light emerald for containers
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  },
};

// Dark theme
export const darkTheme = {
  ...DarkTheme,
  roundness: 8,
  colors: {
    ...DarkTheme.colors,
    primary: brandColors.primaryLight,
    accent: brandColors.accent,
    background: brandColors.backgroundDark,
    surface: brandColors.surfaceDark,
    text: brandColors.textDark,
    placeholder: brandColors.textSecondaryDark,
    backdrop: 'rgba(0, 0, 0, 0.8)',
    error: brandColors.error,
    notification: brandColors.primaryLight,
    onSurface: brandColors.textDark,
    disabled: brandColors.textSecondaryDark,
    // Additional custom colors
    success: brandColors.success,
    warning: brandColors.warning,
    info: brandColors.info,
    border: brandColors.borderDark,
    primaryDark: brandColors.primary,
    primaryLight: brandColors.primaryLight,
    secondaryDark: brandColors.secondary,
    textSecondary: brandColors.textSecondaryDark,
    primaryContainer: 'rgba(129, 140, 248, 0.15)', // Darker indigo for containers on dark
    secondaryContainer: 'rgba(16, 185, 129, 0.15)', // Darker emerald for containers on dark
  },
  fonts: {
    ...DarkTheme.fonts,
    regular: {
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'sans-serif-medium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'sans-serif-light',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'sans-serif-thin',
      fontWeight: 'normal',
    },
  },
};

// Detect the user's preferred theme
const colorScheme = Appearance.getColorScheme();

// Export the theme based on user preference
export const theme = colorScheme === 'dark' ? darkTheme : lightTheme;