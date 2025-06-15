
import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@/hooks/useChat';

interface UseStreamingResponseProps {
  onMessageComplete: (message: ChatMessage) => void;
}

export const useStreamingResponse = ({ onMessageComplete }: UseStreamingResponseProps) => {
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamingMessageIdRef = useRef<string | null>(null);

  const startStreaming = useCallback((messageId: string) => {
    streamingMessageIdRef.current = messageId;
    setStreamingMessage('');
    setIsStreaming(true);
  }, []);

  const appendToStream = useCallback((chunk: string) => {
    setStreamingMessage(prev => prev + chunk);
  }, []);

  const completeStreaming = useCallback(() => {
    if (streamingMessageIdRef.current && streamingMessage) {
      const completedMessage: ChatMessage = {
        id: streamingMessageIdRef.current,
        text: streamingMessage,
        isBot: true,
        timestamp: new Date()
      };
      onMessageComplete(completedMessage);
    }
    
    setStreamingMessage('');
    setIsStreaming(false);
    streamingMessageIdRef.current = null;
  }, [streamingMessage, onMessageComplete]);

  const cancelStreaming = useCallback(() => {
    setStreamingMessage('');
    setIsStreaming(false);
    streamingMessageIdRef.current = null;
  }, []);

  return {
    streamingMessage,
    isStreaming,
    startStreaming,
    appendToStream,
    completeStreaming,
    cancelStreaming
  };
};
