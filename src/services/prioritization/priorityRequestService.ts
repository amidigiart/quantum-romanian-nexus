
import { PriorityQueueManager } from './priorityQueueManager';
import { PriorityRequest, RequestPriority, QueueStats, PriorityQueueConfig, QueueEventHandlers } from './types';
import { enhancedRequestDeduplicationService } from '../enhancedRequestDeduplicationService';
import { circuitBreakerManager } from '../circuitBreaker';
import { CircuitBreakerOpenError } from '../circuitBreaker/types';

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

    // Generate unique request ID
    const requestId = `req_${++this.requestCounter}_${Date.now()}`;

    // Generate circuit breaker name if not provided
    const cbName = circuitBreakerName || this.generateCircuitBreakerName(context);

    // Wrap request function with circuit breaker if enabled
    const wrappedRequestFn = useCircuitBreaker
      ? () => circuitBreakerManager.executeWithCircuitBreaker(cbName, requestFn)
      : requestFn;

    // Use deduplication if enabled
    if (useDeduplication) {
      return enhancedRequestDeduplicationService.deduplicateRequest(
        message,
        () => this.executeWithPriority(requestId, message, wrappedRequestFn, priority, {
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

    return this.executeWithPriority(requestId, message, wrappedRequestFn, priority, {
      userId,
      conversationId,
      context,
      maxRetries,
      timeoutMs
    });
  }

  private generateCircuitBreakerName(context?: any): string {
    if (context?.provider && context?.model) {
      return `${context.provider}-${context.model}`;
    }
    if (context?.provider) {
      return context.provider;
    }
    return 'default-circuit';
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
        onError: (error) => {
          // Handle circuit breaker errors with special messaging
          if (error instanceof CircuitBreakerOpenError) {
            const friendlyError = new Error(
              'Service is temporarily unavailable due to too many failures. Please try again later.'
            );
            friendlyError.name = 'ServiceUnavailableError';
            reject(friendlyError);
          } else {
            reject(error);
          }
        }
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
    const circuitBreakerStats = circuitBreakerManager.getAllStats();
    
    return {
      ...basicStats,
      config,
      totalQueueSize: this.getQueueSize(),
      processingCount: this.getProcessingRequestsCount(),
      queueUtilization: (this.getQueueSize() / config.maxQueueSize) * 100,
      processingUtilization: (this.getProcessingRequestsCount() / config.maxConcurrentRequests) * 100,
      circuitBreakers: circuitBreakerStats
    };
  }

  // Circuit breaker management methods
  getCircuitBreakerStats(name?: string) {
    if (name) {
      return circuitBreakerManager.getCircuitBreakerStats(name);
    }
    return circuitBreakerManager.getAllStats();
  }

  isCircuitOpen(name: string): boolean {
    return circuitBreakerManager.isCircuitOpen(name);
  }

  updateCircuitBreakerConfig(name: string, config: any): boolean {
    return circuitBreakerManager.updateCircuitBreakerConfig(name, config);
  }
}

export const priorityRequestService = new PriorityRequestService();
