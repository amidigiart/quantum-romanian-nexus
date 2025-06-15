
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage, ChatConversation } from '@/hooks/useChat';
import { websocketPool } from '@/services/websocketPoolManager';
import { useMemoryManagement } from './useMemoryManagement';

interface RealtimeConfig {
  autoReconnect: boolean;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  typingThrottleDelay: number;
}

const DEFAULT_REALTIME_CONFIG: RealtimeConfig = {
  autoReconnect: true,
  maxReconnectAttempts: 3,
  heartbeatInterval: 30000,
  typingThrottleDelay: 1000 // Throttle typing indicators to max once per second
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
  const lastTypingIndicatorRef = useRef<number>(0);
  const typingIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Throttled typing indicator function
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!isConnected || !currentConversation) return;

    const now = Date.now();
    
    // Clear any pending timeout
    if (typingIndicatorTimeoutRef.current) {
      clearTimeout(typingIndicatorTimeoutRef.current);
      typingIndicatorTimeoutRef.current = null;
    }

    if (isTyping) {
      // Throttle typing start indicators
      if (now - lastTypingIndicatorRef.current < realtimeConfig.typingThrottleDelay) {
        // If we're within the throttle window, schedule for later
        typingIndicatorTimeoutRef.current = setTimeout(() => {
          sendTypingIndicatorImmediate(true);
        }, realtimeConfig.typingThrottleDelay - (now - lastTypingIndicatorRef.current));
        return;
      }
    }

    // Send immediately for stop typing or if throttle period has passed
    sendTypingIndicatorImmediate(isTyping);
  }, [isConnected, currentConversation, user?.id, realtimeConfig.typingThrottleDelay]);

  // Internal function to send typing indicator without throttling
  const sendTypingIndicatorImmediate = useCallback((isTyping: boolean) => {
    if (!isConnected || !currentConversation) return;

    const wsUrl = `wss://your-realtime-server.com/conversations/${currentConversation.id}`;
    const socket = websocketPool.subscribe(wsUrl, subscriberIdRef.current!);
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing',
        payload: { isTyping, userId: user?.id, timestamp: Date.now() }
      }));
      
      if (isTyping) {
        lastTypingIndicatorRef.current = Date.now();
        console.log('Sent typing indicator (throttled)');
      } else {
        console.log('Sent stop typing indicator');
      }
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

  useEffect(() => {
    return () => {
      disconnectFromRealtime();
      if (typingIndicatorTimeoutRef.current) {
        clearTimeout(typingIndicatorTimeoutRef.current);
      }
    };
  }, [disconnectFromRealtime]);

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
