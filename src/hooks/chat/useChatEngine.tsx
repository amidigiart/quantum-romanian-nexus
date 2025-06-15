
import { useReducer, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useRealtimeChat } from '@/hooks/chat/useRealtimeChat';
import { useAnalytics } from '@/hooks/useAnalytics';

// Consolidated state interface
interface ChatEngineState {
  inputValue: string;
  useEnhancedMode: boolean;
  messages: ChatMessage[];
  pendingMessages: Set<string>;
  isLoading: boolean;
  isGenerating: boolean;
  streamingMessage: string;
  selectedProvider: string;
  selectedModel: string;
  showQualityMetrics: boolean;
  showPersonalization: boolean;
}

// Action types
type ChatEngineAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_ENHANCED_MODE'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: { message: ChatMessage; isPending?: boolean } }
  | { type: 'MARK_MESSAGE_SAVED'; payload: string }
  | { type: 'UPDATE_MESSAGE_ERROR'; payload: { id: string; error: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_STREAMING_MESSAGE'; payload: string }
  | { type: 'SET_PROVIDER'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'TOGGLE_QUALITY_METRICS' }
  | { type: 'TOGGLE_PERSONALIZATION' }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'INITIALIZE_WELCOME'; payload: ChatMessage };

// Initial state
const initialState: ChatEngineState = {
  inputValue: '',
  useEnhancedMode: false,
  messages: [],
  pendingMessages: new Set(),
  isLoading: false,
  isGenerating: false,
  streamingMessage: '',
  selectedProvider: 'openai',
  selectedModel: 'gpt-4.1-2025-04-14',
  showQualityMetrics: false,
  showPersonalization: false
};

// Reducer function
function chatEngineReducer(state: ChatEngineState, action: ChatEngineAction): ChatEngineState {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, inputValue: action.payload };
    
    case 'SET_ENHANCED_MODE':
      return { ...state, useEnhancedMode: action.payload };
    
    case 'ADD_MESSAGE':
      const newPendingMessages = new Set(state.pendingMessages);
      if (action.payload.isPending) {
        newPendingMessages.add(action.payload.message.id);
      }
      return {
        ...state,
        messages: [...state.messages, action.payload.message],
        pendingMessages: newPendingMessages
      };
    
    case 'MARK_MESSAGE_SAVED':
      const updatedPendingMessages = new Set(state.pendingMessages);
      updatedPendingMessages.delete(action.payload);
      return { ...state, pendingMessages: updatedPendingMessages };
    
    case 'UPDATE_MESSAGE_ERROR':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, text: `${msg.text} (${action.payload.error})`, error: true }
            : msg
        ),
        pendingMessages: new Set([...state.pendingMessages].filter(id => id !== action.payload.id))
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    
    case 'SET_STREAMING_MESSAGE':
      return { ...state, streamingMessage: action.payload };
    
    case 'SET_PROVIDER':
      return { ...state, selectedProvider: action.payload };
    
    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };
    
    case 'TOGGLE_QUALITY_METRICS':
      return { ...state, showQualityMetrics: !state.showQualityMetrics };
    
    case 'TOGGLE_PERSONALIZATION':
      return { ...state, showPersonalization: !state.showPersonalization };
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [], pendingMessages: new Set() };
    
    case 'INITIALIZE_WELCOME':
      if (state.messages.length === 0) {
        return { ...state, messages: [action.payload] };
      }
      return state;
    
    default:
      return state;
  }
}

export const useChatEngine = () => {
  const [state, dispatch] = useReducer(chatEngineReducer, initialState);
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
  const { trackEvent, trackUserAction, trackPerformance } = useAnalytics({
    component: 'ChatEngine',
    trackClicks: true,
    trackPageViews: true,
    trackErrors: true
  });

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
      dispatch({ type: 'INITIALIZE_WELCOME', payload: welcomeMessage });
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

    dispatch({ type: 'ADD_MESSAGE', payload: { message: userMessage, isPending: true } });
    const messageToProcess = state.inputValue;
    dispatch({ type: 'SET_INPUT', payload: '' });
    dispatch({ type: 'SET_GENERATING', payload: true });
    sendTypingIndicator(false);

    // Save user message
    saveMessage(
      userMessage,
      currentConversation?.id,
      () => {
        dispatch({ type: 'MARK_MESSAGE_SAVED', payload: userMessage.id });
        trackEvent('message_saved', { message_id: userMessage.id });
      },
      (error) => {
        dispatch({ type: 'UPDATE_MESSAGE_ERROR', payload: { id: userMessage.id, error: 'Failed to send' } });
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
        
        dispatch({ type: 'ADD_MESSAGE', payload: { message: botMessage, isPending: true } });
        dispatch({ type: 'MARK_MESSAGE_SAVED', payload: botMessage.id });
        
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
        dispatch({ type: 'ADD_MESSAGE', payload: { message: errorMessage, isPending: false } });
      } finally {
        dispatch({ type: 'SET_GENERATING', payload: false });
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
    
    dispatch({ type: 'SET_INPUT', payload: action });
    setTimeout(() => sendMessage(), 100);
  }, [state.useEnhancedMode, sendMessage, trackUserAction]);

  // Action creators for UI components
  const actions = {
    setInputValue: (value: string) => dispatch({ type: 'SET_INPUT', payload: value }),
    setUseEnhancedMode: (value: boolean) => dispatch({ type: 'SET_ENHANCED_MODE', payload: value }),
    setSelectedProvider: (value: string) => dispatch({ type: 'SET_PROVIDER', payload: value }),
    setSelectedModel: (value: string) => dispatch({ type: 'SET_MODEL', payload: value }),
    toggleQualityMetrics: () => dispatch({ type: 'TOGGLE_QUALITY_METRICS' }),
    togglePersonalization: () => dispatch({ type: 'TOGGLE_PERSONALIZATION' }),
    clearMessages: () => dispatch({ type: 'CLEAR_MESSAGES' }),
    sendMessage,
    handleQuickAction
  };

  return {
    // State
    ...state,
    loading: chatLoading || state.isLoading,
    user,
    
    // Real-time
    isConnected,
    onlineUsers,
    typingUsers,
    sendTypingIndicator,
    
    // Cache stats
    cacheStats: getCacheStats(),
    lastUpdated,
    newsContext,
    
    // Actions
    ...actions
  };
};
