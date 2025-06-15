
import { useEffect } from 'react';
import { ChatMessage, useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useBotResponses } from '@/hooks/chat/useBotResponses';

interface UseChatInitializationProps {
  useEnhancedMode: boolean;
}

export const useChatInitialization = ({ useEnhancedMode }: UseChatInitializationProps) => {
  const { user } = useAuth();
  const { currentConversation } = useChat();
  const { messages, initializeWithWelcome } = useChatMessages();
  const { newsContext } = useBotResponses();

  useEffect(() => {
    if (!currentConversation && messages.length === 0 && user) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        text: `Bună ziua! Sunt asistentul dvs. cuantic avansat cu acces la ultimele știri din domeniu${useEnhancedMode ? ' și funcții AI îmbunătățite' : ''}. Pot să vă ajut cu 10 funcții cuantice hibride: algoritmi Grover/Shor, criptografie cuantică, învățare automată cuantică, optimizare QAOA, simulare VQE, și multe altele.\n\n${newsContext ? `📰 ${newsContext}` : ''}\n\n${useEnhancedMode ? '🧠 Mod AI avansat: răspunsuri contextuale și personalizate active.\n\n' : ''}Cu ce vă pot ajuta?`,
        isBot: true,
        timestamp: new Date()
      };
      initializeWithWelcome(welcomeMessage);
    }
  }, [currentConversation, user, messages.length, newsContext, useEnhancedMode, initializeWithWelcome]);
};
