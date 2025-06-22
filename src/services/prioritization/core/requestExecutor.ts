
import { PriorityRequest, RequestPriority } from '../types';
import { circuitBreakerIntegration } from './circuitBreakerIntegration';

export class RequestExecutor {
  private requestCounter = 0;

  generateRequestId(): string {
    return `req_${++this.requestCounter}_${Date.now()}`;
  }

  createWrappedRequestFunction<T>(
    requestFn: () => Promise<T>,
    useCircuitBreaker: boolean,
    circuitBreakerName: string
  ): () => Promise<T> {
    return useCircuitBreaker
      ? () => circuitBreakerIntegration.executeWithCircuitBreaker(circuitBreakerName, requestFn)
      : requestFn;
  }

  createPriorityRequest<T>(
    requestId: string,
    message: string,
    requestFn: () => Promise<T>,
    priority: RequestPriority,
    options: {
      userId?: string;
      conversationId?: string;
      context?: any;
      maxRetries?: number;
      timeoutMs?: number;
    },
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
  ): PriorityRequest {
    return {
      id: requestId,
      priority,
      message,
      context: options.context,
      userId: options.userId,
      conversationId: options.conversationId,
      timestamp: Date.now(),
      requestFn,
      maxRetries: options.maxRetries,
      timeoutMs: options.timeoutMs,
      onSuccess: resolve,
      onError: (error) => {
        const handledError = circuitBreakerIntegration.handleCircuitBreakerError(error);
        reject(handledError);
      }
    };
  }
}

export const requestExecutor = new RequestExecutor();
