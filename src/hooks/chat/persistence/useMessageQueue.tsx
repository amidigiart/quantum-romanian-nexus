
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/hooks/useChat';
import { useBatchOperations } from './useBatchOperations';

export const useMessageQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { 
    addOperation, 
    flushBatch, 
    isProcessing,
    stats,
    queueSize 
  } = useBatchOperations({
    maxBatchSize: 15,
    flushIntervalMs: 1000,
    priorityThresholds: {
      high: 2,
      normal: 8,
      low: 15
    }
  });

  const queueMessage = useCallback((
    message: ChatMessage,
    conversationId: string,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    if (!user) {
      onError?.(new Error('User not authenticated'));
      return;
    }

    addOperation('message', message, {
      conversationId,
      priority: 'normal',
      onSuccess: () => {
        console.log(`Message saved successfully: ${message.text.substring(0, 30)}...`);
        onSuccess?.();
      },
      onError: (error) => {
        console.error('Failed to save message:', error);
        toast({
          title: "Message Save Error",
          description: "Failed to save message to database",
          variant: "destructive",
        });
        onError?.(error);
      }
    });
  }, [user, addOperation, toast]);

  const queueHighPriorityMessage = useCallback((
    message: ChatMessage,
    conversationId: string,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    if (!user) {
      onError?.(new Error('User not authenticated'));
      return;
    }

    addOperation('message', message, {
      conversationId,
      priority: 'high',
      onSuccess,
      onError
    });
  }, [user, addOperation]);

  const flushQueue = useCallback(async () => {
    setLoading(true);
    try {
      await flushBatch();
    } finally {
      setLoading(false);
    }
  }, [flushBatch]);

  return {
    queueMessage,
    queueHighPriorityMessage,
    flushQueue,
    loading: loading || isProcessing,
    queueSize,
    stats
  };
};
