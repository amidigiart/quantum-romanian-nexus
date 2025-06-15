
import { ChatEngineAction } from '../types/chatEngineTypes';

// Action creators for UI components
export const createChatEngineActions = (dispatch: React.Dispatch<ChatEngineAction>) => ({
  setInputValue: (value: string) => dispatch({ type: 'SET_INPUT', payload: value }),
  setUseEnhancedMode: (value: boolean) => dispatch({ type: 'SET_ENHANCED_MODE', payload: value }),
  setSelectedProvider: (value: string) => dispatch({ type: 'SET_PROVIDER', payload: value }),
  setSelectedModel: (value: string) => dispatch({ type: 'SET_MODEL', payload: value }),
  toggleQualityMetrics: () => dispatch({ type: 'TOGGLE_QUALITY_METRICS' }),
  togglePersonalization: () => dispatch({ type: 'TOGGLE_PERSONALIZATION' }),
  clearMessages: () => dispatch({ type: 'CLEAR_MESSAGES' }),
  addMessage: (message: any, isPending = false) => 
    dispatch({ type: 'ADD_MESSAGE', payload: { message, isPending } }),
  markMessageSaved: (id: string) => 
    dispatch({ type: 'MARK_MESSAGE_SAVED', payload: id }),
  updateMessageError: (id: string, error: string) => 
    dispatch({ type: 'UPDATE_MESSAGE_ERROR', payload: { id, error } }),
  setGenerating: (value: boolean) => 
    dispatch({ type: 'SET_GENERATING', payload: value }),
  initializeWelcome: (message: any) => 
    dispatch({ type: 'INITIALIZE_WELCOME', payload: message })
});
