
import { RequestFingerprint } from '../requestFingerprinting';
import { EnhancedPendingRequest } from './types';

export class FingerprintManager {
  private fingerprintIndex = new Map<string, string[]>(); // fingerprint -> request keys

  addToIndex(fingerprint: RequestFingerprint, requestKey: string): void {
    const fingerprintKey = `${fingerprint.contentHash}:${fingerprint.semanticHash}:${fingerprint.contextHash}`;
    
    if (!this.fingerprintIndex.has(fingerprintKey)) {
      this.fingerprintIndex.set(fingerprintKey, []);
    }
    
    this.fingerprintIndex.get(fingerprintKey)!.push(requestKey);
  }

  removeFromIndex(fingerprint: RequestFingerprint, requestKey: string): void {
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

  findSimilarRequest(
    fingerprint: RequestFingerprint, 
    pendingRequests: Map<string, EnhancedPendingRequest>,
    fingerprintingService: any,
    statsCallback: (type: 'exact' | 'semantic') => void
  ): string | null {
    // First, look for exact fingerprint matches
    const fingerprintKey = `${fingerprint.contentHash}:${fingerprint.semanticHash}:${fingerprint.contextHash}`;
    const exactMatches = this.fingerprintIndex.get(fingerprintKey);
    
    if (exactMatches && exactMatches.length > 0) {
      const activeMatch = exactMatches.find(key => pendingRequests.has(key));
      if (activeMatch) {
        statsCallback('exact');
        return activeMatch;
      }
    }

    // Then, look for semantic similarity
    for (const [, requestKeys] of this.fingerprintIndex) {
      for (const requestKey of requestKeys) {
        const request = pendingRequests.get(requestKey);
        if (request && fingerprintingService.areSimilar(fingerprint, request.fingerprint)) {
          statsCallback('semantic');
          return requestKey;
        }
      }
    }

    return null;
  }

  clear(): void {
    this.fingerprintIndex.clear();
  }

  getIndexSize(): number {
    return this.fingerprintIndex.size;
  }
}
