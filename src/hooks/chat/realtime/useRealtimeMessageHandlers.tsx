
import { useCallback, useRef } from 'react';
import { ChatMessage, ChatConversation } from '@/hooks/useChat';
import { websocketPool } from '@/services/websocketPoolManager';
import { useMemoryManagement } from '../useMemoryManagement';

interface MessageHandlers {
  onMessage?: (message: ChatMessage) => void;
  onConversationUpdate?: (conversation: ChatConversation) => void;
}

export const useRealtimeMessageHandlers = (
  currentConversation: ChatConversation | null,
  subscriberId: string | undefined
) => {
  const { checkMemoryPressure } = useMemoryManagement();
  const messageHandlersRef = useRef<MessageHandlers>({});

  const setMessageHandlers = useCallback((handlers: MessageHandlers) => {
    messageHandlersRef.current = handlers;
  }, []);

  const setupMessageHandling = useCallback((socket: WebSocket) => {
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
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
            console.log('Heartbeat received');
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
        
        checkMemoryPressure();
        
      } catch (error) {
        console.error('Error parsing realtime message:', error);
      }
    };
  }, [checkMemoryPressure]);

  const sendMessage = useCallback((messageType: string, payload: any) => {
    if (!currentConversation || !subscriberId) return;

    const wsUrl = `wss://your-realtime-server.com/conversations/${currentConversation.id}`;
    const socket = websocketPool.subscribe(wsUrl, subscriberId);
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: messageType,
        payload: { ...payload, timestamp: Date.now() }
      }));
    }
  }, [currentConversation, subscriberId]);

  return {
    setMessageHandlers,
    setupMessageHandling,
    sendMessage
  };
};
