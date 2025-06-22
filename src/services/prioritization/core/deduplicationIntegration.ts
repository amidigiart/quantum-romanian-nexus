
import { enhancedRequestDeduplicationService } from '../../enhancedRequestDeduplicationService';
import { RequestPriority } from '../types';

export class DeduplicationIntegration {
  async executeWithDeduplication<T>(
    message: string,
    requestFn: () => Promise<T>,
    priority: RequestPriority,
    context?: any,
    userId?: string
  ): Promise<T> {
    return enhancedRequestDeduplicationService.deduplicateRequest(
      message,
      requestFn,
      context,
      userId,
      priority
    );
  }

  isRequestPending(message: string, context?: any, userId?: string): boolean {
    return enhancedRequestDeduplicationService.isRequestPending(message, context, userId);
  }

  cancelRequest(message: string, context?: any, userId?: string): void {
    enhancedRequestDeduplicationService.cancelRequest(message, context, userId);
  }

  cancelUserRequests(userId: string): number {
    return enhancedRequestDeduplicationService.cancelUserRequests(userId);
  }

  getPendingRequestsCount(): number {
    return enhancedRequestDeduplicationService.getPendingRequestsCount();
  }

  getDeduplicationStats() {
    return enhancedRequestDeduplicationService.getDetailedStats();
  }
}

export const deduplicationIntegration = new DeduplicationIntegration();
