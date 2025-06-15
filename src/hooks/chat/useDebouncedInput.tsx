
import { useState, useCallback, useRef, useEffect } from 'react';
import { debounce, debouncedCallback } from '@/utils/debounce';

interface UseDebouncedInputOptions {
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onDebouncedChange?: (value: string) => void;
  typingDelay?: number;
  changeDelay?: number;
}

export const useDebouncedInput = ({
  onTypingStart,
  onTypingStop,
  onDebouncedChange,
  typingDelay = 1000,
  changeDelay = 300
}: UseDebouncedInputOptions = {}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValueRef = useRef('');

  // Debounced typing stop handler
  const debouncedStopTyping = useCallback(
    debounce(() => {
      setIsTyping(false);
      onTypingStop?.();
      console.log('Stopped typing (debounced)');
    }, typingDelay),
    [onTypingStop, typingDelay]
  );

  // Debounced change handler
  const debouncedChange = useCallback(
    debounce((value: string) => {
      onDebouncedChange?.(value);
    }, changeDelay),
    [onDebouncedChange, changeDelay]
  );

  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);

    // Start typing if not already typing and value is not empty
    if (!isTyping && value.trim() && value !== lastValueRef.current) {
      setIsTyping(true);
      onTypingStart?.();
      console.log('Started typing');
    }

    // Update last value
    lastValueRef.current = value;

    // Trigger debounced change
    debouncedChange(value);

    // Reset typing timeout
    if (value.trim()) {
      debouncedStopTyping();
    } else {
      // Stop typing immediately if input is empty
      if (isTyping) {
        setIsTyping(false);
        onTypingStop?.();
      }
    }
  }, [isTyping, onTypingStart, onTypingStop, debouncedChange, debouncedStopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    inputValue,
    setInputValue,
    handleInputChange,
    isTyping
  };
};
