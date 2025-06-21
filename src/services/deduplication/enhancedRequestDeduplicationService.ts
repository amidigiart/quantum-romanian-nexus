import { requestFingerprintingService, RequestFingerprintingService } from '../requestFingerprinting';
import { intelligentRequestCancellationService } from '../intelligentRequestCancellationService';
import { priorityRequestService } from '../priorityRequestService';
import { DeduplicationStats, DEFAULT_DEDUPLICATION_CONFIG } from './types';
import { FingerprintManager } from './fingerprintManager';
import { RequestManager } from './requestManager';
import { StatsManager } from './statsManager';

export class EnhancedRequestDeduplicationService {
  private fingerprintingService: RequestFingerprintingService;
  private fingerprintManager: FingerprintManager;
  private requestManager: RequestManager;
  private statsManager: StatsManager;

  constructor() {
    this.fingerprintingService = requestFingerprintingService;
    this.fingerprintManager = new FingerprintManager();
    this.requestManager = new RequestManager(this.fingerprintManager, DEFAULT_DEDUPLICATION_CONFIG);
    this.statsManager = new StatsManager();
  }

  private generateRequestKey(
    message: string,
    context?: any,
    userId?: string
  ): string {
    const fingerprint = this.fingerprintingService.generateFingerprint(message, context, userId);
    return `${fingerprint.contentHash}:${fingerprint.semanticHash}:${fingerprint.contextHash}`;
  }

  private async createCancellableRequest<T>(
    requestFn: () => Promise<T>,
    abortController: AbortController
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Handle abort signal
      if (abortController.signal.aborted) {
        reject(new Error('Request was cancelled before starting'));
        return;
      }

      // Set up abort listener
      const abortListener = () => {
        reject(new Error('Request was cancelled'));
      };
      abortController.signal.addEventListener('abort', abortListener);

      // Execute the request
      requestFn()
        .then(result => {
          if (abortController.signal.aborted) {
            reject(new Error('Request was cancelled'));
          } else {
            resolve(result);
          }
        })
        .catch(error => {
          if (abortController.signal.aborted) {
            reject(new Error('Request was cancelled'));
          } else {
            reject(error);
          }
        })
        .finally(() => {
          abortController.signal.removeEventListener('abort', abortListener);
        });
    });
  }

  async deduplicateRequest<T>(
    message: string,
    requestFn: () => Promise<T>,
    context?: any,
    userId?: string,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    const startTime = performance.now();
    this.statsManager.incrementTotalRequests();
    
    const expiredKeys = this.requestManager.cleanupExpiredRequests();
    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired requests`);
    }
    
    const fingerprint = this.fingerprintingService.generateFingerprint(message, context, userId);
    const requestKey = this.generateRequestKey(message, context, userId);
    
    // Check for existing similar request
    const similarRequestKey = this.fingerprintManager.findSimilarRequest(
      fingerprint,
      this.requestManager.getAllRequests(),
      this.fingerprintingService,
      (type) => {
        if (type === 'exact') this.statsManager.incrementExactMatches();
        if (type === 'semantic') this.statsManager.incrementSemanticMatches();
      }
    );

    if (similarRequestKey) {
      const existingRequest = this.requestManager.getRequest(similarRequestKey);
      if (existingRequest) {
        console.log(`Deduplicating request using fingerprint: ${similarRequestKey}`);
        this.requestManager.updateRequestAccess(similarRequestKey);
        this.statsManager.incrementDuplicatedRequests();
        return existingRequest.promise as Promise<T>;
      }
    }

    // Use priority request service for new requests
    const promise = priorityRequestService.submitRequest(
      message,
      requestFn,
      {
        priority,
        userId,
        conversationId: context?.conversationId,
        context,
        useDeduplication: false // Already handled here
      }
    ).finally(() => {
      // Clean up after request completes
      this.requestManager.removeRequest(requestKey);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      this.statsManager.updateAverageResponseTime(responseTime);
    });

    // Store the pending request
    const fingerprint2 = this.fingerprintingService.generateFingerprint(message, context, userId);
    this.requestManager.addRequest(requestKey, fingerprint2, promise);

    console.log(`New request started with priority: ${priority} - ${requestKey}`);
    return promise;
  }

  async deduplicateRequestWithPriority<T>(
    message: string,
    requestFn: () => Promise<T>,
    priority: 'critical' | 'high' | 'normal' | 'low',
    context?: any,
    userId?: string
  ): Promise<T> {
    return this.deduplicateRequest(message, requestFn, context, userId, priority);
  }

  isRequestPending(message: string, context?: any, userId?: string): boolean {
    const fingerprint = this.fingerprintingService.generateFingerprint(message, context, userId);
    return this.fingerprintManager.findSimilarRequest(
      fingerprint,
      this.requestManager.getAllRequests(),
      this.fingerprintingService,
      () => {}
    ) !== null;
  }

  cancelRequest(message: string, context?: any, userId?: string): void {
    const fingerprint = this.fingerprintingService.generateFingerprint(message, context, userId);
    const similarRequestKey = this.fingerprintManager.findSimilarRequest(
      fingerprint,
      this.requestManager.getAllRequests(),
      this.fingerprintingService,
      () => {}
    );
    
    if (similarRequestKey && this.requestManager.getRequest(similarRequestKey)) {
      // Cancel through intelligent cancellation service
      intelligentRequestCancellationService.cancelRequest(similarRequestKey, 'manual');
      this.requestManager.removeRequest(similarRequestKey);
      console.log(`Request cancelled: ${similarRequestKey}`);
    }
  }

  cancelUserRequests(userId: string): number {
    return intelligentRequestCancellationService.cancelUserRequests(userId);
  }

  cancelConversationRequests(conversationId: string): number {
    return intelligentRequestCancellationService.cancelConversationRequests(conversationId);
  }

  getPendingRequestsCount(): number {
    return this.requestManager.getPendingRequestsCount();
  }

  getStats(): DeduplicationStats {
    return this.statsManager.getStats();
  }

  getDetailedStats() {
    return {
      ...this.getStats(),
      pendingRequestsCount: this.getPendingRequestsCount(),
      fingerprintIndexSize: this.fingerprintManager.getIndexSize(),
      fingerprintingStats: this.fingerprintingService.getCacheStats(),
      cancellationStats: intelligentRequestCancellationService.getCancellationStats(),
      topRequests: this.requestManager.getTopRequests(10),
      priorityQueueStats: priorityRequestService.getDetailedStats()
    };
  }

  clearAllRequests(): void {
    this.requestManager.clear();
    this.statsManager.reset();
    console.log('All pending requests cleared');
  }

  // Configuration methods
  updateFingerprintingConfig(config: Partial<Parameters<RequestFingerprintingService['updateConfig']>[0]>): void {
    this.fingerprintingService.updateConfig(config);
  }

  getFingerprintingConfig() {
    return this.fingerprintingService.getConfig();
  }

  // Priority queue management methods
  getPriorityQueueStats() {
    return priorityRequestService.getStats();
  }

  updatePriorityConfig(config: Partial<import('./types').DeduplicationConfig & import('../priorityRequestService').PriorityQueueConfig>): void {
    if (config.REQUEST_TIMEOUT || config.MAX_PENDING_REQUESTS) {
      // Update deduplication config
      // Would need to implement in requestManager
    }
    
    priorityRequestService.updateConfig(config);
  }
}

export const enhancedRequestDeduplicationService = new EnhancedRequestDeduplicationService();
