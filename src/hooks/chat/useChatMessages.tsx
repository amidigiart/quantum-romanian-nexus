
import { useState, useEffect } from 'react';
import { ChatMessage } from '@/hooks/useChat';

export const useChatMessages = (initialMessages: ChatMessage[] = []) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const addMessages = (newMessages: ChatMessage[]) => {
    setMessages(prev => [...prev, ...newMessages]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const initializeWithWelcome = (welcomeMessage: ChatMessage) => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
  };

  return {
    messages,
    setMessages,
    addMessage,
    addMessages,
    clearMessages,
    initializeWithWelcome
  };
};
