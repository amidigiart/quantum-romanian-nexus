
import { RequestFingerprint, FingerprintingConfig } from './types';

export class SimilarityAnalyzer {
  private config: FingerprintingConfig;

  constructor(config: FingerprintingConfig) {
    this.config = config;
  }

  updateConfig(newConfig: Partial<FingerprintingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Calculate similarity between two fingerprints
  calculateSimilarity(fp1: RequestFingerprint, fp2: RequestFingerprint): number {
    let similarity = 0;
    let weightSum = 0;

    // Exact content match (highest weight)
    if (fp1.contentHash === fp2.contentHash) {
      similarity += 1.0 * 0.4;
    }
    weightSum += 0.4;

    // Semantic similarity (high weight)
    if (fp1.semanticHash === fp2.semanticHash) {
      similarity += 1.0 * 0.3;
    }
    weightSum += 0.3;

    // Context similarity (medium weight)
    if (fp1.contextHash === fp2.contextHash) {
      similarity += 1.0 * this.config.contextWeight;
    }
    weightSum += this.config.contextWeight;

    // User similarity (low weight)
    if (fp1.userHash === fp2.userHash) {
      similarity += 1.0 * 0.1;
    }
    weightSum += 0.1;

    return weightSum > 0 ? similarity / weightSum : 0;
  }

  // Check if two fingerprints represent similar requests
  areSimilar(fp1: RequestFingerprint, fp2: RequestFingerprint): boolean {
    const similarity = this.calculateSimilarity(fp1, fp2);
    return similarity >= this.config.semanticSimilarityThreshold;
  }

  // Determine if a newer request should supersede an older one
  shouldSupersede(olderFp: RequestFingerprint, newerFp: RequestFingerprint): boolean {
    // If requests are from the same user and have semantic similarity
    if (olderFp.userHash === newerFp.userHash) {
      // Check if it's a refinement (similar semantic but different content)
      const semanticSimilarity = olderFp.semanticHash === newerFp.semanticHash;
      const contentDifferent = olderFp.contentHash !== newerFp.contentHash;
      const contextSimilar = olderFp.contextHash === newerFp.contextHash;
      
      // Supersede if it's a refinement of the same question
      if (semanticSimilarity && contentDifferent && contextSimilar) {
        return true;
      }
      
      // Supersede if the new request is much more recent (within conversation flow)
      const timeDiff = newerFp.timestamp - olderFp.timestamp;
      if (timeDiff < 30000 && this.areSimilar(olderFp, newerFp)) { // 30 seconds
        return true;
      }
    }
    
    return false;
  }

  // Check if a request is a follow-up or clarification
  isFollowUp(previousFp: RequestFingerprint, currentFp: RequestFingerprint): boolean {
    if (previousFp.userHash !== currentFp.userHash) return false;
    
    const timeDiff = currentFp.timestamp - previousFp.timestamp;
    const isQuickFollowup = timeDiff < 10000; // 10 seconds
    const hasContextSimilarity = previousFp.contextHash === currentFp.contextHash;
    
    return isQuickFollowup && hasContextSimilarity;
  }
}
