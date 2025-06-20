
// Legacy service - now delegates to enhanced service for backward compatibility
import { enhancedRequestDeduplicationService } from './enhancedRequestDeduplicationService';

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
  requestKey: string;
}

class RequestDeduplicationService {
  private generateRequestKey(message: string, context?: any): string {
    const baseKey = message.toLowerCase().trim().substring(0, 100);
    const contextKey = context ? JSON.stringify(context).substring(0, 50) : '';
    return `${baseKey}:${contextKey}`;
  }

  async deduplicateRequest<T>(
    message: string,
    requestFn: () => Promise<T>,
    context?: any
  ): Promise<T> {
    // Delegate to enhanced service with legacy key generation for backward compatibility
    return enhancedRequestDeduplicationService.deduplicateRequest(
      message,
      requestFn,
      context,
      context?.userId
    );
  }

  isRequestPending(message: string, context?: any): boolean {
    return enhancedRequestDeduplicationService.isRequestPending(
      message,
      context,
      context?.userId
    );
  }

  cancelRequest(message: string, context?: any): void {
    enhancedRequestDeduplicationService.cancelRequest(
      message,
      context,
      context?.userId
    );
  }

  getPendingRequestsCount(): number {
    return enhancedRequestDeduplicationService.getPendingRequestsCount();
  }

  clearAllRequests(): void {
    enhancedRequestDeduplicationService.clearAllRequests();
  }
}

export const requestDeduplicationService = new RequestDeduplicationService();
