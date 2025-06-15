
import { supabase } from '@/integrations/supabase/client';

export class OptimizedQueryService {
  // Batch operations for better performance
  static async batchInsertMessages(messages: any[]) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(messages)
      .select('id');

    if (error) throw error;
    return data;
  }

  // Optimized conversation search with full-text search
  static async searchConversations(userId: string, searchTerm: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .ilike('title', `%${searchTerm}%`)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  // Get conversation statistics efficiently
  static async getConversationStats(userId: string) {
    const { data: conversationCount, error: convError } = await supabase
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { data: messageCount, error: msgError } = await supabase
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

  // Optimized recent activity query
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

  // Clean up old data periodically
  static async cleanupOldData(userId: string, daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Delete old messages first
    const { error: msgError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());

    if (msgError) throw msgError;

    // Delete empty conversations
    const { error: convError } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString())
      .not('id', 'in', `(
        SELECT DISTINCT conversation_id 
        FROM chat_messages 
        WHERE user_id = '${userId}'
      )`);

    if (convError) throw convError;
  }
}
