
export interface StreamingConfig {
  chunkSize?: number;
  delayBetweenChunks?: number;
  enableCompression?: boolean;
}

export interface StreamingResponse {
  id: string;
  text: string;
  isComplete: boolean;
  timestamp: number;
  metadata?: any;
}

export class RealTimeStreamingService {
  private activeStreams = new Map<string, AbortController>();
  private streamingConfig: StreamingConfig = {
    chunkSize: 50,
    delayBetweenChunks: 100,
    enableCompression: false
  };

  async initiateStream(
    streamId: string,
    requestData: any,
    onChunk: (chunk: StreamingResponse) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    // Cancel any existing stream with this ID
    this.cancelStream(streamId);

    const controller = new AbortController();
    this.activeStreams.set(streamId, controller);

    try {
      const response = await fetch('/api/stream-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Streaming failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No readable stream available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

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
              const streamingResponse: StreamingResponse = {
                id: streamId,
                text: data.chunk || data.text || '',
                isComplete: data.isComplete || false,
                timestamp: Date.now(),
                metadata: data.metadata
              };
              
              onChunk(streamingResponse);
              
              if (data.isComplete) {
                onComplete();
                this.cleanupStream(streamId);
                return;
              }
            } catch (error) {
              console.error('Error parsing streaming data:', error);
            }
          }
        }
      }

      onComplete();
    } catch (error) {
      if (error.name !== 'AbortError') {
        onError(error instanceof Error ? error : new Error('Streaming error'));
      }
    } finally {
      this.cleanupStream(streamId);
    }
  }

  cancelStream(streamId: string): void {
    const controller = this.activeStreams.get(streamId);
    if (controller) {
      controller.abort();
      this.cleanupStream(streamId);
    }
  }

  private cleanupStream(streamId: string): void {
    this.activeStreams.delete(streamId);
  }

  getActiveStreamCount(): number {
    return this.activeStreams.size;
  }

  cancelAllStreams(): void {
    for (const [streamId] of this.activeStreams) {
      this.cancelStream(streamId);
    }
  }
}

export const realTimeStreamingService = new RealTimeStreamingService();
