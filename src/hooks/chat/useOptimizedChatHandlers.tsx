
import { useState, useCallback } from 'react';
import { ChatMessage } from '@/hooks/useChat';
import { useStreamingResponse } from './useStreamingResponse';
import { useUnifiedMessageProcessor } from './useUnifiedMessageProcessor';

interface UseOptimizedChatHandlersProps {
  user: any;
  isGenerating: boolean;
  addMessage: (message: ChatMessage, shouldSave: boolean) => void;
  generateResponseWithProvider: (text: string, config: any) => Promise<string>;
  saveBatchedMessage: (message: ChatMessage, conversationId: string, options: any) => void;
  checkMemoryPressure: () => void;
  selectedProvider: string;
  selectedModel: string;
}

export const useOptimizedChatHandlers = ({
  user,
  isGenerating,
  addMessage,
  generateResponseWithProvider,
  saveBatchedMessage,
  checkMemoryPressure,
  selectedProvider,
  selectedModel
}: UseOptimizedChatHandlersProps) => {
  const [inputValue, setInputValue] = useState('');

  const {
    streamingMessage,
    isStreaming,
    startStreaming,
    appendToStream,
    completeStreaming,
    cancelStreaming
  } = useStreamingResponse({
    onMessageComplete: (message) => {
      addMessage(message, true);
      saveBatchedMessage(
        message,
        'current-conversation-id',
        {
          priority: 'high',
          onSuccess: () => console.log('Streamed bot message saved'),
          onError: (error: any) => console.error('Failed to save streamed bot message:', error)
        }
      );
    }
  });

  const { processMessage, cancelMessage, getPendingCount } = useUnifiedMessageProcessor({
    conversationId: 'current-conversation-id',
    onMessageAdd: addMessage,
    onMessageSave: saveBatchedMessage,
    onMemoryCheck: checkMemoryPressure,
    onStreamStart: startStreaming,
    onStreamChunk: appendToStream,
    onStreamComplete: completeStreaming,
    onStreamError: cancelStreaming
  });

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !user || isGenerating || isStreaming) return;

    const messageText = inputValue;
    setInputValue('');

    await processMessage(messageText);
  }, [inputValue, user, isGenerating, isStreaming, processMessage]);

  const handleQuickAction = useCallback((action: string) => {
    // Cancel any pending request for the previous input
    if (inputValue.trim() && user) {
      cancelMessage(inputValue);
    }
    
    setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  }, [inputValue, user, sendMessage, cancelMessage]);

  const cancelCurrentRequest = useCallback(() => {
    if (inputValue.trim() && user) {
      cancelMessage(inputValue);
      cancelStreaming();
    }
  }, [inputValue, user, cancelMessage, cancelStreaming]);

  return {
    inputValue,
    setInputValue,
    sendMessage,
    handleQuickAction,
    streamingMessage,
    isStreaming,
    cancelCurrentRequest,
    getPendingRequestsCount: getPendingCount
  };
};
