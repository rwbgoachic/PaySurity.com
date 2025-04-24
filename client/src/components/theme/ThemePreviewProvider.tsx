import React from 'react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { useThemeWebSocket } from '../../hooks/useThemeWebSocket';
import ThemePreviewPanel from './ThemePreviewPanel';

interface ThemePreviewProviderProps {
  children: React.ReactNode;
}

// This intermediate component lets us use the useThemeWebSocket hook within the ThemeProvider context
const ThemePreviewContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sendPreviewTheme, broadcastThemeSave, broadcastThemeReset } = useThemeWebSocket();
  
  return (
    <>
      {children}
      <ThemePreviewPanel 
        onSendPreview={sendPreviewTheme}
        onBroadcastSave={broadcastThemeSave}
        onBroadcastReset={broadcastThemeReset}
      />
    </>
  );
};

// Main provider that wraps the application
const ThemePreviewProvider: React.FC<ThemePreviewProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <ThemePreviewContent>
        {children}
      </ThemePreviewContent>
    </ThemeProvider>
  );
};

export default ThemePreviewProvider;