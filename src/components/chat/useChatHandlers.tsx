
import { useChatEngine } from '@/hooks/chat/useChatEngine';

// Compatibility layer - redirects to the new unified chat engine
export const useChatHandlers = () => {
  return useChatEngine();
};
