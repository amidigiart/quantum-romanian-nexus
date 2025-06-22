
import { useState, useCallback, useRef, useEffect } from 'react';
import { realTimeStreamingService, StreamingResponse } from '@/services/streaming/realTimeStreamingService';

interface UseRealTimeStreamingProps {
  onStreamComplete?: (fullText: string) => void;
  onStreamError?: (error: Error) => void;
  autoCleanup?: boolean;
}

export const useRealTimeStreaming = ({
  onStreamComplete,
  onStreamError,
  autoCleanup = true
}: UseRealTimeStreamingProps = {}) => {
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<Error | null>(null);
  const currentStreamId = useRef<string | null>(null);
  const accumulatedText = useRef('');

  const startStreaming = useCallback(async (requestData: any) => {
    // Cancel any existing stream
    if (currentStreamId.current) {
      realTimeStreamingService.cancelStream(currentStreamId.current);
    }

    const streamId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    currentStreamId.current = streamId;
    
    setIsStreaming(true);
    setStreamError(null);
    setStreamingText('');
    accumulatedText.current = '';

    await realTimeStreamingService.initiateStream(
      streamId,
      requestData,
      (chunk: StreamingResponse) => {
        accumulatedText.current += chunk.text;
        setStreamingText(accumulatedText.current);
      },
      () => {
        setIsStreaming(false);
        onStreamComplete?.(accumulatedText.current);
        currentStreamId.current = null;
      },
      (error: Error) => {
        setIsStreaming(false);
        setStreamError(error);
        onStreamError?.(error);
        currentStreamId.current = null;
      }
    );
  }, [onStreamComplete, onStreamError]);

  const cancelStreaming = useCallback(() => {
    if (currentStreamId.current) {
      realTimeStreamingService.cancelStream(currentStreamId.current);
      setIsStreaming(false);
      currentStreamId.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCleanup && currentStreamId.current) {
        realTimeStreamingService.cancelStream(currentStreamId.current);
      }
    };
  }, [autoCleanup]);

  return {
    streamingText,
    isStreaming,
    streamError,
    startStreaming,
    cancelStreaming,
    hasActiveStream: currentStreamId.current !== null
  };
};
