
import { supabase } from '@/integrations/supabase/client';

export class OptimizedChatService {
  // Batch message insertion using direct INSERT with VALUES
  static async batchInsertMessages(messages: any[]) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messages);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in batch insert messages:', error);
      throw error;
    }
  }

  // Optimized conversation search using direct SQL query
  static async searchConversationsOptimized(
    userId: string, 
    searchTerm: string = '', 
    limit: number = 20, 
    offset: number = 0
  ) {
    try {
      let query = supabase
        .from('chat_conversations')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          chat_messages(count)
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to include message count and get last message
      const transformedData = await Promise.all(
        (data || []).map(async (conv) => {
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('content, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conv,
            message_count: conv.chat_messages?.[0]?.count || 0,
            last_message: lastMessage?.content || null
          };
        })
      );

      return transformedData;
    } catch (error) {
      console.error('Error in optimized conversation search:', error);
      throw error;
    }
  }

  // Batch conversation cleanup using direct DELETE
  static async cleanupOldConversations(userId: string, daysOld: number = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('user_id', userId)
        .lt('updated_at', cutoffDate.toISOString());

      if (error) throw error;
      return (data as any[])?.length ?? 0;
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
