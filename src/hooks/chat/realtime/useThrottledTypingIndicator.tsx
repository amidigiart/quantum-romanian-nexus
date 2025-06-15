
import { useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { debounce } from '@/utils/debounce';

interface TypingIndicatorConfig {
  throttleDelay: number;
  debounceDelay?: number;
}

export const useThrottledTypingIndicator = (
  sendMessage: (type: string, payload: any) => void,
  config: TypingIndicatorConfig
) => {
  const { user } = useAuth();
  const lastTypingIndicatorRef = useRef<number>(0);
  const isCurrentlyTypingRef = useRef(false);

  // Debounced function to send typing start
  const debouncedSendTypingStart = useCallback(
    debounce(() => {
      const now = Date.now();
      if (now - lastTypingIndicatorRef.current >= config.throttleDelay) {
        sendMessage('typing', { 
          isTyping: true, 
          userId: user?.id 
        });
        lastTypingIndicatorRef.current = now;
        isCurrentlyTypingRef.current = true;
        console.log('Sent typing start indicator (debounced & throttled)');
      }
    }, config.debounceDelay || 200),
    [config.throttleDelay, config.debounceDelay, user?.id, sendMessage]
  );

  // Debounced function to send typing stop
  const debouncedSendTypingStop = useCallback(
    debounce(() => {
      if (isCurrentlyTypingRef.current) {
        sendMessage('typing', { 
          isTyping: false, 
          userId: user?.id 
        });
        isCurrentlyTypingRef.current = false;
        console.log('Sent typing stop indicator (debounced)');
      }
    }, 100), // Shorter debounce for stop
    [user?.id, sendMessage]
  );

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (isTyping) {
      debouncedSendTypingStart();
    } else {
      debouncedSendTypingStop();
    }
  }, [debouncedSendTypingStart, debouncedSendTypingStop]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Send final stop typing if currently typing
    if (isCurrentlyTypingRef.current) {
      sendMessage('typing', { 
        isTyping: false, 
        userId: user?.id 
      });
      isCurrentlyTypingRef.current = false;
    }
  }, [sendMessage, user?.id]);

  return {
    sendTypingIndicator,
    cleanup
  };
};
