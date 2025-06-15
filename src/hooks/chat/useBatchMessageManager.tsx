
import { useCallback, useRef, useEffect } from 'react';
import { useOptimizedChatPersistence } from './useOptimizedChatPersistence';
import { ChatMessage } from '@/hooks/useChat';

export const useBatchMessageManager = () => {
  const { queueMessage, flushQueue, queueSize } = useOptimizedChatPersistence();
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-flush queue when component unmounts or page unloads
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushQueue();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && queueSize > 0) {
        flushQueue();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      // Flush any remaining messages
      if (queueSize > 0) {
        flushQueue();
      }
    };
  }, [flushQueue, queueSize]);

  const saveBatchedMessage = useCallback((
    message: ChatMessage,
    conversationId: string,
    options: {
      priority?: 'high' | 'normal';
      onSuccess?: () => void;
      onError?: (error: any) => void;
    } = {}
  ) => {
    const { priority = 'normal', onSuccess, onError } = options;

    queueMessage(message, conversationId, onSuccess, onError);

    // For high priority messages, flush immediately
    if (priority === 'high') {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
        flushTimeoutRef.current = null;
      }
      flushQueue();
    }
  }, [queueMessage, flushQueue]);

  const forceFlush = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
    return flushQueue();
  }, [flushQueue]);

  return {
    saveBatchedMessage,
    forceFlush,
    queueSize
  };
};
