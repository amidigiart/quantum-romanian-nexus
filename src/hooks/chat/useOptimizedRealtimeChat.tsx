
import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, ChatConversation } from '@/hooks/useChat';
import { useRealtimeConnection } from './realtime/useRealtimeConnection';
import { useRealtimeMessageHandlers } from './realtime/useRealtimeMessageHandlers';
import { useThrottledTypingIndicator } from './realtime/useThrottledTypingIndicator';

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
  typingThrottleDelay: 1000
};

export const useOptimizedRealtimeChat = (
  currentConversation: ChatConversation | null,
  config: Partial<RealtimeConfig> = {}
) => {
  const realtimeConfig = { ...DEFAULT_REALTIME_CONFIG, ...config };
  
  const {
    isConnected,
    connectionError,
    connectToRealtime,
    disconnectFromRealtime,
    getConnectionStats,
    subscriberId
  } = useRealtimeConnection(currentConversation, realtimeConfig);

  const {
    setMessageHandlers,
    setupMessageHandling,
    sendMessage
  } = useRealtimeMessageHandlers(currentConversation, subscriberId);

  const { sendTypingIndicator, cleanup } = useThrottledTypingIndicator(
    sendMessage,
    { throttleDelay: realtimeConfig.typingThrottleDelay }
  );

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
      cleanup();
    };
  }, [disconnectFromRealtime, cleanup]);

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
