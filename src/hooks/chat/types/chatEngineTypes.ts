
import { ChatMessage } from '@/hooks/useChat';

// Consolidated state interface
export interface ChatEngineState {
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
export type ChatEngineAction =
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
export const initialChatEngineState: ChatEngineState = {
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
