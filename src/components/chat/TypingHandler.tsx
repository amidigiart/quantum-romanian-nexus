
import { useEffect, useRef, useCallback } from 'react';
import { debounce } from '@/utils/debounce';

interface TypingHandlerProps {
  onTypingChange: (isTyping: boolean) => void;
  inputValue: string;
  isEnabled: boolean;
  debounceDelay?: number;
  typingTimeout?: number;
}

export const TypingHandler: React.FC<TypingHandlerProps> = ({
  onTypingChange,
  inputValue,
  isEnabled,
  debounceDelay = 300,
  typingTimeout = 2000
}) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastInputValueRef = useRef('');

  // Debounced function to start typing indicator
  const debouncedStartTyping = useCallback(
    debounce(() => {
      if (!isTypingRef.current && inputValue.trim()) {
        isTypingRef.current = true;
        onTypingChange(true);
        console.log('Started typing indicator (debounced)');
      }
    }, debounceDelay),
    [inputValue, onTypingChange, debounceDelay]
  );

  // Debounced function to stop typing indicator
  const debouncedStopTyping = useCallback(
    debounce(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingChange(false);
        console.log('Stopped typing indicator (debounced)');
      }
    }, typingTimeout),
    [onTypingChange, typingTimeout]
  );

  // Function to stop typing immediately
  const stopTypingImmediate = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChange(false);
      console.log('Stopped typing indicator (immediate)');
    }
  }, [onTypingChange]);

  useEffect(() => {
    if (!isEnabled) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (inputValue.trim()) {
      // Only trigger if input actually changed
      if (inputValue !== lastInputValueRef.current) {
        debouncedStartTyping();
        lastInputValueRef.current = inputValue;
      }

      // Set timeout to stop typing after inactivity
      typingTimeoutRef.current = setTimeout(() => {
        debouncedStopTyping();
      }, typingTimeout);
    } else {
      // Input is empty, stop typing immediately
      stopTypingImmediate();
      lastInputValueRef.current = '';
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [inputValue, isEnabled, debouncedStartTyping, debouncedStopTyping, stopTypingImmediate, typingTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTypingImmediate();
    };
  }, [stopTypingImmediate]);

  return null;
};
