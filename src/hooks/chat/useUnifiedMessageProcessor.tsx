
import { useCallback } from 'react';
import { ChatMessage } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { StreamingBotService } from '@/services/streamingBotService';
import { requestDeduplicationService } from '@/services/requestDeduplicationService';
import { performanceMonitoringService } from '@/services/performanceMonitoringService';

interface UnifiedMessageProcessorProps {
  conversationId?: string;
  onMessageAdd: (message: ChatMessage, shouldSave: boolean) => void;
  onMessageSave: (message: ChatMessage, conversationId: string, options: any) => void;
  onMemoryCheck: () => void;
  onStreamStart: (messageId: string) => void;
  onStreamChunk: (chunk: string) => void;
  onStreamComplete: () => void;
  onStreamError: () => void;
}

export const useUnifiedMessageProcessor = ({
  conversationId = 'current-conversation-id',
  onMessageAdd,
  onMessageSave,
  onMemoryCheck,
  onStreamStart,
  onStreamChunk,
  onStreamComplete,
  onStreamError
}: UnifiedMessageProcessorProps) => {
  const { user } = useAuth();

  const processMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || !user) return false;

    // Check for pending duplicate requests
    if (StreamingBotService.isRequestPending(inputText, user.id, conversationId)) {
      console.log('Request already pending, ignoring duplicate');
      return false;
    }

    return performanceMonitoringService.measureOperation('unified_message_processing', async () => {
      // Create and add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputText,
        isBot: false,
        timestamp: new Date()
      };

      onMessageAdd(userMessage, true);

      // Save user message
      onMessageSave(
        userMessage,
        conversationId,
        {
          priority: 'normal',
          onSuccess: () => console.log('User message saved'),
          onError: (error: any) => console.error('Failed to save user message:', error)
        }
      );

      try {
        // Start streaming response
        const streamingMessageId = (Date.now() + 1).toString();
        onStreamStart(streamingMessageId);

        await StreamingBotService.generateStreamingResponse(
          {
            message: inputText,
            conversationId,
            userId: user.id,
            context: {
              recentMessages: [],
              topics: [],
              userPreferences: []
            }
          },
          onStreamChunk,
          () => {
            onStreamComplete();
            onMemoryCheck();
          },
          (error: Error) => {
            console.error('Streaming error:', error);
            onStreamError();
            
            // Add error message
            const errorMessage: ChatMessage = {
              id: streamingMessageId,
              text: 'Ne pare rău, am întâmpinat o problemă tehnică. Vă rugăm să încercați din nou.',
              isBot: true,
              timestamp: new Date()
            };
            onMessageAdd(errorMessage, false);
          }
        );

        return true;
      } catch (error) {
        console.error('Error in unified message processing:', error);
        onStreamError();
        return false;
      }
    });
  }, [user, conversationId, onMessageAdd, onMessageSave, onMemoryCheck, onStreamStart, onStreamChunk, onStreamComplete, onStreamError]);

  const cancelMessage = useCallback((inputText: string) => {
    if (inputText.trim() && user) {
      StreamingBotService.cancelRequest(inputText, user.id, conversationId);
    }
  }, [user, conversationId]);

  const getPendingCount = useCallback(() => {
    return requestDeduplicationService.getPendingRequestsCount();
  }, []);

  return {
    processMessage,
    cancelMessage,
    getPendingCount
  };
};
