
import { useState, useCallback } from 'react';
import { ChatMessage } from '@/hooks/useChat';
import { performanceMonitoringService } from '@/services/performanceMonitoringService';

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

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !user || isGenerating) return;

    return performanceMonitoringService.measureOperation('send_message', async () => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputValue,
        isBot: false,
        timestamp: new Date()
      };

      addMessage(userMessage, true);
      const messageText = inputValue;
      setInputValue('');

      // Use batched saving for user message
      saveBatchedMessage(
        userMessage,
        'current-conversation-id', // Replace with actual conversation ID
        {
          priority: 'normal',
          onSuccess: () => console.log('User message saved'),
          onError: (error: any) => console.error('Failed to save user message:', error)
        }
      );

      try {
        const botResponse = await generateResponseWithProvider(
          messageText,
          { provider: selectedProvider, model: selectedModel }
        );
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          isBot: true,
          timestamp: new Date()
        };
        
        addMessage(botMessage, true);
        
        // Use batched saving for bot message with high priority
        saveBatchedMessage(
          botMessage,
          'current-conversation-id', // Replace with actual conversation ID
          {
            priority: 'high', // Bot responses are more important
            onSuccess: () => console.log('Bot message saved'),
            onError: (error: any) => console.error('Failed to save bot message:', error)
          }
        );
        
        checkMemoryPressure();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
  }, [inputValue, user, isGenerating, addMessage, generateResponseWithProvider, saveBatchedMessage, checkMemoryPressure, selectedProvider, selectedModel]);

  const handleQuickAction = useCallback((action: string) => {
    setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  }, [sendMessage]);

  return {
    inputValue,
    setInputValue,
    sendMessage,
    handleQuickAction
  };
};
