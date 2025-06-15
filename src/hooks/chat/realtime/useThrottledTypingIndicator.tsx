
import { useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TypingIndicatorConfig {
  throttleDelay: number;
}

export const useThrottledTypingIndicator = (
  sendMessage: (type: string, payload: any) => void,
  config: TypingIndicatorConfig
) => {
  const { user } = useAuth();
  const lastTypingIndicatorRef = useRef<number>(0);
  const typingIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    const now = Date.now();
    
    // Clear any pending timeout
    if (typingIndicatorTimeoutRef.current) {
      clearTimeout(typingIndicatorTimeoutRef.current);
      typingIndicatorTimeoutRef.current = null;
    }

    if (isTyping) {
      // Throttle typing start indicators
      if (now - lastTypingIndicatorRef.current < config.throttleDelay) {
        // Schedule for later if within throttle window
        typingIndicatorTimeoutRef.current = setTimeout(() => {
          sendTypingIndicatorImmediate(true);
        }, config.throttleDelay - (now - lastTypingIndicatorRef.current));
        return;
      }
    }

    // Send immediately for stop typing or if throttle period has passed
    sendTypingIndicatorImmediate(isTyping);
  }, [config.throttleDelay, user?.id]);

  const sendTypingIndicatorImmediate = useCallback((isTyping: boolean) => {
    sendMessage('typing', { 
      isTyping, 
      userId: user?.id 
    });
    
    if (isTyping) {
      lastTypingIndicatorRef.current = Date.now();
      console.log('Sent typing indicator (throttled)');
    } else {
      console.log('Sent stop typing indicator');
    }
  }, [sendMessage, user?.id]);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (typingIndicatorTimeoutRef.current) {
      clearTimeout(typingIndicatorTimeoutRef.current);
      typingIndicatorTimeoutRef.current = null;
    }
  }, []);

  return {
    sendTypingIndicator,
    cleanup
  };
};
