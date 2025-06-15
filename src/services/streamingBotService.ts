
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
      // Use request deduplication to prevent duplicate calls
      await requestDeduplicationService.deduplicateRequest(
        request.message,
        async () => {
          console.log('Starting streaming response for:', request.message);

          const { data, error } = await supabase.functions.invoke('streaming-bot-response', {
            body: request
          });

          if (error) {
            console.error('Streaming bot service error:', error);
            throw new Error('Failed to generate streaming response');
          }

          // Simulate streaming by splitting the response into chunks
          const response = data.response;
          const chunks = response.split('. ');
          
          // Stream chunks with realistic delays
          for (let i = 0; i < chunks.length; i++) {
            const chunk = i === chunks.length - 1 ? chunks[i] : chunks[i] + '. ';
            
            // Add realistic streaming delay
            await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));
            
            onChunk(chunk);
            console.log('Streamed chunk:', chunk.substring(0, 50) + '...');
          }

          console.log('Streaming response completed');
          return response;
        },
        requestContext
      );

      onComplete();

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
