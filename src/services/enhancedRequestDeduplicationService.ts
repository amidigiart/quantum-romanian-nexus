
import { requestFingerprintingService, RequestFingerprintingService, RequestFingerprint } from './requestFingerprinting';

interface EnhancedPendingRequest {
  promise: Promise<any>;
  timestamp: number;
  requestKey: string;
  fingerprint: RequestFingerprint;
  hits: number;
  lastAccessed: number;
}

interface DeduplicationStats {
  totalRequests: number;
  duplicatedRequests: number;
  uniqueRequests: number;
  cacheHitRate: number;
  averageResponseTime: number;
  semanticMatches: number;
  exactMatches: number;
}

export class EnhancedRequestDeduplicationService {
  private pendingRequests = new Map<string, EnhancedPendingRequest>();
  private fingerprintIndex = new Map<string, string[]>(); // fingerprint -> request keys
  private stats: DeduplicationStats;
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_PENDING_REQUESTS = 1000;
  private fingerprintingService: RequestFingerprintingService;

  constructor() {
    this.fingerprintingService = requestFingerprintingService;
    this.resetStats();
  }

  private resetStats(): void {
    this.stats = {
      totalRequests: 0,
      duplicatedRequests: 0,
      uniqueRequests: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      semanticMatches: 0,
      exactMatches: 0
    };
  }

  private generateRequestKey(
    message: string,
    context?: any,
    userId?: string
  ): string {
    const fingerprint = this.fingerprintingService.generateFingerprint(message, context, userId);
    return `${fingerprint.contentHash}:${fingerprint.semanticHash}:${fingerprint.contextHash}`;
  }

  private findSimilarRequest(fingerprint: import('./requestFingerprinting').RequestFingerprint): string | null {
    // First, look for exact fingerprint matches
    const fingerprintKey = `${fingerprint.contentHash}:${fingerprint.semanticHash}:${fingerprint.contextHash}`;
    const exactMatches = this.fingerprintIndex.get(fingerprintKey);
    
    if (exactMatches && exactMatches.length > 0) {
      const activeMatch = exactMatches.find(key => this.pendingRequests.has(key));
      if (activeMatch) {
        this.stats.exactMatches++;
        return activeMatch;
      }
    }

    // Then, look for semantic similarity
    for (const [, requestKeys] of this.fingerprintIndex) {
      for (const requestKey of requestKeys) {
        const request = this.pendingRequests.get(requestKey);
        if (request && this.fingerprintingService.areSimilar(fingerprint, request.fingerprint)) {
          this.stats.semanticMatches++;
          return requestKey;
        }
      }
    }

    return null;
  }

  private addToFingerprintIndex(fingerprint: import('./requestFingerprinting').RequestFingerprint, requestKey: string): void {
    const fingerprintKey = `${fingerprint.contentHash}:${fingerprint.semanticHash}:${fingerprint.contextHash}`;
    
    if (!this.fingerprintIndex.has(fingerprintKey)) {
      this.fingerprintIndex.set(fingerprintKey, []);
    }
    
    this.fingerprintIndex.get(fingerprintKey)!.push(requestKey);
  }

  private removeFromFingerprintIndex(fingerprint: import('./requestFingerprinting').RequestFingerprint, requestKey: string): void {
    const fingerprintKey = `${fingerprint.contentHash}:${fingerprint.semanticHash}:${fingerprint.contextHash}`;
    const keys = this.fingerprintIndex.get(fingerprintKey);
    
    if (keys) {
      const index = keys.indexOf(requestKey);
      if (index > -1) {
        keys.splice(index, 1);
        if (keys.length === 0) {
          this.fingerprintIndex.delete(fingerprintKey);
        }
      }
    }
  }

  private cleanupExpiredRequests(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.REQUEST_TIMEOUT) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      const request = this.pendingRequests.get(key);
      if (request) {
        this.removeFromFingerprintIndex(request.fingerprint, key);
        this.pendingRequests.delete(key);
      }
    }

    // Limit total pending requests
    if (this.pendingRequests.size > this.MAX_PENDING_REQUESTS) {
      const sortedRequests = Array.from(this.pendingRequests.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
        .slice(0, this.pendingRequests.size - this.MAX_PENDING_REQUESTS);

      for (const [key, request] of sortedRequests) {
        this.removeFromFingerprintIndex(request.fingerprint, key);
        this.pendingRequests.delete(key);
      }
    }

    console.log(`Cleaned up ${expiredKeys.length} expired requests`);
  }

  private updateStats(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.cacheHitRate = this.stats.duplicatedRequests / this.stats.totalRequests;
      this.stats.uniqueRequests = this.stats.totalRequests - this.stats.duplicatedRequests;
    }
  }

  async deduplicateRequest<T>(
    message: string,
    requestFn: () => Promise<T>,
    context?: any,
    userId?: string
  ): Promise<T> {
    const startTime = performance.now();
    this.stats.totalRequests++;
    
    this.cleanupExpiredRequests();
    
    const fingerprint = this.fingerprintingService.generateFingerprint(message, context, userId);
    const requestKey = this.generateRequestKey(message, context, userId);
    
    // Check for existing similar request
    const similarRequestKey = this.findSimilarRequest(fingerprint);
    if (similarRequestKey) {
      const existingRequest = this.pendingRequests.get(similarRequestKey);
      if (existingRequest) {
        console.log(`Deduplicating request using fingerprint: ${similarRequestKey}`);
        existingRequest.hits++;
        existingRequest.lastAccessed = Date.now();
        this.stats.duplicatedRequests++;
        this.updateStats();
        return existingRequest.promise as Promise<T>;
      }
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      const request = this.pendingRequests.get(requestKey);
      if (request) {
        this.removeFromFingerprintIndex(request.fingerprint, requestKey);
        this.pendingRequests.delete(requestKey);
      }
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      this.stats.averageResponseTime = 
        (this.stats.averageResponseTime * (this.stats.uniqueRequests - 1) + responseTime) / this.stats.uniqueRequests;
    });

    // Store the pending request
    const pendingRequest: EnhancedPendingRequest = {
      promise,
      timestamp: Date.now(),
      requestKey,
      fingerprint,
      hits: 1,
      lastAccessed: Date.now()
    };

    this.pendingRequests.set(requestKey, pendingRequest);
    this.addToFingerprintIndex(fingerprint, requestKey);
    this.updateStats();

    console.log(`New request started with enhanced fingerprinting: ${requestKey}`);
    return promise;
  }

  isRequestPending(message: string, context?: any, userId?: string): boolean {
    const fingerprint = this.fingerprintingService.generateFingerprint(message, context, userId);
    return this.findSimilarRequest(fingerprint) !== null;
  }

  cancelRequest(message: string, context?: any, userId?: string): void {
    const fingerprint = this.fingerprintingService.generateFingerprint(message, context, userId);
    const similarRequestKey = this.findSimilarRequest(fingerprint);
    
    if (similarRequestKey && this.pendingRequests.has(similarRequestKey)) {
      const request = this.pendingRequests.get(similarRequestKey)!;
      this.removeFromFingerprintIndex(request.fingerprint, similarRequestKey);
      this.pendingRequests.delete(similarRequestKey);
      console.log(`Request cancelled: ${similarRequestKey}`);
    }
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }

  getStats(): DeduplicationStats {
    this.updateStats();
    return { ...this.stats };
  }

  getDetailedStats() {
    return {
      ...this.getStats(),
      pendingRequestsCount: this.getPendingRequestsCount(),
      fingerprintIndexSize: this.fingerprintIndex.size,
      fingerprintingStats: this.fingerprintingService.getCacheStats(),
      topRequests: Array.from(this.pendingRequests.values())
        .sort((a, b) => b.hits - a.hits)
        .slice(0, 10)
        .map(req => ({
          key: req.requestKey,
          hits: req.hits,
          age: Date.now() - req.timestamp
        }))
    };
  }

  clearAllRequests(): void {
    this.pendingRequests.clear();
    this.fingerprintIndex.clear();
    this.resetStats();
    console.log('All pending requests cleared');
  }

  // Configuration methods
  updateFingerprintingConfig(config: Partial<Parameters<RequestFingerprintingService['updateConfig']>[0]>): void {
    this.fingerprintingService.updateConfig(config);
  }

  getFingerprintingConfig() {
    return this.fingerprintingService.getConfig();
  }
}

export const enhancedRequestDeduplicationService = new EnhancedRequestDeduplicationService();
