
import { PriorityRequestProcessor } from './core/priorityRequestProcessor';
import { RequestPriority, QueueStats, PriorityQueueConfig, QueueEventHandlers } from './types';
import { circuitBreakerIntegration } from './core/circuitBreakerIntegration';
import { deduplicationIntegration } from './core/deduplicationIntegration';

export class PriorityRequestService {
  private processor: PriorityRequestProcessor;

  constructor(config?: Partial<PriorityQueueConfig>, eventHandlers?: QueueEventHandlers) {
    this.processor = new PriorityRequestProcessor(config, eventHandlers);
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
    return this.processor.processRequest(message, requestFn, options);
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
    return this.processor.getStats();
  }

  getQueueSize(priority?: RequestPriority): number {
    return this.processor.getQueueSize(priority);
  }

  getProcessingRequestsCount(): number {
    return this.processor.getProcessingRequestsCount();
  }

  cancelRequest(requestId: string): boolean {
    return this.processor.cancelRequest(requestId);
  }

  clearQueue(): void {
    this.processor.clearQueue();
  }

  updateConfig(config: Partial<PriorityQueueConfig>): void {
    this.processor.updateConfig(config);
  }

  getConfig(): PriorityQueueConfig {
    return this.processor.getConfig();
  }

  // User-specific queue management
  cancelUserRequests(userId: string): number {
    console.log(`Cancelling requests for user: ${userId}`);
    return deduplicationIntegration.cancelUserRequests(userId);
  }

  getDetailedStats() {
    const basicStats = this.getStats();
    const config = this.getConfig();
    const circuitBreakerStats = circuitBreakerIntegration.getCircuitBreakerStats();
    
    return {
      ...basicStats,
      config,
      totalQueueSize: this.getQueueSize(),
      processingCount: this.getProcessingRequestsCount(),
      queueUtilization: (this.getQueueSize() / config.maxQueueSize) * 100,
      processingUtilization: (this.getProcessingRequestsCount() / config.maxConcurrentRequests) * 100,
      circuitBreakers: circuitBreakerStats,
      deduplication: deduplicationIntegration.getDeduplicationStats()
    };
  }

  // Circuit breaker management methods
  getCircuitBreakerStats(name?: string) {
    return circuitBreakerIntegration.getCircuitBreakerStats(name);
  }

  isCircuitOpen(name: string): boolean {
    return circuitBreakerIntegration.isCircuitOpen(name);
  }

  updateCircuitBreakerConfig(name: string, config: any): boolean {
    return circuitBreakerIntegration.updateCircuitBreakerConfig(name, config);
  }
}

export const priorityRequestService = new PriorityRequestService();
