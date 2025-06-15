
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage, ChatConversation } from '@/hooks/useChat';
import { websocketPool } from '@/services/websocketPoolManager';
import { useMemoryManagement } from './useMemoryManagement';

interface RealtimeConfig {
  autoReconnect: boolean;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

const DEFAULT_REALTIME_CONFIG: RealtimeConfig = {
  autoReconnect: true,
  maxReconnectAttempts: 3,
  heartbeatInterval: 30000
};

export const useOptimizedRealtimeChat = (
  currentConversation: ChatConversation | null,
  config: Partial<RealtimeConfig> = {}
) => {
  const { user } = useAuth();
  const { checkMemoryPressure } = useMemoryManagement();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const realtimeConfig = { ...DEFAULT_REALTIME_CONFIG, ...config };
  
  const subscriberIdRef = useRef<string>();
  const messageHandlersRef = useRef<{
    onMessage?: (message: ChatMessage) => void;
    onConversationUpdate?: (conversation: ChatConversation) => void;
  }>({});

  // Generate unique subscriber ID
  useEffect(() => {
    subscriberIdRef.current = `chat-${user?.id}-${Date.now()}`;
  }, [user?.id]);

  // Set up message handlers
  const setMessageHandlers = useCallback((handlers: {
    onMessage?: (message: ChatMessage) => void;
    onConversationUpdate?: (conversation: ChatConversation) => void;
  }) => {
    messageHandlersRef.current = handlers;
  }, []);

  // Connect to realtime updates
  const connectToRealtime = useCallback(async () => {
    if (!user || !currentConversation || !subscriberIdRef.current) return;

    try {
      // Use WebSocket pool for connection management
      const wsUrl = `wss://your-realtime-server.com/conversations/${currentConversation.id}`;
      const socket = await websocketPool.getConnection(wsUrl);
      
      // Subscribe to this connection
      websocketPool.subscribe(wsUrl, subscriberIdRef.current);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different message types
          switch (data.type) {
            case 'message':
              const message: ChatMessage = {
                id: data.payload.id,
                text: data.payload.content,
                isBot: data.payload.message_type === 'assistant',
                timestamp: new Date(data.payload.created_at),
                quantum_data: data.payload.quantum_data
              };
              messageHandlersRef.current.onMessage?.(message);
              break;
              
            case 'conversation_update':
              const conversation: ChatConversation = {
                id: data.payload.id,
                title: data.payload.title,
                created_at: data.payload.created_at,
                updated_at: data.payload.updated_at
              };
              messageHandlersRef.current.onConversationUpdate?.(conversation);
              break;
              
            case 'heartbeat':
              // Handle heartbeat response
              console.log('Heartbeat received');
              break;
              
            default:
              console.log('Unknown message type:', data.type);
          }
          
          // Check memory pressure on each message
          checkMemoryPressure();
          
        } catch (error) {
          console.error('Error parsing realtime message:', error);
        }
      };

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
  }, [user, currentConversation, checkMemoryPressure]);

  // Disconnect from realtime
  const disconnectFromRealtime = useCallback(() => {
    if (!currentConversation || !subscriberIdRef.current) return;

    const wsUrl = `wss://your-realtime-server.com/conversations/${currentConversation.id}`;
    websocketPool.unsubscribe(wsUrl, subscriberIdRef.current);
    
    setIsConnected(false);
    setConnectionError(null);
  }, [currentConversation]);

  // Send typing indicator (throttled)
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!isConnected || !currentConversation) return;

    const wsUrl = `wss://your-realtime-server.com/conversations/${currentConversation.id}`;
    const socket = websocketPool.subscribe(wsUrl, subscriberIdRef.current!);
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing',
        payload: { isTyping, userId: user?.id }
      }));
    }
  }, [isConnected, currentConversation, user?.id]);

  // Connect when conversation changes
  useEffect(() => {
    if (currentConversation) {
      connectToRealtime();
    }

    return () => {
      disconnectFromRealtime();
    };
  }, [currentConversation, connectToRealtime, disconnectFromRealtime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromRealtime();
    };
  }, [disconnectFromRealtime]);

  // Get connection statistics
  const getConnectionStats = useCallback(() => {
    return websocketPool.getPoolStats();
  }, []);

  return {
    isConnected,
    connectionError,
    setMessageHandlers,
    sendTypingIndicator,
    connectToRealtime,
    disconnectFromRealtime,
    getConnectionStats
  };
};
