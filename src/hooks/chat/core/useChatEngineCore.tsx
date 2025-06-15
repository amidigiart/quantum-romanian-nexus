
import { useReducer, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useRealtimeChat } from '@/hooks/chat/useRealtimeChat';
import { useAnalytics } from '@/hooks/useAnalytics';
import { chatEngineReducer } from '../reducers/chatEngineReducer';
import { createChatEngineActions } from '../actions/chatEngineActions';
import { initialChatEngineState } from '../types/chatEngineTypes';

export const useChatEngineCore = () => {
  const [state, dispatch] = useReducer(chatEngineReducer, initialChatEngineState);
  const { user } = useAuth();
  const { 
    currentConversation,
    saveMessage,
    loading: chatLoading 
  } = useChat();
  const { 
    generateBotResponse,
    getCacheStats,
    lastUpdated,
    newsContext 
  } = useBotResponses();
  const {
    isConnected,
    onlineUsers,
    typingUsers,
    sendTypingIndicator,
    updatePresenceStatus
  } = useRealtimeChat(currentConversation);
  const { trackEvent, trackUserAction, trackPerformance, componentRef } = useAnalytics({
    component: 'ChatEngine',
    trackClicks: true,
    trackPageViews: true,
    trackErrors: true
  });

  const actions = createChatEngineActions(dispatch);

  // Initialize welcome message
  useEffect(() => {
    if (!currentConversation && state.messages.length === 0 && user) {
      const welcomeText = `🌟 Bună ziua! Sunt asistentul dvs. cuantic avansat cu funcții hibride.\n\n` +
        `Pot să vă ajut cu 10 funcții cuantice: algoritmi Grover/Shor, criptografie cuantică, ` +
        `învățare automată cuantică, optimizare QAOA, simulare VQE, și multe altele.\n\n` +
        (state.useEnhancedMode ? `🧠 Mod avansat activat - răspunsuri contextuale și personalizate.\n\n` : '') +
        (newsContext ? `📰 ${newsContext}\n\n` : '') +
        `Cu ce vă pot ajuta astăzi?`;

      const welcomeMessage: ChatMessage = {
        id: '1',
        text: welcomeText,
        isBot: true,
        timestamp: new Date()
      };
      actions.initializeWelcome(welcomeMessage);
    }
  }, [currentConversation, user, state.messages.length, state.useEnhancedMode, newsContext]);

  // Handle presence status changes
  useEffect(() => {
    if (state.inputValue.trim()) {
      updatePresenceStatus('typing');
    } else {
      updatePresenceStatus('online');
    }
  }, [state.inputValue, updatePresenceStatus]);

  // Main message sending logic
  const sendMessage = useCallback(async () => {
    if (!state.inputValue.trim() || !user || state.isGenerating) return;

    const startTime = performance.now();
    
    trackUserAction('message_sent', {
      message_length: state.inputValue.length,
      has_conversation: !!currentConversation,
      enhanced_mode: state.useEnhancedMode
    });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: state.inputValue,
      isBot: false,
      timestamp: new Date()
    };

    actions.addMessage(userMessage, true);
    const messageToProcess = state.inputValue;
    actions.setInputValue('');
    actions.setGenerating(true);
    sendTypingIndicator(false);

    // Save user message
    saveMessage(
      userMessage,
      currentConversation?.id,
      () => {
        actions.markMessageSaved(userMessage.id);
        trackEvent('message_saved', { message_id: userMessage.id });
      },
      (error) => {
        actions.updateMessageError(userMessage.id, 'Failed to send');
        trackEvent('message_save_error', { error: error.message });
      }
    );

    // Generate bot response
    setTimeout(async () => {
      try {
        const botResponseStartTime = performance.now();
        const botResponseText = await generateBotResponse(messageToProcess, currentConversation?.id);
        const botResponseTime = performance.now() - botResponseStartTime;
        
        trackPerformance('bot_response_generation', botResponseTime, {
          input_length: messageToProcess.length,
          response_length: botResponseText.length,
          enhanced_mode: state.useEnhancedMode
        });

        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          isBot: true,
          timestamp: new Date()
        };
        
        actions.addMessage(botMessage, true);
        actions.markMessageSaved(botMessage.id);
        
        trackEvent('bot_response_received', {
          response_time: botResponseTime,
          message_id: botMessage.id,
          enhanced_mode: state.useEnhancedMode
        });
      } catch (error) {
        console.error('Error generating bot response:', error);
        
        trackEvent('bot_response_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          input: messageToProcess.substring(0, 50),
          enhanced_mode: state.useEnhancedMode
        });
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Ne pare rău, am întâmpinat o problemă tehnică. Vă rugăm să încercați din nou.',
          isBot: true,
          timestamp: new Date()
        };
        actions.addMessage(errorMessage, false);
      } finally {
        actions.setGenerating(false);
        const totalTime = performance.now() - startTime;
        trackPerformance('complete_message_interaction', totalTime);
      }
    }, 500);
  }, [state.inputValue, state.useEnhancedMode, state.isGenerating, user, currentConversation, generateBotResponse, saveMessage, sendTypingIndicator, trackEvent, trackUserAction, trackPerformance]);

  // Quick action handler
  const handleQuickAction = useCallback((action: string) => {
    trackUserAction('quick_action_used', {
      action,
      action_length: action.length,
      enhanced_mode: state.useEnhancedMode
    });
    
    actions.setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  }, [state.useEnhancedMode, sendMessage, trackUserAction]);

  return {
    state,
    actions: {
      ...actions,
      sendMessage,
      handleQuickAction
    },
    integrations: {
      user,
      chatLoading,
      isConnected,
      onlineUsers,
      typingUsers,
      sendTypingIndicator,
      cacheStats: getCacheStats(),
      lastUpdated,
      newsContext,
      componentRef
    }
  };
};
