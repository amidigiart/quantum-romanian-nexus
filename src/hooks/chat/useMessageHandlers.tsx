
import { useCallback } from 'react';
import { ChatMessage, useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUnifiedMessageProcessor } from './useUnifiedMessageProcessor';

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
  const { 
    addMessage, 
    markMessageAsSaved, 
    updateMessageOnError
  } = useChatMessages();
  
  const { trackEvent, trackUserAction, trackPerformance } = useAnalytics({
    component: 'MessageHandlers',
    trackClicks: true,
    trackPageViews: true,
    trackErrors: true
  });

  // Use unified message processor for consistency
  const { processMessage } = useUnifiedMessageProcessor({
    conversationId: currentConversation?.id,
    onMessageAdd: (message, shouldSave) => addMessage(message, shouldSave),
    onMessageSave: (message, conversationId, options) => {
      saveMessage(
        message,
        conversationId,
        () => {
          markMessageAsSaved(message.id);
          options.onSuccess?.();
        },
        (error) => {
          updateMessageOnError(message.id, 'Failed to send');
          options.onError?.(error);
        }
      );
    },
    onMemoryCheck: () => {}, // No memory check needed in basic handler
    onStreamStart: () => {},
    onStreamChunk: () => {},
    onStreamComplete: () => {},
    onStreamError: () => {}
  });

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !user) return;

    const startTime = performance.now();
    
    trackUserAction('message_sent', {
      message_length: inputValue.length,
      has_conversation: !!currentConversation,
      enhanced_mode: useEnhancedMode
    });

    const messageText = inputValue;
    setInputValue('');
    sendTypingIndicator(false);

    const success = await processMessage(messageText);
    
    if (success) {
      const totalTime = performance.now() - startTime;
      trackPerformance('complete_message_interaction', totalTime);
    }
  }, [inputValue, user, currentConversation, useEnhancedMode, setInputValue, sendTypingIndicator, processMessage, trackEvent, trackUserAction, trackPerformance]);

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
