import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

/**
 * Component that handles WebSocket connections and notifications
 * for real-time updates in the merchant application system
 */
export function WebSocketHandler() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) return;
    
    // Only connect to WebSocket if user is admin
    if (user.role !== 'admin') return;
    
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    
    // When connection opens, subscribe to admin-dashboard channel
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({
        type: 'subscribe',
        userId: user.id,
        channels: ['admin-dashboard']
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
    
    // Clean up socket connection on unmount
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [user, toast]);
  
  // This component doesn't render anything
  return null;
}