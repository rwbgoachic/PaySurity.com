import React, { createContext, useState, useContext, useEffect } from 'react';

export type ThemeSettings = {
  primary: string;
  variant: 'professional' | 'tint' | 'vibrant';
  appearance: 'light' | 'dark' | 'system';
  radius: number;
};

interface ThemeContextType {
  theme: ThemeSettings;
  previewTheme: ThemeSettings | null;
  previewMode: boolean;
  setTheme: (theme: ThemeSettings) => void;
  setPreviewTheme: (theme: ThemeSettings | null) => void;
  setPreviewMode: (mode: boolean) => void;
  saveTheme: () => void;
  resetPreview: () => void;
}

// Default theme settings
const defaultTheme: ThemeSettings = {
  primary: 'hsl(222, 72%, 59%)',
  variant: 'professional',
  appearance: 'light',
  radius: 0.5,
};

// Create the context with a default undefined value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeSettings>(defaultTheme);
  const [previewTheme, setPreviewThemeState] = useState<ThemeSettings | null>(null);
  const [previewMode, setPreviewModeState] = useState<boolean>(false);
  
  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme);
        setThemeState(parsedTheme);
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
        // Fall back to default theme
        setThemeState(defaultTheme);
      }
    }
  }, []);
  
  // Apply theme CSS variables whenever theme or previewTheme changes
  useEffect(() => {
    const currentTheme = previewMode && previewTheme ? previewTheme : theme;
    const htmlElement = document.documentElement;
    
    // Extract HSL values from primary color string
    const primaryMatch = currentTheme.primary.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
    if (primaryMatch) {
      const h = primaryMatch[1];
      const s = primaryMatch[2];
      const l = primaryMatch[3];
      
      // Set primary color
      htmlElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);
      
      // Set theme variant styles
      if (currentTheme.variant === 'professional') {
        // Professional variant uses more muted colors
        htmlElement.style.setProperty('--secondary', '210 40% 96.1%');
        htmlElement.style.setProperty('--accent', '215 25% 27%');
      } else if (currentTheme.variant === 'tint') {
        // Tint variant uses lighter variations of the primary color
        htmlElement.style.setProperty('--secondary', `${h} 30% 96%`);
        htmlElement.style.setProperty('--accent', `${h} 40% 90%`);
      } else if (currentTheme.variant === 'vibrant') {
        // Vibrant variant uses more saturated colors
        htmlElement.style.setProperty('--secondary', `${Number(h) + 40} ${s}% 90%`);
        htmlElement.style.setProperty('--accent', `${Number(h) - 40} ${s}% 85%`);
      }
      
      // Set appearance (light/dark mode)
      if (currentTheme.appearance === 'light') {
        htmlElement.classList.remove('dark');
      } else if (currentTheme.appearance === 'dark') {
        htmlElement.classList.add('dark');
      } else if (currentTheme.appearance === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          htmlElement.classList.add('dark');
        } else {
          htmlElement.classList.remove('dark');
        }
      }
      
      // Set border radius
      htmlElement.style.setProperty('--radius', `${currentTheme.radius}rem`);
    }
  }, [theme, previewTheme, previewMode]);
  
  // Functions to update theme state
  const setTheme = (newTheme: ThemeSettings) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', JSON.stringify(newTheme));
  };
  
  const setPreviewTheme = (newTheme: ThemeSettings | null) => {
    setPreviewThemeState(newTheme);
  };
  
  const setPreviewMode = (mode: boolean) => {
    setPreviewModeState(mode);
    if (!mode) {
      setPreviewTheme(null);
    }
  };
  
  const saveTheme = () => {
    if (previewTheme) {
      setTheme(previewTheme);
      setPreviewMode(false);
      setPreviewTheme(null);
    }
  };
  
  const resetPreview = () => {
    setPreviewTheme(null);
    setPreviewMode(false);
  };
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        previewTheme,
        previewMode,
        setTheme,
        setPreviewTheme,
        setPreviewMode,
        saveTheme,
        resetPreview,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};