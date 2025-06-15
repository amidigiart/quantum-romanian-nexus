
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage, ChatConversation } from '@/hooks/useChat';

interface UseRealtimeChatUpdatesProps {
  onNewMessage?: (message: ChatMessage) => void;
  onConversationUpdate?: (conversation: ChatConversation) => void;
  onConversationDeleted?: (conversationId: string) => void;
  currentConversationId?: string;
}

export const useRealtimeChatUpdates = ({
  onNewMessage,
  onConversationUpdate,
  onConversationDeleted,
  currentConversationId
}: UseRealtimeChatUpdatesProps) => {
  const { user } = useAuth();

  const handleMessageInsert = useCallback((payload: any) => {
    console.log('Real-time message insert:', payload);
    
    if (payload.new && onNewMessage) {
      const newMessage: ChatMessage = {
        id: payload.new.id,
        text: payload.new.content,
        isBot: payload.new.message_type === 'assistant',
        timestamp: new Date(payload.new.created_at),
        quantum_data: payload.new.quantum_data
      };
      
      // Only trigger if it's for the current conversation
      if (!currentConversationId || payload.new.conversation_id === currentConversationId) {
        onNewMessage(newMessage);
      }
    }
  }, [onNewMessage, currentConversationId]);

  const handleConversationUpdate = useCallback((payload: any) => {
    console.log('Real-time conversation update:', payload);
    
    if (payload.new && onConversationUpdate) {
      const updatedConversation: ChatConversation = {
        id: payload.new.id,
        title: payload.new.title,
        created_at: payload.new.created_at,
        updated_at: payload.new.updated_at
      };
      
      onConversationUpdate(updatedConversation);
    }
  }, [onConversationUpdate]);

  const handleConversationDelete = useCallback((payload: any) => {
    console.log('Real-time conversation delete:', payload);
    
    if (payload.old && onConversationDeleted) {
      onConversationDeleted(payload.old.id);
    }
  }, [onConversationDeleted]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to message changes for the current user
    const messagesChannel = supabase
      .channel('chat_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${user.id}`
        },
        handleMessageInsert
      )
      .subscribe();

    // Subscribe to conversation changes for the current user
    const conversationsChannel = supabase
      .channel('chat_conversations_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations',
          filter: `user_id=eq.${user.id}`
        },
        handleConversationUpdate
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_conversations',
          filter: `user_id=eq.${user.id}`
        },
        handleConversationDelete
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, handleMessageInsert, handleConversationUpdate, handleConversationDelete]);
};
