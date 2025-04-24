import { useEffect, useRef, useState } from 'react';
import { useTheme, ThemeSettings } from '../contexts/ThemeContext';

interface ThemeMessage {
  type: 'theme_update' | 'theme_reset' | 'theme_preview' | 'theme_save';
  theme?: ThemeSettings;
  clientId?: string;
}

export function useThemeWebSocket() {
  const { setPreviewTheme, previewTheme, theme } = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<ThemeMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/theme`;
    
    console.log('Connecting to theme WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    // Connection opened
    ws.addEventListener('open', () => {
      console.log('Theme WebSocket connection established');
      setIsConnected(true);
      setError(null);
    });
    
    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const message: ThemeMessage = JSON.parse(event.data);
        console.log('Theme WebSocket message received:', message);
        
        setLastMessage(message);
        
        // Handle different message types
        if (message.type === 'theme_update' && message.theme) {
          setPreviewTheme(message.theme);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    });
    
    // Handle errors
    ws.addEventListener('error', (event) => {
      console.error('Theme WebSocket error:', event);
      setError('WebSocket connection error');
    });
    
    // Connection closed
    ws.addEventListener('close', (event) => {
      console.log('Theme WebSocket connection closed:', event.code, event.reason);
      setIsConnected(false);
      
      // Try to reconnect after a delay if the connection was established before
      if (isConnected) {
        setTimeout(() => {
          console.log('Attempting to reconnect to Theme WebSocket...');
          // The effect cleanup will handle the old connection, and the effect will run again
        }, 3000);
      }
    });
    
    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [setPreviewTheme]);
  
  // Function to send preview theme to other clients
  const sendPreviewTheme = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && previewTheme) {
      const message: ThemeMessage = {
        type: 'theme_preview',
        theme: previewTheme
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };
  
  // Function to save theme
  const broadcastThemeSave = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && previewTheme) {
      const message: ThemeMessage = {
        type: 'theme_save',
        theme: previewTheme
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };
  
  // Function to reset theme
  const broadcastThemeReset = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: ThemeMessage = {
        type: 'theme_reset'
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };
  
  return {
    isConnected,
    lastMessage,
    error,
    sendPreviewTheme,
    broadcastThemeSave,
    broadcastThemeReset
  };
}