
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, ChatConversation } from '@/hooks/useChat';

export const useChatPersistence = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const saveMessage = async (
    message: ChatMessage, 
    conversationId?: string,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) => {
    if (!user) {
      onError?.(new Error('User not authenticated'));
      return;
    }

    try {
      // Optimized insert with specific columns to reduce payload
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          content: message.text,
          message_type: message.isBot ? 'assistant' : 'user',
          quantum_data: message.quantum_data || null
        })
        .select('id'); // Only select what we need

      if (error) throw error;

      // Batch update conversation timestamp to reduce database calls
      if (conversationId) {
        await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId)
          .eq('user_id', user.id); // Use compound condition for index optimization
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving message:', error);
      onError?.(error);
    }
  };

  const loadMessages = async (conversationId: string, limit: number = 100): Promise<ChatMessage[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      // Optimized query using the new indexes
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, content, message_type, quantum_data, created_at') // Only select needed columns
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id) // Add user_id filter for security and index usage
        .order('created_at', { ascending: true })
        .limit(limit); // Add pagination support

      if (error) throw error;

      return data.map(msg => ({
        id: msg.id,
        text: msg.content,
        isBot: msg.message_type === 'assistant',
        timestamp: new Date(msg.created_at),
        quantum_data: msg.quantum_data
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
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

  const loadRecentMessages = async (conversationId: string, count: number = 20): Promise<ChatMessage[]> => {
    if (!user) return [];

    try {
      // Optimized query for recent messages using descending order then reversing
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, content, message_type, quantum_data, created_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(count);

      if (error) throw error;

      // Reverse to get chronological order
      return data.reverse().map(msg => ({
        id: msg.id,
        text: msg.content,
        isBot: msg.message_type === 'assistant',
        timestamp: new Date(msg.created_at),
        quantum_data: msg.quantum_data
      }));
    } catch (error) {
      console.error('Error loading recent messages:', error);
      return [];
    }
  };

  const getMessageCount = async (conversationId: string): Promise<number> => {
    if (!user) return 0;

    try {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  };

  return {
    saveMessage,
    loadMessages,
    loadRecentMessages,
    getMessageCount,
    loading
  };
};
