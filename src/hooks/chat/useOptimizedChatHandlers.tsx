import { useState, useCallback } from 'react';
import { ChatMessage } from '@/hooks/useChat';
import { useStreamingResponse } from './useStreamingResponse';
import { useUnifiedMessageProcessor } from './useUnifiedMessageProcessor';
import { useDebouncedInput } from './useDebouncedInput';
import { debouncedCallback } from '@/utils/debounce';

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

  // Use debounced input instead of plain state
  const { inputValue, handleInputChange, isTyping } = useDebouncedInput({
    onTypingStart: () => console.log('User started typing'),
    onTypingStop: () => console.log('User stopped typing'),
    typingDelay: 1500,
    changeDelay: 200
  });

  // Create debounced send message function
  const { execute: debouncedSendMessage, cancel: cancelDebouncedSend } = debouncedCallback(
    async (messageText: string) => {
      await processMessage(messageText);
    },
    300 // 300ms debounce for send message
  );

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !user || isGenerating || isStreaming) return;

    const messageText = inputValue;
    handleInputChange(''); // Clear input immediately

    // Use debounced send to prevent rapid firing
    await debouncedSendMessage(messageText);
  }, [inputValue, user, isGenerating, isStreaming, handleInputChange, debouncedSendMessage]);

  const handleQuickAction = useCallback((action: string) => {
    // Cancel any pending debounced sends
    cancelDebouncedSend();
    
    // Cancel any pending request for the previous input
    if (inputValue.trim() && user) {
      cancelMessage(inputValue);
    }
    
    handleInputChange(action);
    
    // Use a longer delay for quick actions to prevent accidental double-sends
    setTimeout(() => {
      if (action.trim() && user && !isGenerating && !isStreaming) {
        debouncedSendMessage(action);
      }
    }, 200);
  }, [inputValue, user, isGenerating, isStreaming, handleInputChange, cancelMessage, debouncedSendMessage, cancelDebouncedSend]);

  const cancelCurrentRequest = useCallback(() => {
    cancelDebouncedSend();
    
    if (inputValue.trim() && user) {
      cancelMessage(inputValue);
      cancelStreaming();
    }
  }, [inputValue, user, cancelMessage, cancelStreaming, cancelDebouncedSend]);

  return {
    inputValue,
    setInputValue: handleInputChange,
    sendMessage,
    handleQuickAction,
    streamingMessage,
    isStreaming,
    isTyping,
    cancelCurrentRequest,
    getPendingRequestsCount: getPendingCount
  };
};
