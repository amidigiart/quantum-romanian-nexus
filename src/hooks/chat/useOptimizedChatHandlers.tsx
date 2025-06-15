
import { useState, useCallback } from 'react';
import { ChatMessage } from '@/hooks/useChat';
import { performanceMonitoringService } from '@/services/performanceMonitoringService';
import { useStreamingResponse } from './useStreamingResponse';
import { StreamingBotService } from '@/services/streamingBotService';

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

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !user || isGenerating || isStreaming) return;

    return performanceMonitoringService.measureOperation('send_message_streaming', async () => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputValue,
        isBot: false,
        timestamp: new Date()
      };

      addMessage(userMessage, true);
      const messageText = inputValue;
      setInputValue('');

      // Save user message
      saveBatchedMessage(
        userMessage,
        'current-conversation-id',
        {
          priority: 'normal',
          onSuccess: () => console.log('User message saved'),
          onError: (error: any) => console.error('Failed to save user message:', error)
        }
      );

      try {
        // Start streaming response
        const streamingMessageId = (Date.now() + 1).toString();
        startStreaming(streamingMessageId);

        await StreamingBotService.generateStreamingResponse(
          {
            message: messageText,
            conversationId: 'current-conversation-id',
            userId: user?.id,
            context: {
              recentMessages: [],
              topics: [],
              userPreferences: []
            }
          },
          (chunk: string) => {
            appendToStream(chunk);
          },
          () => {
            completeStreaming();
            checkMemoryPressure();
          },
          (error: Error) => {
            console.error('Streaming error:', error);
            cancelStreaming();
            
            // Fallback to regular response
            const errorMessage: ChatMessage = {
              id: streamingMessageId,
              text: 'Ne pare rău, am întâmpinat o problemă tehnică. Vă rugăm să încercați din nou.',
              isBot: true,
              timestamp: new Date()
            };
            addMessage(errorMessage, false);
          }
        );
        
      } catch (error) {
        console.error('Error sending message:', error);
        cancelStreaming();
      }
    });
  }, [inputValue, user, isGenerating, isStreaming, addMessage, saveBatchedMessage, checkMemoryPressure, startStreaming, appendToStream, completeStreaming, cancelStreaming]);

  const handleQuickAction = useCallback((action: string) => {
    setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  }, [sendMessage]);

  return {
    inputValue,
    setInputValue,
    sendMessage,
    handleQuickAction,
    streamingMessage,
    isStreaming
  };
};
