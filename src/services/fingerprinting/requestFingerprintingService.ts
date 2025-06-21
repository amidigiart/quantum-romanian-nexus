
import { RequestFingerprint, FingerprintingConfig, DEFAULT_CONFIG } from './types';
import { ConceptExtractor } from './conceptExtractor';
import { HashGenerator } from './hashGenerator';
import { SimilarityAnalyzer } from './similarityAnalyzer';

export class RequestFingerprintingService {
  private config: FingerprintingConfig;
  private hashGenerator: HashGenerator;
  private similarityAnalyzer: SimilarityAnalyzer;

  constructor(config: Partial<FingerprintingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.hashGenerator = new HashGenerator();
    this.similarityAnalyzer = new SimilarityAnalyzer(this.config);
  }

  generateFingerprint(
    message: string,
    context?: any,
    userId?: string
  ): RequestFingerprint {
    const normalizedMessage = ConceptExtractor.normalizeMessage(message);
    const contentHash = this.hashGenerator.generateContentHash(normalizedMessage);
    const semanticHash = this.hashGenerator.generateSemanticHash(normalizedMessage);
    const contextHash = this.hashGenerator.generateContextHash(context);
    const userHash = this.hashGenerator.generateUserHash(userId, context, this.config.includeUserContext);

    return {
      contentHash,
      semanticHash,
      contextHash,
      userHash,
      timestamp: Date.now()
    };
  }

  // Calculate similarity between two fingerprints
  calculateSimilarity(fp1: RequestFingerprint, fp2: RequestFingerprint): number {
    return this.similarityAnalyzer.calculateSimilarity(fp1, fp2);
  }

  // Check if two fingerprints represent similar requests
  areSimilar(fp1: RequestFingerprint, fp2: RequestFingerprint): boolean {
    return this.similarityAnalyzer.areSimilar(fp1, fp2);
  }

  // Determine if a newer request should supersede an older one
  shouldSupersede(olderFp: RequestFingerprint, newerFp: RequestFingerprint): boolean {
    return this.similarityAnalyzer.shouldSupersede(olderFp, newerFp);
  }

  // Check if a request is a follow-up or clarification
  isFollowUp(previousFp: RequestFingerprint, currentFp: RequestFingerprint): boolean {
    return this.similarityAnalyzer.isFollowUp(previousFp, currentFp);
  }

  // Update configuration
  updateConfig(newConfig: Partial<FingerprintingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.similarityAnalyzer.updateConfig(this.config);
  }

  // Get current configuration
  getConfig(): FingerprintingConfig {
    return { ...this.config };
  }

  // Clear semantic cache
  clearCache(): void {
    this.hashGenerator.clearCache();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cacheSize: this.hashGenerator.getCacheSize(),
      config: this.config
    };
  }
}

export const requestFingerprintingService = new RequestFingerprintingService();
