
import { useState } from 'react';
import { useConversations } from '@/hooks/chat/useConversations';
import { useChatPersistence } from '@/hooks/chat/useChatPersistence';

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  quantum_data?: any;
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const {
    conversations,
    currentConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    loadConversations
  } = useConversations();

  const {
    saveMessage,
    loadMessages,
    loading
  } = useChatPersistence();

  const selectConversationWithMessages = async (conversation: ChatConversation) => {
    selectConversation(conversation);
    const loadedMessages = await loadMessages(conversation.id);
    setMessages(loadedMessages);
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    createConversation,
    selectConversation: selectConversationWithMessages,
    deleteConversation,
    saveMessage,
    setMessages,
    loadConversations
  };
};
