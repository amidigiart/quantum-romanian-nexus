
import { useCallback } from 'react';
import { ChatMessage, useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useAnalytics } from '@/hooks/useAnalytics';

interface UseMessageHandlersProps {
  useEnhancedMode: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  sendTypingIndicator: (isTyping: boolean) => void;
}

export const useMessageHandlers = ({
  useEnhancedMode,
  inputValue,
  setInputValue,
  sendTypingIndicator
}: UseMessageHandlersProps) => {
  const { user } = useAuth();
  const { saveMessage, currentConversation } = useChat();
  const { generateBotResponse } = useBotResponses();
  const { 
    addMessage, 
    markMessageAsSaved, 
    updateMessageOnError
  } = useChatMessages();
  
  const { trackEvent, trackUserAction, trackPerformance, trackCacheOperation } = useAnalytics({
    component: 'MessageHandlers',
    trackClicks: true,
    trackPageViews: true,
    trackErrors: true
  });

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !user) return;

    const startTime = performance.now();
    
    trackUserAction('message_sent', {
      message_length: inputValue.length,
      has_conversation: !!currentConversation,
      enhanced_mode: useEnhancedMode
    });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    addMessage(userMessage, true);
    setInputValue('');
    sendTypingIndicator(false);

    saveMessage(
      userMessage, 
      currentConversation?.id,
      () => {
        markMessageAsSaved(userMessage.id);
        trackEvent('message_saved', { message_id: userMessage.id });
      },
      (error) => {
        updateMessageOnError(userMessage.id, 'Failed to send message');
        trackEvent('message_save_error', { error: error.message });
      }
    );

    setTimeout(async () => {
      try {
        const botResponseStartTime = performance.now();
        const botResponseText = await generateBotResponse(inputValue, currentConversation?.id);
        const botResponseTime = performance.now() - botResponseStartTime;
        
        trackPerformance('bot_response_generation', botResponseTime, {
          input_length: inputValue.length,
          response_length: botResponseText.length,
          enhanced_mode: useEnhancedMode
        });

        if (botResponseTime < 100) {
          trackCacheOperation('hit', inputValue);
        } else {
          trackCacheOperation('miss', inputValue);
        }
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          isBot: true,
          timestamp: new Date()
        };
        
        addMessage(botMessage, true);
        markMessageAsSaved(botMessage.id);
        
        trackEvent('bot_response_received', {
          response_time: botResponseTime,
          message_id: botMessage.id,
          enhanced_mode: useEnhancedMode
        });
      } catch (error) {
        console.error('Error generating bot response:', error);
        
        trackEvent('bot_response_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          input: inputValue.substring(0, 50),
          enhanced_mode: useEnhancedMode
        });
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Ne pare rău, am întâmpinat o problemă tehnică. Vă rugăm să încercați din nou.',
          isBot: true,
          timestamp: new Date()
        };
        addMessage(errorMessage, false);
      }

      const totalTime = performance.now() - startTime;
      trackPerformance('complete_message_interaction', totalTime);
    }, 500);
  }, [inputValue, user, currentConversation, useEnhancedMode, addMessage, setInputValue, sendTypingIndicator, saveMessage, markMessageAsSaved, updateMessageOnError, generateBotResponse, trackEvent, trackUserAction, trackPerformance, trackCacheOperation]);

  const handleQuickAction = useCallback((action: string) => {
    trackUserAction('quick_action_used', {
      action,
      action_length: action.length,
      enhanced_mode: useEnhancedMode
    });
    
    setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  }, [trackUserAction, useEnhancedMode, setInputValue, sendMessage]);

  return {
    sendMessage,
    handleQuickAction
  };
};
