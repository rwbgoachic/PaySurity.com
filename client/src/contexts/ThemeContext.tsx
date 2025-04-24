import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme type definitions
export type ThemeVariant = 'professional' | 'tint' | 'vibrant';
export type ThemeAppearance = 'light' | 'dark' | 'system';

export interface ThemeSettings {
  primary: string;
  variant: ThemeVariant;
  appearance: ThemeAppearance;
  radius: number;
}

// Context interface
interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (theme: ThemeSettings) => void;
  previewMode: boolean;
  setPreviewMode: (active: boolean) => void;
  previewTheme: ThemeSettings | null;
  setPreviewTheme: (theme: ThemeSettings | null) => void;
  saveTheme: () => void;
  resetPreview: () => void;
  isDarkMode: boolean;
}

// Default theme settings
const defaultTheme: ThemeSettings = {
  primary: 'hsl(222, 72%, 59%)',
  variant: 'vibrant',
  appearance: 'light',
  radius: 0.5,
};

// Create context with default values
const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  previewMode: false,
  setPreviewMode: () => {},
  previewTheme: null,
  setPreviewTheme: () => {},
  saveTheme: () => {},
  resetPreview: () => {},
  isDarkMode: false,
});

// Provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Main theme state
  const [theme, setThemeState] = useState<ThemeSettings>(defaultTheme);
  // Preview theme state (only active during preview mode)
  const [previewTheme, setPreviewTheme] = useState<ThemeSettings | null>(null);
  // Preview mode toggle
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  
  // Derived state for dark mode
  const isDarkMode = (previewMode && previewTheme 
    ? previewTheme.appearance === 'dark' 
    : theme.appearance === 'dark') 
    || (theme.appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Load theme from localStorage or theme.json on initial render
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        // Try to get theme from localStorage first
        const storedTheme = localStorage.getItem('paysurity-theme');
        if (storedTheme) {
          setThemeState(JSON.parse(storedTheme));
          return;
        }
        
        // If not in localStorage, fetch from theme.json
        const response = await fetch('/theme.json');
        const themeData = await response.json();
        setThemeState(themeData);
      } catch (error) {
        console.error('Failed to load theme:', error);
        // Fallback to default theme if both methods fail
      }
    };
    
    fetchTheme();
  }, []);

  // Apply theme changes to document when theme or preview changes
  useEffect(() => {
    const activeTheme = previewMode && previewTheme ? previewTheme : theme;
    
    // Update CSS variables and classes based on theme
    document.documentElement.style.setProperty('--radius', `${activeTheme.radius}rem`);
    
    // Handle appearance
    if (activeTheme.appearance === 'dark' || 
        (activeTheme.appearance === 'system' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Extract RGB components from HSL to set primary color
    // This is a simplified approximation - in a real app, you'd use a proper color conversion
    const hslMatch = activeTheme.primary.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (hslMatch) {
      const [_, h, s, l] = hslMatch.map(Number);
      document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);
    }
    
    // Handle other theme properties like variant
    document.documentElement.setAttribute('data-theme-variant', activeTheme.variant);
    
  }, [theme, previewTheme, previewMode]);

  // Save theme changes
  const setTheme = (newTheme: ThemeSettings) => {
    setThemeState(newTheme);
    localStorage.setItem('paysurity-theme', JSON.stringify(newTheme));
    
    // Optionally send to server to update theme.json
    fetch('/api/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTheme),
    }).catch(error => {
      console.error('Failed to save theme to server:', error);
    });
  };

  // Save preview theme as the active theme
  const saveTheme = () => {
    if (previewTheme) {
      setTheme(previewTheme);
      setPreviewMode(false);
      setPreviewTheme(null);
    }
  };

  // Reset preview to current theme
  const resetPreview = () => {
    setPreviewTheme(null);
    setPreviewMode(false);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        previewMode,
        setPreviewMode,
        previewTheme,
        setPreviewTheme,
        saveTheme,
        resetPreview,
        isDarkMode
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);