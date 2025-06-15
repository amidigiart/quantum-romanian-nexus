
import { ChatEngineState, ChatEngineAction } from '../types/chatEngineTypes';

// Reducer function
export function chatEngineReducer(state: ChatEngineState, action: ChatEngineAction): ChatEngineState {
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
