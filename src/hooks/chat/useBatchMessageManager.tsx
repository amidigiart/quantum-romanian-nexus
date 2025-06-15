
import { useCallback } from 'react';
import { ChatMessage } from '@/hooks/useChat';
import { useBatchOperations } from './persistence/useBatchOperations';

export const useBatchMessageManager = () => {
  const { 
    addOperation, 
    flushBatch, 
    clearBatch, 
    isProcessing, 
    stats, 
    queueSize 
  } = useBatchOperations({
    maxBatchSize: 20,
    flushIntervalMs: 1500,
    priorityThresholds: {
      high: 3,
      normal: 10,
      low: 20
    }
  });

  const saveBatchedMessage = useCallback((
    message: ChatMessage,
    conversationId: string,
    options: {
      priority?: 'high' | 'normal' | 'low';
      onSuccess?: () => void;
      onError?: (error: any) => void;
    } = {}
  ) => {
    const { priority = 'normal', onSuccess, onError } = options;

    addOperation('message', message, {
      conversationId,
      priority,
      onSuccess,
      onError
    });

    console.log(`Message queued for batch save: ${message.text.substring(0, 50)}...`);
  }, [addOperation]);

  const updateConversationBatch = useCallback((
    conversationId: string,
    updates: any,
    options: {
      priority?: 'high' | 'normal' | 'low';
      onSuccess?: () => void;
      onError?: (error: any) => void;
    } = {}
  ) => {
    addOperation('conversation_update', updates, {
      conversationId,
      ...options
    });
  }, [addOperation]);

  const updatePreferencesBatch = useCallback((
    preferences: any,
    options: {
      priority?: 'high' | 'normal' | 'low';
      onSuccess?: () => void;
      onError?: (error: any) => void;
    } = {}
  ) => {
    addOperation('user_preference', preferences, options);
  }, [addOperation]);

  const forceFlush = useCallback(() => {
    return flushBatch();
  }, [flushBatch]);

  const clearQueue = useCallback(() => {
    clearBatch();
  }, [clearBatch]);

  return {
    saveBatchedMessage,
    updateConversationBatch,
    updatePreferencesBatch,
    forceFlush,
    clearQueue,
    isProcessing,
    stats,
    queueSize
  };
};
