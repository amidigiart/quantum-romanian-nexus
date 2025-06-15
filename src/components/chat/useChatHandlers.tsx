
import { useState, useEffect } from 'react';
import { ChatMessage, useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useRealtimeChat } from '@/hooks/chat/useRealtimeChat';
import { useAnalytics } from '@/hooks/useAnalytics';

export const useChatHandlers = () => {
  const { user } = useAuth();
  const { 
    saveMessage, 
    currentConversation,
    loading 
  } = useChat();
  const { generateBotResponse, newsContext, lastUpdated, getCacheStats } = useBotResponses();
  const { 
    messages, 
    addMessage, 
    initializeWithWelcome, 
    markMessageAsSaved, 
    updateMessageOnError,
    pendingMessages 
  } = useChatMessages();
  const [inputValue, setInputValue] = useState('');
  const [useEnhancedMode, setUseEnhancedMode] = useState(false);

  const { 
    componentRef, 
    trackEvent, 
    trackUserAction, 
    trackPerformance,
    trackCacheOperation 
  } = useAnalytics({
    component: 'ChatInterface',
    trackClicks: true,
    trackPageViews: true,
    trackErrors: true
  });

  const {
    isConnected,
    onlineUsers,
    typingUsers,
    sendTypingIndicator,
    updatePresenceStatus
  } = useRealtimeChat(currentConversation);

  const cacheStats = getCacheStats();

  // Initialize with enhanced welcome message that includes news context
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
  }, [currentConversation, user, messages.length, newsContext, useEnhancedMode]);

  // Handle presence status changes
  useEffect(() => {
    if (inputValue.trim()) {
      updatePresenceStatus('typing');
    } else {
      updatePresenceStatus('online');
    }
  }, [inputValue, updatePresenceStatus]);

  const sendMessage = async () => {
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
  };

  const handleQuickAction = (action: string) => {
    trackUserAction('quick_action_used', {
      action,
      action_length: action.length,
      enhanced_mode: useEnhancedMode
    });
    
    setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  };

  return {
    // State
    inputValue,
    setInputValue,
    useEnhancedMode,
    setUseEnhancedMode,
    messages,
    pendingMessages,
    loading,
    user,
    
    // Real-time
    isConnected,
    onlineUsers,
    typingUsers,
    sendTypingIndicator,
    
    // Cache stats
    cacheStats,
    lastUpdated,
    
    // Handlers
    sendMessage,
    handleQuickAction,
    
    // Refs
    componentRef
  };
};
