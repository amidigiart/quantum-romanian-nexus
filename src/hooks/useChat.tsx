
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
    updateConversationTitle,
    loadConversations,
    loading: conversationsLoading
  } = useConversations();

  const {
    saveMessage,
    loadMessages,
    loadRecentMessages,
    getMessageCount,
    loading: messagesLoading
  } = useChatPersistence();

  const selectConversationWithMessages = async (conversation: ChatConversation) => {
    selectConversation(conversation);
    
    // Load recent messages first for better UX
    const recentMessages = await loadRecentMessages(conversation.id, 50);
    setMessages(recentMessages);
  };

  const loadMoreMessages = async (offset: number = 0) => {
    if (!currentConversation) return;
    
    const olderMessages = await loadMessages(currentConversation.id, 50);
    // In a real implementation, you'd handle pagination properly
    setMessages(olderMessages);
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading: conversationsLoading || messagesLoading,
    createConversation,
    selectConversation: selectConversationWithMessages,
    deleteConversation,
    updateConversationTitle,
    saveMessage,
    loadMoreMessages,
    getMessageCount,
    setMessages,
    loadConversations
  };
};
