import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import fs from 'fs/promises';
import path from 'path';

// Define types for messages
interface ThemeMessage {
  type: 'theme_update' | 'theme_reset' | 'theme_preview' | 'theme_save';
  theme?: {
    primary: string;
    variant: 'professional' | 'tint' | 'vibrant';
    appearance: 'light' | 'dark' | 'system';
    radius: number;
  };
  clientId?: string;
}

// Setup the WebSocket server for theme preview
export function setupThemeWebsocket(httpServer: HttpServer) {
  // Create a WebSocket server instance
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws/theme' 
  });

  console.log('Theme WebSocket server initialized on path: /ws/theme');

  // Track all connected clients
  const clients = new Map<WebSocket, string>();
  let clientIdCounter = 0;

  // Handle new connections
  wss.on('connection', (ws) => {
    const clientId = `client-${++clientIdCounter}`;
    clients.set(ws, clientId);
    
    console.log(`Theme WebSocket client connected: ${clientId}`);

    // Send initial theme to new client
    sendCurrentTheme(ws, clientId);
    
    // Handle messages from clients
    ws.on('message', async (message) => {
      try {
        const parsedMessage: ThemeMessage = JSON.parse(message.toString());
        console.log(`Received theme message from ${clientId}:`, parsedMessage.type);
        
        switch (parsedMessage.type) {
          case 'theme_preview':
            // Broadcast preview theme to all clients except sender
            if (parsedMessage.theme) {
              broadcastTheme(parsedMessage, ws);
            }
            break;
            
          case 'theme_save':
            // Save theme to theme.json and broadcast to all clients
            if (parsedMessage.theme) {
              await saveTheme(parsedMessage.theme);
              broadcastTheme({
                type: 'theme_update',
                theme: parsedMessage.theme,
                clientId
              });
            }
            break;
            
          case 'theme_reset':
            // Reload theme from file and broadcast to all clients
            const theme = await loadTheme();
            broadcastTheme({
              type: 'theme_update',
              theme,
              clientId
            });
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle disconnections
    ws.on('close', () => {
      console.log(`Theme WebSocket client disconnected: ${clientId}`);
      clients.delete(ws);
    });
  });
  
  // Check connection and broadcast to all clients
  function broadcastTheme(message: ThemeMessage, excludeWs?: WebSocket) {
    const messageStr = JSON.stringify(message);
    
    clients.forEach((clientId, client) => {
      // Only send to clients that are connected and not the sender
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
  
  // Send current theme to a specific client
  async function sendCurrentTheme(ws: WebSocket, clientId: string) {
    try {
      const theme = await loadTheme();
      
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'theme_update',
          theme,
          clientId
        }));
      }
    } catch (error) {
      console.error('Error sending current theme:', error);
    }
  }
  
  // Load theme from theme.json
  async function loadTheme() {
    try {
      const themeFile = path.join(process.cwd(), 'theme.json');
      const themeData = await fs.readFile(themeFile, 'utf8');
      return JSON.parse(themeData);
    } catch (error) {
      console.error('Error loading theme:', error);
      // Return default theme if file doesn't exist or can't be parsed
      return {
        primary: 'hsl(222, 72%, 59%)',
        variant: 'vibrant',
        appearance: 'light',
        radius: 0.5
      };
    }
  }
  
  // Save theme to theme.json
  async function saveTheme(theme: ThemeMessage['theme']) {
    try {
      if (!theme) return;
      
      const themeFile = path.join(process.cwd(), 'theme.json');
      await fs.writeFile(themeFile, JSON.stringify(theme, null, 2));
      console.log('Theme saved to theme.json');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }
  
  return wss;
}