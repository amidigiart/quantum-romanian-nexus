
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/hooks/useChat';
import { OptimizedChatService } from '@/services/optimizedChatService';

export const useCoreMessagePersistence = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

  return {
    batchSaveMessages,
    loadMessagesOptimized,
    loading
  };
};
