
import { PriorityQueueManager } from './priorityQueueManager';
import { PriorityRequest, RequestPriority, QueueStats, PriorityQueueConfig, QueueEventHandlers } from './types';
import { enhancedRequestDeduplicationService } from '../enhancedRequestDeduplicationService';

export class PriorityRequestService {
  private queueManager: PriorityQueueManager;
  private requestCounter = 0;

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

  async submitRequest<T>(
    message: string,
    requestFn: () => Promise<T>,
    options: {
      priority?: RequestPriority;
      userId?: string;
      conversationId?: string;
      context?: any;
      useDeduplication?: boolean;
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
      maxRetries,
      timeoutMs
    } = options;

    // Generate unique request ID
    const requestId = `req_${++this.requestCounter}_${Date.now()}`;

    // Use deduplication if enabled
    if (useDeduplication) {
      return enhancedRequestDeduplicationService.deduplicateRequest(
        message,
        () => this.executeWithPriority(requestId, message, requestFn, priority, {
          userId,
          conversationId,
          context,
          maxRetries,
          timeoutMs
        }),
        context,
        userId
      );
    }

    return this.executeWithPriority(requestId, message, requestFn, priority, {
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
      const priorityRequest: PriorityRequest = {
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
        onError: reject
      };

      const success = this.queueManager.enqueue(priorityRequest);
      if (!success) {
        reject(new Error('Failed to queue request - queue is full'));
      }
    });
  }

  // Convenience methods for different priority levels
  async submitCriticalRequest<T>(
    message: string,
    requestFn: () => Promise<T>,
    options: Omit<Parameters<typeof this.submitRequest>[2], 'priority'> = {}
  ): Promise<T> {
    return this.submitRequest(message, requestFn, { ...options, priority: 'critical' });
  }

  async submitHighPriorityRequest<T>(
    message: string,
    requestFn: () => Promise<T>,
    options: Omit<Parameters<typeof this.submitRequest>[2], 'priority'> = {}
  ): Promise<T> {
    return this.submitRequest(message, requestFn, { ...options, priority: 'high' });
  }

  async submitLowPriorityRequest<T>(
    message: string,
    requestFn: () => Promise<T>,
    options: Omit<Parameters<typeof this.submitRequest>[2], 'priority'> = {}
  ): Promise<T> {
    return this.submitRequest(message, requestFn, { ...options, priority: 'low' });
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

  // User-specific queue management
  cancelUserRequests(userId: string): number {
    // This would require additional tracking in the queue manager
    // For now, we'll return 0 and log the intention
    console.log(`Cancelling requests for user: ${userId}`);
    return 0;
  }

  getDetailedStats() {
    const basicStats = this.getStats();
    const config = this.getConfig();
    
    return {
      ...basicStats,
      config,
      totalQueueSize: this.getQueueSize(),
      processingCount: this.getProcessingRequestsCount(),
      queueUtilization: (this.getQueueSize() / config.maxQueueSize) * 100,
      processingUtilization: (this.getProcessingRequestsCount() / config.maxConcurrentRequests) * 100
    };
  }
}

export const priorityRequestService = new PriorityRequestService();
