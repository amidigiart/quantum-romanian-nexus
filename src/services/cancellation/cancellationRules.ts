
import { CancellationRule } from './types';
import { requestFingerprintingService } from '../requestFingerprinting';

export class CancellationRulesManager {
  private rules: CancellationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Rule 1: Cancel if newer request supersedes older one
    this.rules.push({
      name: 'supersession',
      shouldCancel: (existing, incoming) => {
        return requestFingerprintingService.shouldSupersede(existing.fingerprint, incoming);
      },
      description: 'Cancel requests superseded by newer, similar requests'
    });

    // Rule 2: Cancel exact duplicates (except for the most recent)
    this.rules.push({
      name: 'exact_duplicate',
      shouldCancel: (existing, incoming) => {
        return existing.fingerprint.contentHash === incoming.contentHash &&
               existing.fingerprint.userHash === incoming.userHash;
      },
      description: 'Cancel exact duplicate requests'
    });

    // Rule 3: Cancel older similar requests from same user
    this.rules.push({
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
    this.rules.push({
      name: 'priority_override',
      shouldCancel: (existing, incoming) => {
        return existing.priority === 'low' && 
               existing.fingerprint.userHash === incoming.userHash;
      },
      description: 'Cancel low priority requests when new requests come from the same user'
    });
  }

  getRules(): CancellationRule[] {
    return [...this.rules];
  }

  addRule(rule: CancellationRule): void {
    this.rules.push(rule);
  }

  removeRule(ruleName: string): boolean {
    const index = this.rules.findIndex(rule => rule.name === ruleName);
    if (index > -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  evaluateRules(existing: import('./types').CancellableRequest, incoming: import('../requestFingerprinting').RequestFingerprint): CancellationRule | null {
    for (const rule of this.rules) {
      if (rule.shouldCancel(existing, incoming)) {
        return rule;
      }
    }
    return null;
  }

  getRulesCount(): number {
    return this.rules.length;
  }
}
