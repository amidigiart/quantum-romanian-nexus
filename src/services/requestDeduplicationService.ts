
interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
  requestKey: string;
}

class RequestDeduplicationService {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds

  private generateRequestKey(message: string, context?: any): string {
    const baseKey = message.toLowerCase().trim().substring(0, 100);
    const contextKey = context ? JSON.stringify(context).substring(0, 50) : '';
    return `${baseKey}:${contextKey}`;
  }

  private cleanupExpiredRequests(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.REQUEST_TIMEOUT) {
        this.pendingRequests.delete(key);
        console.log(`Cleaned up expired request: ${key}`);
      }
    }
  }

  async deduplicateRequest<T>(
    message: string,
    requestFn: () => Promise<T>,
    context?: any
  ): Promise<T> {
    this.cleanupExpiredRequests();
    
    const requestKey = this.generateRequestKey(message, context);
    
    // Check if request is already in progress
    const existingRequest = this.pendingRequests.get(requestKey);
    if (existingRequest) {
      console.log(`Deduplicating request: ${requestKey}`);
      return existingRequest.promise as Promise<T>;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(requestKey);
    });

    // Store the pending request
    this.pendingRequests.set(requestKey, {
      promise,
      timestamp: Date.now(),
      requestKey
    });

    console.log(`New request started: ${requestKey}`);
    return promise;
  }

  isRequestPending(message: string, context?: any): boolean {
    const requestKey = this.generateRequestKey(message, context);
    return this.pendingRequests.has(requestKey);
  }

  cancelRequest(message: string, context?: any): void {
    const requestKey = this.generateRequestKey(message, context);
    if (this.pendingRequests.has(requestKey)) {
      this.pendingRequests.delete(requestKey);
      console.log(`Request cancelled: ${requestKey}`);
    }
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }

  clearAllRequests(): void {
    this.pendingRequests.clear();
    console.log('All pending requests cleared');
  }
}

export const requestDeduplicationService = new RequestDeduplicationService();
