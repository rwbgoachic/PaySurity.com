import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

/**
 * Component that handles WebSocket connections and notifications
 * for real-time updates in the merchant application system
 * 
 * Includes improved connection management with retry logic and connection state tracking
 */
export function WebSocketHandler() {
  const { user } = useAuth();
  const { toast } = useToast();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);
  const MAX_RETRIES = 3;
  const RECONNECT_DELAY = 5000; // 5 seconds
  const retryCountRef = useRef(0);
  
  // Function to create a new WebSocket connection
  const createWebSocketConnection = () => {
    // Only connect if user is logged in
    if (!user || !user.id) return;
    
    // Close existing connection if there is one
    if (socketRef.current && 
        (socketRef.current.readyState === WebSocket.OPEN || 
         socketRef.current.readyState === WebSocket.CONNECTING)) {
      socketRef.current.close();
    }
    
    // Connection parameters
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      
      // When connection opens
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setConnected(true);
        retryCountRef.current = 0; // Reset retry counter on successful connection
        
        // Determine channels based on user role
        const channels = [];
        
        if (user.role === 'admin') {
          channels.push('admin-dashboard');
        }
        
        // Special channel for merchant users based on their department or organization
        if (user.role === 'executive' || user.role === 'employer') {
          channels.push('merchant');
        }
        
        if (user.role === 'affiliate') {
          channels.push('affiliate');
        }
        
        // Add general notification channel for all users
        channels.push('notifications');
        
        // Subscribe to channels
        socket.send(JSON.stringify({
          type: 'subscribe',
          userId: user.id,
          channels
        }));
      });
      
      // Handle incoming messages
      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'new-merchant-application':
              toast({
                title: 'New Application',
                description: `${data.data.businessName} has submitted a new merchant application`,
                variant: 'default' as "default" | "destructive"
              });
              break;
              
            case 'application-status-update':
              const statusColors: Record<string, "default" | "destructive"> = {
                pending: 'default',
                reviewing: 'default',
                approved: 'default',
                rejected: 'destructive'
              };
              
              const variant = statusColors[data.data.status as string] || 'default';
              
              toast({
                title: 'Application Status Updated',
                description: `${data.data.businessName}'s application status changed to ${data.data.status}`,
                variant: variant as "default" | "destructive"
              });
              break;
              
            default:
              // Ignore unknown message types
              break;
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      });
      
      // Handle connection errors
      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
      });
      
      // Handle connection close
      socket.addEventListener('close', (event) => {
        console.log(`WebSocket closed. Code: ${event.code}, Reason: ${event.reason}`);
        setConnected(false);
        
        // Attempt to reconnect if closed unexpectedly and under max retries
        if (!event.wasClean && retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          console.log(`Reconnecting... Attempt ${retryCountRef.current} of ${MAX_RETRIES}`);
          
          // Schedule reconnection
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            createWebSocketConnection();
          }, RECONNECT_DELAY);
        }
      });
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  };
  
  useEffect(() => {
    createWebSocketConnection();
    
    // Clean up on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [user]);
  
  // This component doesn't render anything
  return null;
}