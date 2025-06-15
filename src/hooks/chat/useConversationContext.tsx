
import { useState, useCallback } from 'react';
import { ConversationContext } from './types/conversationTypes';
import { analyzeUserExpertise, extractTopicsAdvanced, extractPreferencesAdvanced, inferResponseStyle } from './utils/contextAnalysis';

export const useConversationContext = () => {
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    recentMessages: [],
    topics: [],
    userPreferences: [],
    conversationFlow: [],
    userExpertiseLevel: 'intermediate',
    preferredResponseStyle: 'detailed'
  });

  const updateConversationContext = useCallback((message: string, response: string) => {
    setConversationContext(prev => {
      const newFlow = [...prev.conversationFlow, { 
        question: message, 
        response, 
        timestamp: new Date() 
      }].slice(-15); // Keep last 15 interactions

      const allMessages = [...prev.recentMessages, message, response];
      const newExpertiseLevel = analyzeUserExpertise(allMessages);

      return {
        recentMessages: allMessages.slice(-8),
        topics: [...new Set([...prev.topics, ...extractTopicsAdvanced(message)]).values()].slice(-12),
        userPreferences: [...new Set([...prev.userPreferences, ...extractPreferencesAdvanced(message)]).values()].slice(-8),
        conversationFlow: newFlow,
        userExpertiseLevel: newExpertiseLevel,
        preferredResponseStyle: inferResponseStyle(message, prev.preferredResponseStyle)
      };
    });
  }, []);

  return {
    conversationContext,
    setConversationContext,
    updateConversationContext
  };
};
