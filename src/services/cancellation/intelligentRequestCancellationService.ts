
import { RequestFingerprint, requestFingerprintingService } from '../requestFingerprinting';
import { CancellableRequest, CancellationStats } from './types';
import { CancellationRulesManager } from './cancellationRules';

export class IntelligentRequestCancellationService {
  private activeRequests = new Map<string, CancellableRequest>();
  private rulesManager: CancellationRulesManager;
  private cancellationStats = {
    totalCancellations: 0,
    supersededRequests: 0,
    duplicateRequests: 0,
    timeoutCancellations: 0,
    manualCancellations: 0
  };

  constructor() {
    this.rulesManager = new CancellationRulesManager();
    this.startCleanupInterval();
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
    const requestsToCancel: { id: string; rule: string }[] = [];

    for (const [requestId, request] of this.activeRequests.entries()) {
      const rule = this.rulesManager.evaluateRules(request, incomingFingerprint);
      if (rule) {
        requestsToCancel.push({ id: requestId, rule: rule.name });
        console.log(`Request ${requestId} marked for cancellation by rule: ${rule.name}`);
        
        // Update stats based on rule
        if (rule.name === 'supersession') {
          this.cancellationStats.supersededRequests++;
        } else if (rule.name === 'exact_duplicate') {
          this.cancellationStats.duplicateRequests++;
        }
      }
    }

    // Cancel the marked requests
    for (const { id, rule } of requestsToCancel) {
      this.cancelRequest(id, `intelligent_cancellation_${rule}`);
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

  getCancellationStats(): CancellationStats {
    return {
      ...this.cancellationStats,
      activeRequestsCount: this.activeRequests.size,
      rulesCount: this.rulesManager.getRulesCount()
    };
  }

  // Delegate rule management to the rules manager
  addCancellationRule(rule: import('./types').CancellationRule): void {
    this.rulesManager.addRule(rule);
  }

  removeCancellationRule(ruleName: string): boolean {
    return this.rulesManager.removeRule(ruleName);
  }

  getCancellationRules(): import('./types').CancellationRule[] {
    return this.rulesManager.getRules();
  }
}

export const intelligentRequestCancellationService = new IntelligentRequestCancellationService();
