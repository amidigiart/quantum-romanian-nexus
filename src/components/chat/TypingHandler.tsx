
import { useEffect, useRef, useCallback } from 'react';

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
  debounceDelay = 300, // Debounce typing start by 300ms
  typingTimeout = 2000 // Stop typing indicator after 2 seconds of inactivity
}) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastInputValueRef = useRef('');

  // Debounced function to start typing indicator
  const debouncedStartTyping = useCallback(() => {
    if (!isEnabled || !inputValue.trim()) return;

    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Only start typing if we're not already typing
    debounceTimeoutRef.current = setTimeout(() => {
      if (!isTypingRef.current && inputValue.trim()) {
        isTypingRef.current = true;
        onTypingChange(true);
        console.log('Started typing indicator (debounced)');
      }
    }, debounceDelay);
  }, [isEnabled, inputValue, onTypingChange, debounceDelay]);

  // Function to stop typing indicator
  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingChange(false);
      console.log('Stopped typing indicator');
    }
  }, [onTypingChange]);

  useEffect(() => {
    if (!isEnabled) return;

    // Clear existing timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (inputValue.trim()) {
      // Only trigger debounced start if input actually changed
      if (inputValue !== lastInputValueRef.current) {
        debouncedStartTyping();
        lastInputValueRef.current = inputValue;
      }

      // Set timeout to stop typing indicator after inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping();
      }, typingTimeout);
    } else {
      // Input is empty, stop typing indicator immediately
      stopTyping();
      lastInputValueRef.current = '';
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [inputValue, isEnabled, debouncedStartTyping, stopTyping, typingTimeout]);

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      stopTyping();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [stopTyping]);

  return null; // This component doesn't render anything
};
