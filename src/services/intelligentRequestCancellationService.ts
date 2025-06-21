
import { RequestFingerprint, requestFingerprintingService } from './requestFingerprinting';

interface CancellableRequest {
  id: string;
  fingerprint: RequestFingerprint;
  abortController: AbortController;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
  userId?: string;
  conversationId?: string;
}

interface CancellationRule {
  name: string;
  shouldCancel: (existing: CancellableRequest, incoming: RequestFingerprint) => boolean;
  description: string;
}

export class IntelligentRequestCancellationService {
  private activeRequests = new Map<string, CancellableRequest>();
  private cancellationRules: CancellationRule[] = [];
  private cancellationStats = {
    totalCancellations: 0,
    supersededRequests: 0,
    duplicateRequests: 0,
    timeoutCancellations: 0,
    manualCancellations: 0
  };

  constructor() {
    this.initializeDefaultRules();
    this.startCleanupInterval();
  }

  private initializeDefaultRules(): void {
    // Rule 1: Cancel if newer request supersedes older one
    this.cancellationRules.push({
      name: 'supersession',
      shouldCancel: (existing, incoming) => {
        return requestFingerprintingService.shouldSupersede(existing.fingerprint, incoming);
      },
      description: 'Cancel requests superseded by newer, similar requests'
    });

    // Rule 2: Cancel exact duplicates (except for the most recent)
    this.cancellationRules.push({
      name: 'exact_duplicate',
      shouldCancel: (existing, incoming) => {
        return existing.fingerprint.contentHash === incoming.contentHash &&
               existing.fingerprint.userHash === incoming.userHash;
      },
      description: 'Cancel exact duplicate requests'
    });

    // Rule 3: Cancel older similar requests from same user
    this.cancellationRules.push({
      name: 'similar_user_request',
      shouldCancel: (existing, incoming) => {
        if (existing.fingerprint.userHash !== incoming.userHash) return false;
        
        const similarity = requestFingerprintingService.calculateSimilarity(existing.fingerprint, incoming);
        const timeDiff = incoming.timestamp - existing.fingerprint.timestamp;
        
        // Cancel if very similar and within 60 seconds
        return similarity > 0.8 && timeDiff < 60000;
      },
      description: 'Cancel similar requests from the same user within a short timeframe'
    });

    // Rule 4: Cancel low priority requests when high priority ones come in
    this.cancellationRules.push({
      name: 'priority_override',
      shouldCancel: (existing, incoming) => {
        return existing.priority === 'low' && 
               existing.fingerprint.userHash === incoming.userHash;
      },
      description: 'Cancel low priority requests when new requests come from the same user'
    });
  }

  registerRequest(
    requestId: string,
    message: string,
    context?: any,
    userId?: string,
    priority: 'low' | 'normal' | 'high' = 'normal',
    conversationId?: string
  ): AbortController {
    const fingerprint = requestFingerprintingService.generateFingerprint(message, context, userId);
    const abortController = new AbortController();

    // Check if we should cancel any existing requests
    this.evaluateCancellations(fingerprint);

    // Register the new request
    const request: CancellableRequest = {
      id: requestId,
      fingerprint,
      abortController,
      timestamp: Date.now(),
      priority,
      userId,
      conversationId
    };

    this.activeRequests.set(requestId, request);

    console.log(`Registered request ${requestId} with intelligent cancellation`);
    return abortController;
  }

  private evaluateCancellations(incomingFingerprint: RequestFingerprint): void {
    const requestsToCancel: string[] = [];

    for (const [requestId, request] of this.activeRequests.entries()) {
      for (const rule of this.cancellationRules) {
        if (rule.shouldCancel(request, incomingFingerprint)) {
          requestsToCancel.push(requestId);
          console.log(`Request ${requestId} marked for cancellation by rule: ${rule.name}`);
          
          // Update stats based on rule
          if (rule.name === 'supersession') {
            this.cancellationStats.supersededRequests++;
          } else if (rule.name === 'exact_duplicate') {
            this.cancellationStats.duplicateRequests++;
          }
          
          break; // Don't apply multiple rules to the same request
        }
      }
    }

    // Cancel the marked requests
    for (const requestId of requestsToCancel) {
      this.cancelRequest(requestId, 'intelligent_cancellation');
    }
  }

  cancelRequest(requestId: string, reason: string = 'manual'): boolean {
    const request = this.activeRequests.get(requestId);
    
    if (request && !request.abortController.signal.aborted) {
      request.abortController.abort();
      this.activeRequests.delete(requestId);
      this.cancellationStats.totalCancellations++;
      
      if (reason === 'manual') {
        this.cancellationStats.manualCancellations++;
      }
      
      console.log(`Request ${requestId} cancelled: ${reason}`);
      return true;
    }
    
    return false;
  }

  cancelUserRequests(userId: string): number {
    let cancelledCount = 0;
    
    for (const [requestId, request] of this.activeRequests.entries()) {
      if (request.userId === userId) {
        if (this.cancelRequest(requestId, 'user_cancellation')) {
          cancelledCount++;
        }
      }
    }
    
    return cancelledCount;
  }

  cancelConversationRequests(conversationId: string): number {
    let cancelledCount = 0;
    
    for (const [requestId, request] of this.activeRequests.entries()) {
      if (request.conversationId === conversationId) {
        if (this.cancelRequest(requestId, 'conversation_cancellation')) {
          cancelledCount++;
        }
      }
    }
    
    return cancelledCount;
  }

  completeRequest(requestId: string): void {
    const request = this.activeRequests.get(requestId);
    if (request) {
      this.activeRequests.delete(requestId);
      console.log(`Request ${requestId} completed`);
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      const expiredRequests: string[] = [];
      
      for (const [requestId, request] of this.activeRequests.entries()) {
        // Cancel requests older than 5 minutes
        if (now - request.timestamp > 300000) {
          expiredRequests.push(requestId);
        }
      }
      
      for (const requestId of expiredRequests) {
        this.cancelRequest(requestId, 'timeout');
        this.cancellationStats.timeoutCancellations++;
      }
      
      if (expiredRequests.length > 0) {
        console.log(`Cleaned up ${expiredRequests.length} expired requests`);
      }
    }, 60000); // Check every minute
  }

  getActiveRequestsCount(): number {
    return this.activeRequests.size;
  }

  getActiveRequestsByUser(userId: string): CancellableRequest[] {
    return Array.from(this.activeRequests.values())
      .filter(request => request.userId === userId);
  }

  getCancellationStats() {
    return {
      ...this.cancellationStats,
      activeRequestsCount: this.activeRequests.size,
      rulesCount: this.cancellationRules.length
    };
  }

  addCancellationRule(rule: CancellationRule): void {
    this.cancellationRules.push(rule);
  }

  removeCancellationRule(ruleName: string): boolean {
    const index = this.cancellationRules.findIndex(rule => rule.name === ruleName);
    if (index > -1) {
      this.cancellationRules.splice(index, 1);
      return true;
    }
    return false;
  }

  getCancellationRules(): CancellationRule[] {
    return [...this.cancellationRules];
  }
}

export const intelligentRequestCancellationService = new IntelligentRequestCancellationService();
