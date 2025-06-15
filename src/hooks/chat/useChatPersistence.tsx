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
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          content: message.text,
          message_type: message.isBot ? 'assistant' : 'user',
          quantum_data: message.quantum_data || null
        });

      if (error) throw error;

      // Update conversation timestamp
      if (conversationId) {
        await supabase
          .from('chat_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving message:', error);
      onError?.(error);
    }
  };

  const loadMessages = async (conversationId: string): Promise<ChatMessage[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

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

  return {
    saveMessage,
    loadMessages,
    loading
  };
};
