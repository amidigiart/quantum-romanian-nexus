
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/hooks/useChat';
import { OptimizedChatService } from '@/services/optimizedChatService';

interface QueuedMessage {
  message: ChatMessage;
  conversationId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useMessageQueue = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Batch configuration
  const BATCH_SIZE = 10;
  const BATCH_DELAY = 1000; // 1 second

  const processBatch = useCallback(async () => {
    if (messageQueueRef.current.length === 0 || !user) return;

    const batch = messageQueueRef.current.splice(0, BATCH_SIZE);
    
    try {
      setLoading(true);
      
      // Group by conversation for batch insert
      const conversationGroups = batch.reduce((groups, item) => {
        if (!groups[item.conversationId]) {
          groups[item.conversationId] = [];
        }
        groups[item.conversationId].push(item);
        return groups;
      }, {} as Record<string, QueuedMessage[]>);

      // Process each conversation group
      for (const [conversationId, messages] of Object.entries(conversationGroups)) {
        const formattedMessages = messages.map(({ message }) => ({
          conversation_id: conversationId,
          user_id: user.id,
          content: message.text,
          message_type: message.isBot ? 'assistant' : 'user',
          quantum_data: message.quantum_data || null
        }));

        await OptimizedChatService.batchInsertMessages(formattedMessages);

        // Update conversation timestamp once per batch
        await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId)
          .eq('user_id', user.id);

        // Call success callbacks
        messages.forEach(({ onSuccess }) => onSuccess?.());
      }

      console.log(`Batch saved: ${batch.length} messages`);
      
    } catch (error) {
      console.error('Error in batch save:', error);
      
      // Call error callbacks
      batch.forEach(({ onError }) => onError?.(error));
      
      toast({
        title: "Eroare",
        description: "Nu s-au putut salva mesajele în lot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      
      // Process remaining messages if any
      if (messageQueueRef.current.length > 0) {
        batchTimeoutRef.current = setTimeout(processBatch, BATCH_DELAY);
      }
    }
  }, [user, toast]);

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

    // Add to queue
    messageQueueRef.current.push({
      message,
      conversationId,
      onSuccess,
      onError
    });

    // Process batch immediately if it reaches the size limit
    if (messageQueueRef.current.length >= BATCH_SIZE) {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
        batchTimeoutRef.current = null;
      }
      processBatch();
    } else if (!batchTimeoutRef.current) {
      // Set timeout for delayed processing
      batchTimeoutRef.current = setTimeout(processBatch, BATCH_DELAY);
    }
  }, [user, processBatch]);

  const flushQueue = useCallback(async () => {
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
    await processBatch();
  }, [processBatch]);

  return {
    queueMessage,
    flushQueue,
    loading,
    queueSize: messageQueueRef.current.length
  };
};
