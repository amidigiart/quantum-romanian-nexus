
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBotResponses } from './useBotResponses';
import { ChatMessage } from '@/hooks/useChat';

export const useChatInitialization = () => {
  const { user } = useAuth();
  const { updateNewsContext, newsContext } = useBotResponses();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (user && !isInitialized) {
      // Initialize news context
      updateNewsContext();
      setIsInitialized(true);
    }
  }, [user, updateNewsContext, isInitialized]);

  const getWelcomeMessage = (): ChatMessage => {
    const hasNews = newsContext.news && newsContext.news.length > 0;
    const newsCount = hasNews ? newsContext.news.length : 0;
    
    return {
      id: 'welcome',
      text: `Bun venit la Chatbot-ul Cuantic Român! 🚀 Sunt aici să vă ajut cu întrebări despre quantum computing. ${hasNews ? `Am ${newsCount} noutăți recente disponibile.` : 'Întrebați-mă orice despre tehnologiile cuantice!'}`,
      isBot: true,
      timestamp: new Date()
    };
  };

  return {
    isInitialized,
    welcomeMessage: getWelcomeMessage()
  };
};
