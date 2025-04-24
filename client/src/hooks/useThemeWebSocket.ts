import { useEffect, useCallback } from 'react';
import { useTheme, ThemeSettings } from '../contexts/ThemeContext';

// WebSocket message types
type WebSocketMessage = {
  type: 'PREVIEW_THEME' | 'SAVE_THEME' | 'RESET_THEME';
  payload?: ThemeSettings;
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
        
        switch (message.type) {
          case 'PREVIEW_THEME':
            if (message.payload) {
              setPreviewTheme(message.payload);
              setPreviewMode(true);
            }
            break;
          case 'SAVE_THEME':
            if (previewTheme) {
              setTheme(previewTheme);
              resetPreview();
            }
            break;
          case 'RESET_THEME':
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
  
  // Send preview theme through WebSocket
  const sendPreviewTheme = useCallback(() => {
    const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/theme`);
    
    socket.addEventListener('open', () => {
      const message: WebSocketMessage = {
        type: 'PREVIEW_THEME',
        payload: previewTheme || theme
      };
      
      socket.send(JSON.stringify(message));
      socket.close();
    });
  }, [previewTheme, theme]);
  
  // Broadcast theme save through WebSocket
  const broadcastThemeSave = useCallback(() => {
    const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/theme`);
    
    socket.addEventListener('open', () => {
      const message: WebSocketMessage = {
        type: 'SAVE_THEME'
      };
      
      socket.send(JSON.stringify(message));
      socket.close();
    });
  }, []);
  
  // Broadcast theme reset through WebSocket
  const broadcastThemeReset = useCallback(() => {
    const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/theme`);
    
    socket.addEventListener('open', () => {
      const message: WebSocketMessage = {
        type: 'RESET_THEME'
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