
import { RequestFingerprint } from '../requestFingerprinting';

export interface EnhancedPendingRequest {
  promise: Promise<any>;
  timestamp: number;
  requestKey: string;
  fingerprint: RequestFingerprint;
  hits: number;
  lastAccessed: number;
}

export interface DeduplicationStats {
  totalRequests: number;
  duplicatedRequests: number;
  uniqueRequests: number;
  cacheHitRate: number;
  averageResponseTime: number;
  semanticMatches: number;
  exactMatches: number;
}

export interface DeduplicationConfig {
  REQUEST_TIMEOUT: number;
  MAX_PENDING_REQUESTS: number;
}

export const DEFAULT_DEDUPLICATION_CONFIG: DeduplicationConfig = {
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_PENDING_REQUESTS: 1000
};
