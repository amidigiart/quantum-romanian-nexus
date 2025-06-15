import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/hooks/useChat';
import { useOptimizedChatPersistence } from './useOptimizedChatPersistence';

export const useChatPersistence = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { queueMessage } = useOptimizedChatPersistence();

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

    if (!conversationId) {
      // Fallback to immediate save for messages without conversation
      try {
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            content: message.text,
            message_type: message.isBot ? 'assistant' : 'user',
            quantum_data: message.quantum_data || null
          })
          .select('id');

        if (error) throw error;
        onSuccess?.();
      } catch (error) {
        console.error('Error saving message:', error);
        onError?.(error);
      }
      return;
    }

    // Use batched saving for messages with conversation
    queueMessage(message, conversationId, onSuccess, onError);
  };

  const loadMessages = async (conversationId: string, limit: number = 100): Promise<ChatMessage[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, content, message_type, quantum_data, created_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(limit);

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
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, content, message_type, quantum_data, created_at')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(count);

      if (error) throw error;

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
