
import { EnhancedPendingRequest, DeduplicationConfig } from './types';
import { RequestFingerprint } from '../requestFingerprinting';
import { FingerprintManager } from './fingerprintManager';

export class RequestManager {
  private pendingRequests = new Map<string, EnhancedPendingRequest>();
  private fingerprintManager: FingerprintManager;
  private config: DeduplicationConfig;

  constructor(fingerprintManager: FingerprintManager, config: DeduplicationConfig) {
    this.fingerprintManager = fingerprintManager;
    this.config = config;
  }

  addRequest(
    requestKey: string,
    fingerprint: RequestFingerprint,
    promise: Promise<any>
  ): void {
    const pendingRequest: EnhancedPendingRequest = {
      promise,
      timestamp: Date.now(),
      requestKey,
      fingerprint,
      hits: 1,
      lastAccessed: Date.now()
    };

    this.pendingRequests.set(requestKey, pendingRequest);
    this.fingerprintManager.addToIndex(fingerprint, requestKey);
  }

  removeRequest(requestKey: string): void {
    const request = this.pendingRequests.get(requestKey);
    if (request) {
      this.fingerprintManager.removeFromIndex(request.fingerprint, requestKey);
      this.pendingRequests.delete(requestKey);
    }
  }

  getRequest(requestKey: string): EnhancedPendingRequest | undefined {
    return this.pendingRequests.get(requestKey);
  }

  updateRequestAccess(requestKey: string): void {
    const request = this.pendingRequests.get(requestKey);
    if (request) {
      request.hits++;
      request.lastAccessed = Date.now();
    }
  }

  cleanupExpiredRequests(): string[] {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.config.REQUEST_TIMEOUT) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.removeRequest(key);
    }

    // Limit total pending requests
    if (this.pendingRequests.size > this.config.MAX_PENDING_REQUESTS) {
      const sortedRequests = Array.from(this.pendingRequests.entries())
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
        .slice(0, this.pendingRequests.size - this.config.MAX_PENDING_REQUESTS);

      for (const [key] of sortedRequests) {
        this.removeRequest(key);
      }
    }

    return expiredKeys;
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }

  getTopRequests(limit: number = 10) {
    return Array.from(this.pendingRequests.values())
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit)
      .map(req => ({
        key: req.requestKey,
        hits: req.hits,
        age: Date.now() - req.timestamp
      }));
  }

  clear(): void {
    this.pendingRequests.clear();
    this.fingerprintManager.clear();
  }

  getAllRequests(): Map<string, EnhancedPendingRequest> {
    return this.pendingRequests;
  }
}
