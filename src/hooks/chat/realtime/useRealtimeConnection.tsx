
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatConversation } from '@/hooks/useChat';
import { websocketPool } from '@/services/websocketPoolManager';

interface RealtimeConnectionConfig {
  autoReconnect: boolean;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export const useRealtimeConnection = (
  currentConversation: ChatConversation | null,
  config: RealtimeConnectionConfig
) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const subscriberIdRef = useRef<string>();

  // Generate unique subscriber ID
  useEffect(() => {
    subscriberIdRef.current = `chat-${user?.id}-${Date.now()}`;
  }, [user?.id]);

  const connectToRealtime = useCallback(async () => {
    if (!user || !currentConversation || !subscriberIdRef.current) return;

    try {
      const wsUrl = `wss://your-realtime-server.com/conversations/${currentConversation.id}`;
      const socket = await websocketPool.getConnection(wsUrl);
      
      websocketPool.subscribe(wsUrl, subscriberIdRef.current);

      socket.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        console.log('Realtime connection established');
      };

      socket.onerror = (error) => {
        setConnectionError('Connection error occurred');
        console.error('Realtime connection error:', error);
      };

      socket.onclose = () => {
        setIsConnected(false);
        console.log('Realtime connection closed');
      };

    } catch (error) {
      setConnectionError('Failed to establish connection');
      console.error('Error connecting to realtime:', error);
    }
  }, [user, currentConversation]);

  const disconnectFromRealtime = useCallback(() => {
    if (!currentConversation || !subscriberIdRef.current) return;

    const wsUrl = `wss://your-realtime-server.com/conversations/${currentConversation.id}`;
    websocketPool.unsubscribe(wsUrl, subscriberIdRef.current);
    
    setIsConnected(false);
    setConnectionError(null);
  }, [currentConversation]);

  const getConnectionStats = useCallback(() => {
    return websocketPool.getPoolStats();
  }, []);

  return {
    isConnected,
    connectionError,
    connectToRealtime,
    disconnectFromRealtime,
    getConnectionStats,
    subscriberId: subscriberIdRef.current
  };
};
