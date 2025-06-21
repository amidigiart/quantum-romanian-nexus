
import { ConceptExtractor } from './conceptExtractor';

export class HashGenerator {
  private semanticCache = new Map<string, string>();

  generateContentHash(normalizedMessage: string): string {
    // Simple hash for exact content matching
    let hash = 0;
    for (let i = 0; i < normalizedMessage.length; i++) {
      const char = normalizedMessage.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  generateSemanticHash(normalizedMessage: string): string {
    // Check cache first
    if (this.semanticCache.has(normalizedMessage)) {
      return this.semanticCache.get(normalizedMessage)!;
    }

    // Extract key concepts and generate semantic signature
    const concepts = ConceptExtractor.extractConcepts(normalizedMessage);
    const semanticSignature = concepts.sort().join('|');
    const semanticHash = this.generateContentHash(semanticSignature);
    
    // Cache the result
    this.semanticCache.set(normalizedMessage, semanticHash);
    
    return semanticHash;
  }

  generateContextHash(context?: any): string {
    if (!context) return 'no-context';

    const contextString = JSON.stringify({
      expertise: context.userExpertiseLevel || 'unknown',
      style: context.preferredResponseStyle || 'default',
      domain: context.domain || 'general',
      previousTopics: context.recentTopics?.slice(0, 3) || []
    });

    return this.generateContentHash(contextString);
  }

  generateUserHash(userId?: string, context?: any, includeUserContext: boolean = true): string {
    if (!includeUserContext || !userId) {
      return 'anonymous';
    }

    const userContext = {
      id: userId,
      session: context?.sessionId || 'unknown'
    };

    return this.generateContentHash(JSON.stringify(userContext));
  }

  clearCache(): void {
    this.semanticCache.clear();
  }

  getCacheSize(): number {
    return this.semanticCache.size;
  }
}
