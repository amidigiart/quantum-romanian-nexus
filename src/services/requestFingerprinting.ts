
interface RequestFingerprint {
  contentHash: string;
  semanticHash: string;
  contextHash: string;
  userHash: string;
  timestamp: number;
}

interface FingerprintingConfig {
  includeUserContext: boolean;
  includeTiming: boolean;
  semanticSimilarityThreshold: number;
  contextWeight: number;
}

const DEFAULT_CONFIG: FingerprintingConfig = {
  includeUserContext: true,
  includeTiming: false,
  semanticSimilarityThreshold: 0.85,
  contextWeight: 0.3
};

export class RequestFingerprintingService {
  private config: FingerprintingConfig;
  private semanticCache = new Map<string, string>();

  constructor(config: Partial<FingerprintingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  generateFingerprint(
    message: string,
    context?: any,
    userId?: string
  ): RequestFingerprint {
    const normalizedMessage = this.normalizeMessage(message);
    const contentHash = this.generateContentHash(normalizedMessage);
    const semanticHash = this.generateSemanticHash(normalizedMessage);
    const contextHash = this.generateContextHash(context);
    const userHash = this.generateUserHash(userId, context);

    return {
      contentHash,
      semanticHash,
      contextHash,
      userHash,
      timestamp: Date.now()
    };
  }

  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\b(please|could you|can you|would you)\b/g, '') // Remove politeness words
      .replace(/\b(what|how|why|when|where|who)\b/g, 'QUESTION') // Normalize question words
      .trim();
  }

  private generateContentHash(normalizedMessage: string): string {
    // Simple hash for exact content matching
    let hash = 0;
    for (let i = 0; i < normalizedMessage.length; i++) {
      const char = normalizedMessage.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private generateSemanticHash(normalizedMessage: string): string {
    // Check cache first
    if (this.semanticCache.has(normalizedMessage)) {
      return this.semanticCache.get(normalizedMessage)!;
    }

    // Extract key concepts and generate semantic signature
    const concepts = this.extractConcepts(normalizedMessage);
    const semanticSignature = concepts.sort().join('|');
    const semanticHash = this.generateContentHash(semanticSignature);
    
    // Cache the result
    this.semanticCache.set(normalizedMessage, semanticHash);
    
    return semanticHash;
  }

  private extractConcepts(message: string): string[] {
    const concepts = new Set<string>();
    
    // Quantum computing domain concepts
    const quantumConcepts = [
      'quantum', 'qubit', 'superposition', 'entanglement', 'algorithm',
      'circuit', 'gate', 'measurement', 'decoherence', 'interference',
      'cryptography', 'security', 'machine learning', 'optimization',
      'hardware', 'software', 'theory', 'application', 'research'
    ];

    // General technical concepts
    const technicalConcepts = [
      'explain', 'how', 'what', 'why', 'implement', 'build', 'create',
      'analyze', 'compare', 'optimize', 'solve', 'calculate', 'simulate'
    ];

    const words = message.split(/\s+/);
    
    for (const word of words) {
      if (quantumConcepts.includes(word)) {
        concepts.add(`quantum:${word}`);
      } else if (technicalConcepts.includes(word)) {
        concepts.add(`action:${word}`);
      } else if (word.length > 4) {
        concepts.add(`concept:${word}`);
      }
    }

    return Array.from(concepts);
  }

  private generateContextHash(context?: any): string {
    if (!context) return 'no-context';

    const contextString = JSON.stringify({
      expertise: context.userExpertiseLevel || 'unknown',
      style: context.preferredResponseStyle || 'default',
      domain: context.domain || 'general',
      previousTopics: context.recentTopics?.slice(0, 3) || []
    });

    return this.generateContentHash(contextString);
  }

  private generateUserHash(userId?: string, context?: any): string {
    if (!this.config.includeUserContext || !userId) {
      return 'anonymous';
    }

    const userContext = {
      id: userId,
      session: context?.sessionId || 'unknown'
    };

    return this.generateContentHash(JSON.stringify(userContext));
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

  // Update configuration
  updateConfig(newConfig: Partial<FingerprintingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current configuration
  getConfig(): FingerprintingConfig {
    return { ...this.config };
  }

  // Clear semantic cache
  clearCache(): void {
    this.semanticCache.clear();
  }

  // Get cache statistics
  getCacheStats() {
    return {
      cacheSize: this.semanticCache.size,
      config: this.config
    };
  }
}

export const requestFingerprintingService = new RequestFingerprintingService();
