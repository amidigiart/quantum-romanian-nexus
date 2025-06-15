
import { useEffect, useRef } from 'react';

interface TypingHandlerProps {
  onTypingChange: (isTyping: boolean) => void;
  inputValue: string;
  isEnabled: boolean;
}

export const TypingHandler: React.FC<TypingHandlerProps> = ({
  onTypingChange,
  inputValue,
  isEnabled
}) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!isEnabled) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (inputValue.trim()) {
      // User is typing
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingChange(true);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          onTypingChange(false);
        }
      }, 2000); // Stop typing indicator after 2 seconds of inactivity
    } else {
      // Input is empty, stop typing indicator
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingChange(false);
      }
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [inputValue, onTypingChange, isEnabled]);

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (isTypingRef.current) {
        onTypingChange(false);
      }
    };
  }, [onTypingChange]);

  return null; // This component doesn't render anything
};
