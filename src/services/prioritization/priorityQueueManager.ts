
import { PriorityRequest, RequestPriority, QueueStats, PriorityQueueConfig, QueueEventHandlers, DEFAULT_PRIORITY_CONFIG } from './types';

export class PriorityQueueManager {
  private queues: Map<RequestPriority, PriorityRequest[]> = new Map();
  private processingRequests = new Map<string, PriorityRequest>();
  private config: PriorityQueueConfig;
  private eventHandlers: QueueEventHandlers;
  private stats: QueueStats;
  private lastProcessedPriority: RequestPriority | null = null;
  private priorityOrder: RequestPriority[] = ['critical', 'high', 'normal', 'low'];

  constructor(config: Partial<PriorityQueueConfig> = {}, eventHandlers: QueueEventHandlers = {}) {
    this.config = { ...DEFAULT_PRIORITY_CONFIG, ...config };
    this.eventHandlers = eventHandlers;
    this.initializeQueues();
    this.initializeStats();
    this.startProcessing();
  }

  private initializeQueues(): void {
    for (const priority of this.priorityOrder) {
      this.queues.set(priority, []);
    }
  }

  private initializeStats(): void {
    this.stats = {
      totalRequests: 0,
      processingRequests: 0,
      completedRequests: 0,
      failedRequests: 0,
      queueSizes: {
        critical: 0,
        high: 0,
        normal: 0,
        low: 0
      },
      averageWaitTime: 0,
      averageProcessingTime: 0,
      throughput: 0
    };
  }

  enqueue(request: PriorityRequest): boolean {
    // Check if queue is full
    const totalQueueSize = this.getTotalQueueSize();
    if (totalQueueSize >= this.config.maxQueueSize) {
      // Try to drop lowest priority request
      if (!this.dropLowestPriorityRequest()) {
        this.eventHandlers.onQueueOverflow?.(request);
        return false;
      }
    }

    // Add timestamp and defaults if not provided
    const enhancedRequest: PriorityRequest = {
      ...request,
      timestamp: request.timestamp || Date.now(),
      retryCount: request.retryCount || 0,
      maxRetries: request.maxRetries || this.config.retryAttempts,
      timeoutMs: request.timeoutMs || this.config.timeoutMs
    };

    const queue = this.queues.get(request.priority);
    if (queue) {
      queue.push(enhancedRequest);
      this.updateQueueStats();
      this.stats.totalRequests++;
      this.eventHandlers.onRequestQueued?.(enhancedRequest);
      return true;
    }

    return false;
  }

  private dropLowestPriorityRequest(): boolean {
    for (let i = this.priorityOrder.length - 1; i >= 0; i--) {
      const priority = this.priorityOrder[i];
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        const droppedRequest = queue.shift()!;
        this.eventHandlers.onQueueOverflow?.(droppedRequest);
        return true;
      }
    }
    return false;
  }

  private async startProcessing(): Promise<void> {
    setInterval(() => {
      this.processNextRequest();
    }, 10); // Check every 10ms for new requests

    // Starvation prevention check
    setInterval(() => {
      this.preventStarvation();
    }, 5000); // Check every 5 seconds
  }

  private async processNextRequest(): Promise<void> {
    if (this.processingRequests.size >= this.config.maxConcurrentRequests) {
      return;
    }

    const nextRequest = this.getNextRequest();
    if (!nextRequest) {
      return;
    }

    await this.executeRequest(nextRequest);
  }

  private getNextRequest(): PriorityRequest | null {
    // Check for starvation first
    const starvedRequest = this.getStarvedRequest();
    if (starvedRequest) {
      return starvedRequest;
    }

    // Use fairness-based selection
    const selectedPriority = this.selectPriorityWithFairness();
    if (!selectedPriority) {
      return null;
    }

    const queue = this.queues.get(selectedPriority);
    return queue && queue.length > 0 ? queue.shift()! : null;
  }

  private getStarvedRequest(): PriorityRequest | null {
    const now = Date.now();
    
    for (const priority of [...this.priorityOrder].reverse()) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        const oldestRequest = queue[0];
        if (now - oldestRequest.timestamp > this.config.starvationPreventionMs) {
          return queue.shift()!;
        }
      }
    }
    
    return null;
  }

  private selectPriorityWithFairness(): RequestPriority | null {
    // Simple fairness algorithm: occasionally process lower priority requests
    const shouldUseFairness = Math.random() > this.config.fairnessRatio;
    
    if (shouldUseFairness && this.lastProcessedPriority) {
      // Try to select a different priority
      for (const priority of this.priorityOrder) {
        if (priority !== this.lastProcessedPriority) {
          const queue = this.queues.get(priority);
          if (queue && queue.length > 0) {
            this.lastProcessedPriority = priority;
            return priority;
          }
        }
      }
    }

    // Default priority-based selection
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        this.lastProcessedPriority = priority;
        return priority;
      }
    }

    return null;
  }

  private async executeRequest(request: PriorityRequest): Promise<void> {
    const startTime = Date.now();
    this.processingRequests.set(request.id, request);
    this.stats.processingRequests++;
    this.eventHandlers.onRequestStarted?.(request);

    try {
      // Set up timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), request.timeoutMs!);
      });

      // Execute request with timeout
      const result = await Promise.race([
        request.requestFn(),
        timeoutPromise
      ]);

      // Success
      const processingTime = Date.now() - startTime;
      this.handleRequestSuccess(request, result, processingTime);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.handleRequestError(request, error as Error, processingTime);
    } finally {
      this.processingRequests.delete(request.id);
      this.stats.processingRequests--;
      this.updateQueueStats();
    }
  }

  private handleRequestSuccess(request: PriorityRequest, result: any, processingTime: number): void {
    this.stats.completedRequests++;
    this.updateAverageProcessingTime(processingTime);
    this.eventHandlers.onRequestCompleted?.(request, result);
    request.onSuccess?.(result);
  }

  private handleRequestError(request: PriorityRequest, error: Error, processingTime: number): void {
    if (error.message === 'Request timeout') {
      this.eventHandlers.onRequestTimeout?.(request);
      request.onTimeout?.();
    }

    // Retry logic
    if (request.retryCount! < request.maxRetries!) {
      request.retryCount = (request.retryCount || 0) + 1;
      // Re-queue with slight delay
      setTimeout(() => {
        this.enqueue(request);
      }, Math.pow(2, request.retryCount!) * 1000); // Exponential backoff
      return;
    }

    // Final failure
    this.stats.failedRequests++;
    this.updateAverageProcessingTime(processingTime);
    this.eventHandlers.onRequestFailed?.(request, error);
    request.onError?.(error);
  }

  private preventStarvation(): void {
    const now = Date.now();
    
    for (const priority of [...this.priorityOrder].reverse()) {
      const queue = this.queues.get(priority);
      if (queue && queue.length > 0) {
        const request = queue[0];
        if (now - request.timestamp > this.config.starvationPreventionMs) {
          console.log(`Preventing starvation for ${priority} priority request: ${request.id}`);
          // Force process this request by temporarily increasing its priority
          const urgentRequest = { ...request, priority: 'critical' as RequestPriority };
          queue.shift(); // Remove from current queue
          this.queues.get('critical')!.unshift(urgentRequest); // Add to front of critical queue
        }
      }
    }
  }

  private getTotalQueueSize(): number {
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.length;
    }
    return total;
  }

  private updateQueueStats(): void {
    for (const priority of this.priorityOrder) {
      const queue = this.queues.get(priority);
      this.stats.queueSizes[priority] = queue ? queue.length : 0;
    }
  }

  private updateAverageProcessingTime(processingTime: number): void {
    const totalProcessed = this.stats.completedRequests + this.stats.failedRequests;
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (totalProcessed - 1) + processingTime) / totalProcessed;
  }

  // Public methods
  getStats(): QueueStats {
    return { ...this.stats };
  }

  clear(): void {
    for (const queue of this.queues.values()) {
      queue.length = 0;
    }
    this.processingRequests.clear();
    this.initializeStats();
  }

  updateConfig(newConfig: Partial<PriorityQueueConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): PriorityQueueConfig {
    return { ...this.config };
  }

  cancelRequest(requestId: string): boolean {
    // Try to find and remove from queues
    for (const queue of this.queues.values()) {
      const index = queue.findIndex(req => req.id === requestId);
      if (index > -1) {
        queue.splice(index, 1);
        this.updateQueueStats();
        return true;
      }
    }

    // Check if currently processing
    const processingRequest = this.processingRequests.get(requestId);
    if (processingRequest) {
      // Can't cancel currently processing request directly
      // But we can mark it for cancellation
      console.log(`Request ${requestId} is currently processing and cannot be cancelled`);
      return false;
    }

    return false;
  }

  getQueueSize(priority?: RequestPriority): number {
    if (priority) {
      const queue = this.queues.get(priority);
      return queue ? queue.length : 0;
    }
    return this.getTotalQueueSize();
  }

  getProcessingRequestsCount(): number {
    return this.processingRequests.size;
  }
}
