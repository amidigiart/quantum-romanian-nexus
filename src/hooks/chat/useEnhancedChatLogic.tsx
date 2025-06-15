
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useMultiProviderBotResponses } from '@/hooks/chat/useMultiProviderBotResponses';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useUnifiedMessageProcessor } from './useUnifiedMessageProcessor';

export const useEnhancedChatLogic = () => {
  const { user } = useAuth();
  const { saveMessage, currentConversation, loading } = useChat();
  const { generateResponseWithProvider, isGenerating, newsContext } = useMultiProviderBotResponses();
  const { 
    messages, 
    addMessage, 
    initializeWithWelcome, 
    markMessageAsSaved, 
    updateMessageOnError,
    pendingMessages 
  } = useChatMessages();
  
  const [inputValue, setInputValue] = useState('');
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isEnhancedMode, setIsEnhancedMode] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-2025-04-14');

  const { trackEvent } = useAnalytics({
    component: 'EnhancedChatInterface',
    trackClicks: true,
    trackPageViews: true
  });

  // Memoized welcome message creation
  const createWelcomeMessage = useMemo(() => {
    return (): ChatMessage => ({
      id: '1',
      text: `🌟 Bună ziua! Sunt asistentul dvs. cuantic avansat cu AI îmbunătățit. Offer răspunsuri contextualizate, personalizate și inteligente pentru 10 funcții cuantice hibride.\n\n🧠 Funcții AI avansate:\n• Răspunsuri contextuale bazate pe conversație\n• Personalizare automată\n• Cache inteligent pentru performanță\n• Streaming în timp real\n\n${newsContext ? `📰 ${newsContext}` : ''}\n\nCu ce vă pot ajuta astăzi?`,
      isBot: true,
      timestamp: new Date()
    });
  }, [newsContext]);

  // Initialize with enhanced welcome message
  useEffect(() => {
    if (!currentConversation && messages.length === 0 && user) {
      const welcomeMessage = createWelcomeMessage();
      initializeWithWelcome(welcomeMessage);
    }
  }, [currentConversation, user, messages.length, createWelcomeMessage, initializeWithWelcome]);

  // Use unified message processor for enhanced logic
  const { processMessage } = useUnifiedMessageProcessor({
    conversationId: currentConversation?.id,
    onMessageAdd: addMessage,
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
    onMemoryCheck: () => {},
    onStreamStart: () => {},
    onStreamChunk: (chunk) => setStreamingMessage(prev => prev + chunk),
    onStreamComplete: () => setStreamingMessage(''),
    onStreamError: () => setStreamingMessage('')
  });

  const sendEnhancedMessage = useCallback(async () => {
    if (!inputValue.trim() || !user) return;

    const messageText = inputValue;
    setInputValue('');

    await processMessage(messageText);
  }, [inputValue, user, processMessage]);

  const handleQuickAction = useCallback((action: string) => {
    trackEvent('enhanced_quick_action', { action, enhanced_mode: isEnhancedMode });
    setInputValue(action);
    setTimeout(() => sendEnhancedMessage(), 100);
  }, [trackEvent, isEnhancedMode, sendEnhancedMessage]);

  return {
    // State
    inputValue,
    setInputValue,
    streamingMessage,
    setStreamingMessage,
    isEnhancedMode,
    setIsEnhancedMode,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    messages,
    pendingMessages,
    loading,
    isGenerating,
    user,
    newsContext,
    
    // Actions
    sendEnhancedMessage,
    handleQuickAction
  };
};
