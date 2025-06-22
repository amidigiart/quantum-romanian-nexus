
import { supabase } from '@/integrations/supabase/client';
import { realTimeStreamingService } from './realTimeStreamingService';

interface EnhancedStreamingRequest {
  message: string;
  conversationId?: string;
  userId: string;
  context: {
    recentMessages: string[];
    topics: string[];
    userPreferences: string[];
  };
  provider?: string;
  model?: string;
}

export class EnhancedStreamingBotService {
  static async generateRealTimeStreamingResponse(
    request: EnhancedStreamingRequest,
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const streamId = `bot_stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let fullResponse = '';

    try {
      await realTimeStreamingService.initiateStream(
        streamId,
        {
          type: 'bot_response',
          ...request
        },
        (chunk) => {
          if (chunk.text) {
            fullResponse += chunk.text;
            onChunk(chunk.text);
          }
        },
        () => {
          console.log('Real-time streaming completed');
          onComplete(fullResponse);
        },
        (error) => {
          console.error('Real-time streaming error:', error);
          onError(error);
        }
      );
    } catch (error) {
      console.error('Error initiating real-time stream:', error);
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  static async generateStreamingResponseViaEdgeFunction(
    request: EnhancedStreamingRequest,
    onChunk: (chunk: string) => void,
    onComplete: (fullResponse: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      console.log('Starting enhanced streaming response for:', request.message);

      const response = await fetch(`https://cxlcpkhcaslcfushyuct.functions.supabase.co/real-time-streaming-bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.chunk) {
                fullResponse += data.chunk;
                onChunk(data.chunk);
                console.log('Received streaming chunk:', data.chunk.substring(0, 50) + '...');
              }
              
              if (data.done) {
                console.log('Enhanced streaming response completed');
                onComplete(fullResponse);
                return;
              }
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }

      onComplete(fullResponse);
    } catch (error) {
      console.error('Error in enhanced streaming bot service:', error);
      onError(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  static cancelStream(streamId: string): void {
    realTimeStreamingService.cancelStream(streamId);
  }

  static getActiveStreamCount(): number {
    return realTimeStreamingService.getActiveStreamCount();
  }
}
