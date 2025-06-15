
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useMultiProviderBotResponses } from '@/hooks/chat/useMultiProviderBotResponses';
import { useAnalytics } from '@/hooks/useAnalytics';

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

  // Memoized message sending logic
  const sendEnhancedMessage = useCallback(async () => {
    if (!inputValue.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    addMessage(userMessage, true);
    const messageToProcess = inputValue;
    setInputValue('');

    // Save user message
    saveMessage(
      userMessage, 
      currentConversation?.id,
      () => markMessageAsSaved(userMessage.id),
      (error) => updateMessageOnError(userMessage.id, 'Failed to send message')
    );

    // Generate AI response with selected provider
    setTimeout(async () => {
      try {
        const botResponseText = await generateResponseWithProvider(
          messageToProcess,
          { provider: selectedProvider, model: selectedModel },
          currentConversation?.id
        );
        
        const finalBotMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          isBot: true,
          timestamp: new Date()
        };
        
        addMessage(finalBotMessage, true);
        markMessageAsSaved(finalBotMessage.id);
      } catch (error) {
        console.error('Enhanced response error:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `🔧 Sistemul AI ${selectedProvider} întâmpină dificultăți tehnice. Vă rugăm să încercați cu alt provider sau să verificați configurația.`,
          isBot: true,
          timestamp: new Date()
        };
        addMessage(errorMessage, false);
      }
    }, 300);
  }, [inputValue, user, addMessage, saveMessage, currentConversation, markMessageAsSaved, updateMessageOnError, generateResponseWithProvider, selectedProvider, selectedModel]);

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
