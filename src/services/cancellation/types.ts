
import { RequestFingerprint } from '../requestFingerprinting';

export interface CancellableRequest {
  id: string;
  fingerprint: RequestFingerprint;
  abortController: AbortController;
  timestamp: number;
  priority: 'low' | 'normal' | 'high';
  userId?: string;
  conversationId?: string;
}

export interface CancellationRule {
  name: string;
  shouldCancel: (existing: CancellableRequest, incoming: RequestFingerprint) => boolean;
  description: string;
}

export interface CancellationStats {
  totalCancellations: number;
  supersededRequests: number;
  duplicateRequests: number;
  timeoutCancellations: number;
  manualCancellations: number;
  activeRequestsCount: number;
  rulesCount: number;
}
