
import { supabase } from '@/integrations/supabase/client';

export class OptimizedChatService {
  // Batch message insertion using the new database function
  static async batchInsertMessages(messages: any[]) {
    try {
      const { data, error } = await supabase.rpc('batch_insert_messages', {
        messages: messages
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in batch insert messages:', error);
      throw error;
    }
  }

  // Optimized conversation search using the new database function
  static async searchConversationsOptimized(
    userId: string, 
    searchTerm: string = '', 
    limit: number = 20, 
    offset: number = 0
  ) {
    try {
      const { data, error } = await supabase.rpc('search_conversations_optimized', {
        p_user_id: userId,
        p_search_term: searchTerm,
        p_limit: limit,
        p_offset: offset
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in optimized conversation search:', error);
      throw error;
    }
  }

  // Batch conversation cleanup
  static async cleanupOldConversations(userId: string, daysOld: number = 90) {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_conversations', {
        p_user_id: userId,
        p_days_old: daysOld
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in conversation cleanup:', error);
      throw error;
    }
  }

  // Full-text search for messages
  static async searchMessages(userId: string, searchQuery: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          message_type,
          created_at,
          conversation_id,
          chat_conversations!inner(
            id,
            title
          )
        `)
        .eq('user_id', userId)
        .textSearch('content', searchQuery)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in message search:', error);
      throw error;
    }
  }

  // Get conversation with message count and last message
  static async getConversationWithStats(userId: string, conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          chat_messages(count)
        `)
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get last message separately for better performance
      const { data: lastMessage } = await supabase
        .from('chat_messages')
        .select('content, created_at, message_type')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        ...data,
        message_count: data?.chat_messages?.[0]?.count || 0,
        last_message: lastMessage
      };
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      throw error;
    }
  }
}
