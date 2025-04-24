import { useEffect, useCallback } from 'react';
import { useTheme, ThemeSettings } from '../contexts/ThemeContext';

// WebSocket message types
type WebSocketMessage = {
  type: 'theme_preview' | 'theme_save' | 'theme_reset' | 'theme_update';
  theme?: ThemeSettings;
  clientId?: string;
};

export const useThemeWebSocket = () => {
  const { setPreviewTheme, setPreviewMode, theme, previewTheme, resetPreview, setTheme } = useTheme();
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/theme`;
    const socket = new WebSocket(wsUrl);
    
    // Connection opened
    socket.addEventListener('open', (event) => {
      console.log('WebSocket connection established for theme preview');
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('Received WebSocket message:', message);
        
        switch (message.type) {
          case 'theme_update':
            if (message.theme) {
              // Only update if the message wasn't sent by us
              const currentClientId = localStorage.getItem('themeClientId');
              if (message.clientId !== currentClientId) {
                setPreviewTheme(message.theme);
                setPreviewMode(true);
              }
            }
            break;
          case 'theme_preview':
            if (message.theme) {
              setPreviewTheme(message.theme);
              setPreviewMode(true);
            }
            break;
          case 'theme_save':
            if (previewTheme) {
              setTheme(previewTheme);
              resetPreview();
            }
            break;
          case 'theme_reset':
            resetPreview();
            break;
          default:
            console.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Socket closed
    socket.addEventListener('close', (event) => {
      console.log('WebSocket connection closed for theme preview');
    });
    
    // Socket error
    socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
    });
    
    // Clean up WebSocket connection on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [setPreviewTheme, setPreviewMode, resetPreview, setTheme, previewTheme]);
  
  // Track client ID for preventing echo
  useEffect(() => {
    // Generate a unique client ID if not already present
    if (!localStorage.getItem('themeClientId')) {
      localStorage.setItem('themeClientId', `client-${Date.now()}-${Math.floor(Math.random() * 10000)}`);
    }
  }, []);

  // Send preview theme through WebSocket
  const sendPreviewTheme = useCallback(() => {
    const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/theme`);
    
    socket.addEventListener('open', () => {
      const clientId = localStorage.getItem('themeClientId') || 'unknown-client';
      const message: WebSocketMessage = {
        type: 'theme_preview',
        theme: previewTheme || theme,
        clientId
      };
      
      socket.send(JSON.stringify(message));
      socket.close();
    });
  }, [previewTheme, theme]);
  
  // Broadcast theme save through WebSocket
  const broadcastThemeSave = useCallback(() => {
    const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/theme`);
    
    socket.addEventListener('open', () => {
      const clientId = localStorage.getItem('themeClientId') || 'unknown-client';
      const message: WebSocketMessage = {
        type: 'theme_save',
        theme: previewTheme || undefined,
        clientId
      };
      
      socket.send(JSON.stringify(message));
      socket.close();
    });
  }, [previewTheme]);
  
  // Broadcast theme reset through WebSocket
  const broadcastThemeReset = useCallback(() => {
    const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/theme`);
    
    socket.addEventListener('open', () => {
      const clientId = localStorage.getItem('themeClientId') || 'unknown-client';
      const message: WebSocketMessage = {
        type: 'theme_reset',
        clientId
      };
      
      socket.send(JSON.stringify(message));
      socket.close();
    });
  }, []);
  
  return {
    sendPreviewTheme,
    broadcastThemeSave,
    broadcastThemeReset
  };
};