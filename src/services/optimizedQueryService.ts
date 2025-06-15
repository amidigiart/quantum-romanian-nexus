
import { supabase } from '@/integrations/supabase/client';

export class OptimizedQueryService {
  // Batch operations for better performance
  static async batchInsertMessages(messages: any[]) {
    const { data, error } = await supabase.rpc('batch_insert_messages', {
      messages: messages
    });

    if (error) throw error;
    return data;
  }

  // Optimized conversation search with full-text search
  static async searchConversations(userId: string, searchTerm: string, limit: number = 10) {
    const { data, error } = await supabase.rpc('search_conversations_optimized', {
      p_user_id: userId,
      p_search_term: searchTerm,
      p_limit: limit,
      p_offset: 0
    });

    if (error) throw error;
    return data;
  }

  // Get conversation statistics efficiently
  static async getConversationStats(userId: string) {
    const { count: conversationCount, error: convError } = await supabase
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: messageCount, error: msgError } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (convError || msgError) {
      throw convError || msgError;
    }

    return {
      totalConversations: conversationCount || 0,
      totalMessages: messageCount || 0
    };
  }

  // Optimized recent activity query using indexed columns
  static async getRecentActivity(userId: string, limit: number = 5) {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        id, 
        title, 
        updated_at,
        chat_messages!inner(
          content,
          message_type,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Clean up old data using the new database function
  static async cleanupOldData(userId: string, daysToKeep: number = 90) {
    const { data, error } = await supabase.rpc('cleanup_old_conversations', {
      p_user_id: userId,
      p_days_old: daysToKeep
    });

    if (error) throw error;
    return data;
  }

  // Get messages with quantum data efficiently
  static async getMessagesWithQuantumData(conversationId: string, userId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, content, message_type, quantum_data, created_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .not('quantum_data', 'is', null)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
}
