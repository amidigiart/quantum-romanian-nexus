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

export const useOptimizedChatPersistence = () => {
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

  const batchSaveMessages = async (
    messages: ChatMessage[], 
    conversationId: string,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    if (!user) {
      onError?.(new Error('User not authenticated'));
      return;
    }

    try {
      setLoading(true);
      
      // Format messages for batch insert
      const formattedMessages = messages.map(message => ({
        conversation_id: conversationId,
        user_id: user.id,
        content: message.text,
        message_type: message.isBot ? 'assistant' : 'user',
        quantum_data: message.quantum_data || null
      }));

      await OptimizedChatService.batchInsertMessages(formattedMessages);
      onSuccess?.();
    } catch (error) {
      console.error('Error in batch save messages:', error);
      onError?.(error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut salva mesajele",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessagesOptimized = async (
    conversationId: string, 
    limit: number = 100,
    offset: number = 0
  ): Promise<ChatMessage[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      // Use the optimized query with proper indexing
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, content, message_type, quantum_data, created_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data.map(msg => ({
        id: msg.id,
        text: msg.content,
        isBot: msg.message_type === 'assistant',
        timestamp: new Date(msg.created_at),
        quantum_data: msg.quantum_data
      }));
    } catch (error) {
      console.error('Error loading optimized messages:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca mesajele",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const searchConversations = async (
    searchTerm: string, 
    limit: number = 20, 
    offset: number = 0
  ) => {
    if (!user) return [];

    try {
      return await OptimizedChatService.searchConversationsOptimized(
        user.id, 
        searchTerm, 
        limit, 
        offset
      );
    } catch (error) {
      console.error('Error searching conversations:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut căuta conversațiile",
        variant: "destructive",
      });
      return [];
    }
  };

  const searchMessages = async (searchQuery: string, limit: number = 50) => {
    if (!user) return [];

    try {
      return await OptimizedChatService.searchMessages(user.id, searchQuery, limit);
    } catch (error) {
      console.error('Error searching messages:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut căuta mesajele",
        variant: "destructive",
      });
      return [];
    }
  };

  const cleanupOldData = async (daysOld: number = 90) => {
    if (!user) return 0;

    try {
      const deletedCount = await OptimizedChatService.cleanupOldConversations(user.id, daysOld);
      
      toast({
        title: "Succes",
        description: `Au fost șterse ${deletedCount} conversații vechi`,
      });
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut șterge datele vechi",
        variant: "destructive",
      });
      return 0;
    }
  };

  return {
    queueMessage,
    flushQueue,
    batchSaveMessages,
    loadMessagesOptimized,
    searchConversations,
    searchMessages,
    cleanupOldData,
    loading,
    queueSize: messageQueueRef.current.length
  };
};
