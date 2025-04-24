import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/Button';

const WebSocketTest: React.FC = () => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const { theme } = useTheme();

  // Connect to WebSocket server
  useEffect(() => {
    const connectWebSocket = () => {
      setStatus('connecting');
      
      // Determine WebSocket protocol based on page protocol
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/theme`;
      
      // Create new WebSocket connection
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // WebSocket event handlers
      socket.onopen = () => {
        setStatus('connected');
        setMessages(prev => [...prev, 'Connected to WebSocket server']);
        
        // Send initial message
        const message = {
          type: 'theme_update',
          clientId: 'test-client',
          theme: theme
        };
        socket.send(JSON.stringify(message));
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, `Received: ${JSON.stringify(data, null, 2)}`]);
        } catch (err) {
          setMessages(prev => [...prev, `Received (non-JSON): ${event.data}`]);
        }
      };
      
      socket.onerror = (error) => {
        setMessages(prev => [...prev, `WebSocket Error: ${JSON.stringify(error)}`]);
      };
      
      socket.onclose = (event) => {
        setStatus('disconnected');
        setMessages(prev => [...prev, `WebSocket Closed: Code ${event.code}, Reason: ${event.reason || 'No reason provided'}`]);
      };
      
      // Cleanup on unmount
      return () => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        }
      };
    };
    
    connectWebSocket();
    
    // Clean up on component unmount
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, [theme]);
  
  // Send a test message
  const sendTestMessage = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'theme_preview',
        clientId: 'test-client',
        theme: {
          ...theme,
          primary: 'hsl(240, 100%, 50%)', // Change to blue for testing
        }
      };
      
      socketRef.current.send(JSON.stringify(message));
      setMessages(prev => [...prev, `Sent: ${JSON.stringify(message, null, 2)}`]);
    } else {
      setMessages(prev => [...prev, 'Cannot send message: WebSocket not connected']);
    }
  };
  
  // Send a custom message
  const sendCustomMessage = () => {
    if (!inputMessage.trim()) return;
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        // Try to send as JSON if possible
        const parsed = JSON.parse(inputMessage);
        socketRef.current.send(JSON.stringify(parsed));
        setMessages(prev => [...prev, `Sent: ${JSON.stringify(parsed, null, 2)}`]);
      } catch (e) {
        // Send as plain text if not valid JSON
        socketRef.current.send(inputMessage);
        setMessages(prev => [...prev, `Sent (plain text): ${inputMessage}`]);
      }
      
      setInputMessage('');
    } else {
      setMessages(prev => [...prev, 'Cannot send message: WebSocket not connected']);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">WebSocket Connection Test</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>WebSocket Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div 
                className={`h-3 w-3 rounded-full ${
                  status === 'connected' ? 'bg-green-500' : 
                  status === 'connecting' ? 'bg-amber-500' : 'bg-red-500'
                }`} 
              />
              <span className="capitalize">{status}</span>
            </div>
            
            <div className="space-y-2">
              <Button onClick={sendTestMessage} className="mr-2">
                Send Test Theme
              </Button>
              
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Enter message (JSON or text)"
                  className="flex-1 p-2 border rounded"
                />
                <Button onClick={sendCustomMessage}>Send</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Message Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto bg-muted/20 p-3 rounded border border-border">
              {messages.length === 0 ? (
                <p className="text-muted-foreground italic">No messages yet...</p>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg, index) => (
                    <div key={index} className="text-sm font-mono bg-background p-2 rounded">
                      {msg}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => setMessages([])}
              className="mr-2"
            >
              Clear Log
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default WebSocketTest;