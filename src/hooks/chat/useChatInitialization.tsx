
import { useEffect } from 'react';
import { ChatMessage, useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseChatInitializationProps {
  useEnhancedMode: boolean;
}

export const useChatInitialization = ({ useEnhancedMode }: UseChatInitializationProps) => {
  const { user } = useAuth();
  const { currentConversation } = useChat();
  const { messages, initializeWithWelcome } = useChatMessages();
  const { newsContext } = useBotResponses();
  const { t } = useLanguage();

  useEffect(() => {
    if (!currentConversation && messages.length === 0 && user) {
      const welcomeText = t('chat.welcome') + 
        (useEnhancedMode ? t('chat.enhanced_mode') : '') + 
        '. Pot să vă ajut cu 10 funcții cuantice hibride: algoritmi Grover/Shor, criptografie cuantică, învățare automată cuantică, optimizare QAOA, simulare VQE, și multe altele.\n\n' +
        (newsContext ? t('chat.context_news', { context: newsContext }) + '\n\n' : '') +
        (useEnhancedMode ? t('chat.advanced_mode_active') + '\n\n' : '') +
        t('chat.how_can_help');

      const welcomeMessage: ChatMessage = {
        id: '1',
        text: welcomeText,
        isBot: true,
        timestamp: new Date()
      };
      initializeWithWelcome(welcomeMessage);
    }
  }, [currentConversation, user, messages.length, newsContext, useEnhancedMode, initializeWithWelcome, t]);
};
