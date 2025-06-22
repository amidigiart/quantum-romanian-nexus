import { supabase } from '@/integrations/supabase/client';
import { requestDeduplicationService } from './requestDeduplicationService';

interface StreamingBotRequest {
  message: string;
  conversationId?: string;
  userId: string;
  context: {
    recentMessages: string[];
    topics: string[];
    userPreferences: string[];
  };
}

export class StreamingBotService {
  static async generateStreamingResponse(
    request: StreamingBotRequest,
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const requestContext = {
      userId: request.userId,
      conversationId: request.conversationId
    };

    try {
      // Use enhanced streaming service for real-time responses
      const { EnhancedStreamingBotService } = await import('./streaming/enhancedStreamingBotService');
      
      await EnhancedStreamingBotService.generateStreamingResponseViaEdgeFunction(
        {
          message: request.message,
          conversationId: request.conversationId,
          userId: request.userId,
          context: request.context
        },
        onChunk,
        (fullResponse: string) => {
          console.log('Enhanced streaming completed');
          onComplete();
        },
        onError
      );

    } catch (error) {
      console.error('Error in streaming bot service:', error);
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  static isRequestPending(message: string, userId: string, conversationId?: string): boolean {
    const requestContext = { userId, conversationId };
    return requestDeduplicationService.isRequestPending(message, requestContext);
  }

  static cancelRequest(message: string, userId: string, conversationId?: string): void {
    const requestContext = { userId, conversationId };
    requestDeduplicationService.cancelRequest(message, requestContext);
  }
}
