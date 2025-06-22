
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, ChatConversation } from '@/hooks/useChat';
import { optimizedQueryExecutor } from '@/services/database/optimizedQueryExecutor';

export const useOptimizedQueryPersistence = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const searchConversationsOptimized = useCallback(async (
    searchTerm: string = '',
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const results = await optimizedQueryExecutor.executeConversationSearch(
        user.id,
        searchTerm,
        limit,
        offset
      );
      
      return results;
    } catch (error) {
      console.error('Error in optimized conversation search:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut căuta conversațiile",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const searchMessagesOptimized = useCallback(async (
    searchQuery: string,
    limit: number = 50
  ): Promise<any[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const results = await optimizedQueryExecutor.executeMessageSearch(
        user.id,
        searchQuery,
        limit
      );
      
      return results;
    } catch (error) {
      console.error('Error in optimized message search:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut căuta mesajele",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const loadMessagesOptimized = useCallback(async (
    conversationId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<ChatMessage[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const data = await optimizedQueryExecutor.executeMessagesLoad(
        conversationId,
        user.id,
        limit,
        offset
      );

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
  }, [user, toast]);

  const batchSaveMessagesOptimized = useCallback(async (
    messages: ChatMessage[],
    conversationId: string
  ): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      const formattedMessages = messages.map(message => ({
        conversation_id: conversationId,
        user_id: user.id,
        content: message.text,
        message_type: message.isBot ? 'assistant' : 'user',
        quantum_data: message.quantum_data || null
      }));

      await optimizedQueryExecutor.executeBatchInsert(
        'chat_messages',
        formattedMessages,
        {
          batchSize: 30,
          delayBetweenBatches: 50
        }
      );

      // Invalidate relevant caches
      await optimizedQueryExecutor.invalidateCache([
        `conversation:${conversationId}`,
        `user:${user.id}`
      ]);

      console.log(`Batch saved ${messages.length} messages for conversation ${conversationId}`);
    } catch (error) {
      console.error('Error in batch save messages:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut salva mesajele",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const preloadConversationData = useCallback(async (
    conversationIds: string[]
  ): Promise<void> => {
    if (!user) return;

    const queries = conversationIds.map(conversationId => ({
      key: `messages:${conversationId}:50:0`,
      builder: () => optimizedQueryExecutor.executeMessagesLoad(conversationId, user.id, 50, 0),
      options: { priority: 'low' as const }
    }));

    await optimizedQueryExecutor.preloadQueries(queries);
    console.log(`Preloaded data for ${conversationIds.length} conversations`);
  }, [user]);

  const invalidateUserCache = useCallback(async (): Promise<void> => {
    if (!user) return;

    const invalidatedCount = await optimizedQueryExecutor.invalidateCache([`user:${user.id}`]);
    console.log(`Invalidated ${invalidatedCount} cache entries for user ${user.id}`);
  }, [user]);

  const getPerformanceMetrics = useCallback(() => {
    return {
      connection: optimizedQueryExecutor.getConnectionMetrics(),
      cache: optimizedQueryExecutor.getCacheMetrics()
    };
  }, []);

  return {
    searchConversationsOptimized,
    searchMessagesOptimized,
    loadMessagesOptimized,
    batchSaveMessagesOptimized,
    preloadConversationData,
    invalidateUserCache,
    getPerformanceMetrics,
    loading
  };
};
