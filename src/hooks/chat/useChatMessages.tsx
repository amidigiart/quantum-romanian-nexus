
import { useState, useEffect } from 'react';
import { ChatMessage } from '@/hooks/useChat';

export const useChatMessages = (initialMessages: ChatMessage[] = []) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set());

  const addMessage = (message: ChatMessage, isPending = false) => {
    setMessages(prev => [...prev, message]);
    
    if (isPending) {
      setPendingMessages(prev => new Set([...prev, message.id]));
    }
  };

  const addMessages = (newMessages: ChatMessage[]) => {
    setMessages(prev => [...prev, ...newMessages]);
  };

  const markMessageAsSaved = (messageId: string) => {
    setPendingMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
  };

  const updateMessageOnError = (messageId: string, errorMessage: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, text: `${msg.text} (Failed to send)`, error: true }
        : msg
    ));
    setPendingMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(messageId);
      return newSet;
    });
  };

  const clearMessages = () => {
    setMessages([]);
    setPendingMessages(new Set());
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
    initializeWithWelcome,
    markMessageAsSaved,
    updateMessageOnError,
    pendingMessages
  };
};
