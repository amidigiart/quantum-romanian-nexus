
import { PriorityQueueManager } from '../priorityQueueManager';
import { PriorityRequest, RequestPriority, QueueStats, PriorityQueueConfig, QueueEventHandlers } from '../types';
import { circuitBreakerIntegration } from './circuitBreakerIntegration';
import { deduplicationIntegration } from './deduplicationIntegration';
import { requestExecutor } from './requestExecutor';

export class PriorityRequestProcessor {
  private queueManager: PriorityQueueManager;

  constructor(config?: Partial<PriorityQueueConfig>, eventHandlers?: QueueEventHandlers) {
    const defaultHandlers: QueueEventHandlers = {
      onRequestQueued: (request) => {
        console.log(`Request queued: ${request.id} (${request.priority} priority)`);
      },
      onRequestStarted: (request) => {
        console.log(`Request started: ${request.id} (${request.priority} priority)`);
      },
      onRequestCompleted: (request, result) => {
        console.log(`Request completed: ${request.id} (${request.priority} priority)`);
      },
      onRequestFailed: (request, error) => {
        console.log(`Request failed: ${request.id} (${request.priority} priority) - ${error.message}`);
      },
      onRequestTimeout: (request) => {
        console.log(`Request timeout: ${request.id} (${request.priority} priority)`);
      },
      onQueueOverflow: (request) => {
        console.log(`Queue overflow, dropped request: ${request.id} (${request.priority} priority)`);
      },
      ...eventHandlers
    };

    this.queueManager = new PriorityQueueManager(config, defaultHandlers);
  }

  async processRequest<T>(
    message: string,
    requestFn: () => Promise<T>,
    options: {
      priority?: RequestPriority;
      userId?: string;
      conversationId?: string;
      context?: any;
      useDeduplication?: boolean;
      useCircuitBreaker?: boolean;
      circuitBreakerName?: string;
      maxRetries?: number;
      timeoutMs?: number;
    } = {}
  ): Promise<T> {
    const {
      priority = 'normal',
      userId,
      conversationId,
      context,
      useDeduplication = true,
      useCircuitBreaker = true,
      circuitBreakerName,
      maxRetries,
      timeoutMs
    } = options;

    const requestId = requestExecutor.generateRequestId();
    const cbName = circuitBreakerName || circuitBreakerIntegration.generateCircuitBreakerName(context);
    
    const wrappedRequestFn = requestExecutor.createWrappedRequestFunction(
      requestFn, 
      useCircuitBreaker, 
      cbName
    );

    if (useDeduplication) {
      return deduplicationIntegration.executeWithDeduplication(
        message,
        () => this.executeWithPriority(requestId, message, wrappedRequestFn, priority, {
          userId,
          conversationId,
          context,
          maxRetries,
          timeoutMs
        }),
        priority,
        context,
        userId
      );
    }

    return this.executeWithPriority(requestId, message, wrappedRequestFn, priority, {
      userId,
      conversationId,
      context,
      maxRetries,
      timeoutMs
    });
  }

  private executeWithPriority<T>(
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
    }
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const priorityRequest = requestExecutor.createPriorityRequest(
        requestId,
        message,
        requestFn,
        priority,
        options,
        resolve,
        reject
      );

      const success = this.queueManager.enqueue(priorityRequest);
      if (!success) {
        reject(new Error('Failed to queue request - queue is full'));
      }
    });
  }

  // Queue management methods
  getStats(): QueueStats {
    return this.queueManager.getStats();
  }

  getQueueSize(priority?: RequestPriority): number {
    return this.queueManager.getQueueSize(priority);
  }

  getProcessingRequestsCount(): number {
    return this.queueManager.getProcessingRequestsCount();
  }

  cancelRequest(requestId: string): boolean {
    return this.queueManager.cancelRequest(requestId);
  }

  clearQueue(): void {
    this.queueManager.clear();
  }

  updateConfig(config: Partial<PriorityQueueConfig>): void {
    this.queueManager.updateConfig(config);
  }

  getConfig(): PriorityQueueConfig {
    return this.queueManager.getConfig();
  }
}
