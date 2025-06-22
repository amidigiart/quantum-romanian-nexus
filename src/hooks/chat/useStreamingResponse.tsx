
import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@/hooks/useChat';
import { EnhancedStreamingBotService } from '@/services/streaming/enhancedStreamingBotService';

interface UseStreamingResponseProps {
  onMessageComplete: (message: ChatMessage) => void;
}

export const useStreamingResponse = ({ onMessageComplete }: UseStreamingResponseProps) => {
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<Error | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const accumulatedTextRef = useRef<string>('');

  const startStreaming = useCallback((messageId: string) => {
    streamingMessageIdRef.current = messageId;
    setStreamingMessage('');
    setIsStreaming(true);
    setStreamError(null);
    accumulatedTextRef.current = '';
  }, []);

  const appendToStream = useCallback((chunk: string) => {
    accumulatedTextRef.current += chunk;
    setStreamingMessage(accumulatedTextRef.current);
  }, []);

  const completeStreaming = useCallback(() => {
    if (streamingMessageIdRef.current && accumulatedTextRef.current) {
      const completedMessage: ChatMessage = {
        id: streamingMessageIdRef.current,
        text: accumulatedTextRef.current,
        isBot: true,
        timestamp: new Date()
      };
      onMessageComplete(completedMessage);
    }
    
    setStreamingMessage('');
    setIsStreaming(false);
    setStreamError(null);
    streamingMessageIdRef.current = null;
    accumulatedTextRef.current = '';
  }, [onMessageComplete]);

  const cancelStreaming = useCallback(() => {
    if (streamingMessageIdRef.current) {
      // Cancel any active streams
      EnhancedStreamingBotService.cancelStream(streamingMessageIdRef.current);
    }
    
    setStreamingMessage('');
    setIsStreaming(false);
    setStreamError(null);
    streamingMessageIdRef.current = null;
    accumulatedTextRef.current = '';
  }, []);

  const handleStreamError = useCallback((error: Error) => {
    setStreamError(error);
    setIsStreaming(false);
    console.error('Streaming error:', error);
  }, []);

  const startRealTimeStreaming = useCallback(async (
    messageId: string,
    request: {
      message: string;
      conversationId?: string;
      userId: string;
      context: any;
      provider?: string;
      model?: string;
    }
  ) => {
    startStreaming(messageId);

    try {
      await EnhancedStreamingBotService.generateRealTimeStreamingResponse(
        request,
        appendToStream,
        (fullResponse: string) => {
          console.log('Real-time streaming completed with full response length:', fullResponse.length);
          completeStreaming();
        },
        handleStreamError
      );
    } catch (error) {
      handleStreamError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }, [startStreaming, appendToStream, completeStreaming, handleStreamError]);

  return {
    streamingMessage,
    isStreaming,
    streamError,
    startStreaming,
    appendToStream,
    completeStreaming,
    cancelStreaming,
    startRealTimeStreaming,
    hasActiveStream: streamingMessageIdRef.current !== null
  };
};
