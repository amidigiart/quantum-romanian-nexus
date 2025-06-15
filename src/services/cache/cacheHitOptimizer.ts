
import { unifiedCacheManager } from './unifiedCacheManager';
import { generateOptimizedCacheKey, generateVariationKeys, calculateCacheScore } from '@/hooks/chat/utils/optimizedCacheUtils';

export class CacheHitOptimizer {
  private hitPatterns: Map<string, { hits: number; lastHit: number }> = new Map();
  private missedQueries: Map<string, number> = new Map();

  async optimizedGet<T>(
    originalKey: string,
    message: string,
    context: any,
    userId?: string,
    tags: string[] = []
  ): Promise<T | null> {
    // Try optimized key first
    const optimizedKey = generateOptimizedCacheKey(message, context, userId);
    let result = await unifiedCacheManager.get<T>(optimizedKey, tags);
    
    if (result) {
      this.recordHit(optimizedKey);
      return result;
    }
    
    // Try variation keys for partial matches
    const variations = generateVariationKeys(optimizedKey);
    for (const variationKey of variations) {
      result = await unifiedCacheManager.get<T>(variationKey, tags);
      if (result) {
        // Promote successful variation to main cache
        await unifiedCacheManager.set(optimizedKey, result, undefined, tags, 'medium');
        this.recordHit(variationKey);
        return result;
      }
    }
    
    // Try original key as fallback
    result = await unifiedCacheManager.get<T>(originalKey, tags);
    if (result) {
      // Promote to optimized key
      await unifiedCacheManager.set(optimizedKey, result, undefined, tags, 'low');
      this.recordHit(originalKey);
      return result;
    }
    
    // Record miss for analysis
    this.recordMiss(optimizedKey, message);
    return null;
  }

  async optimizedSet<T>(
    originalKey: string,
    data: T,
    message: string,
    context: any,
    userId?: string,
    ttl?: number,
    tags: string[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    const optimizedKey = generateOptimizedCacheKey(message, context, userId);
    
    // Calculate dynamic TTL based on content value
    const dynamicTtl = this.calculateOptimalTtl(message, priority, ttl);
    
    // Store with optimized key
    await unifiedCacheManager.set(optimizedKey, data, dynamicTtl, tags, priority);
    
    // Also store with original key for compatibility
    if (originalKey !== optimizedKey) {
      await unifiedCacheManager.set(originalKey, data, dynamicTtl, tags, 'low');
    }
  }

  private calculateOptimalTtl(message: string, priority: string, defaultTtl?: number): number {
    const baseTtl = defaultTtl || 10 * 60 * 1000; // 10 minutes default
    
    // High-value content gets longer TTL
    if (message.includes('quantum algorithm') || message.includes('quantum principle')) {
      return baseTtl * 3; // 30 minutes
    }
    
    // News content gets shorter TTL
    if (message.includes('news') || message.includes('latest')) {
      return baseTtl * 0.5; // 5 minutes
    }
    
    // Priority-based adjustment
    const priorityMultiplier = { high: 2, medium: 1, low: 0.5 };
    return baseTtl * (priorityMultiplier[priority as keyof typeof priorityMultiplier] || 1);
  }

  private recordHit(key: string): void {
    const pattern = this.hitPatterns.get(key) || { hits: 0, lastHit: 0 };
    pattern.hits++;
    pattern.lastHit = Date.now();
    this.hitPatterns.set(key, pattern);
  }

  private recordMiss(key: string, message: string): void {
    // Track missed queries for future optimization
    const normalizedMessage = message.toLowerCase().substring(0, 50);
    this.missedQueries.set(normalizedMessage, (this.missedQueries.get(normalizedMessage) || 0) + 1);
  }

  async performMaintenanceOptimization(): Promise<void> {
    console.log('Starting cache hit optimization maintenance...');
    
    // Analyze miss patterns and pre-warm likely queries
    const topMissedQueries = Array.from(this.missedQueries.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    
    for (const [query, missCount] of topMissedQueries) {
      if (missCount >= 3) {
        console.log(`High-miss query detected: ${query} (${missCount} misses)`);
        // Could trigger proactive cache warming here
      }
    }
    
    // Clean up old hit patterns
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [key, pattern] of this.hitPatterns.entries()) {
      if (pattern.lastHit < oneHourAgo && pattern.hits < 2) {
        this.hitPatterns.delete(key);
      }
    }
  }

  getOptimizationMetrics() {
    const totalHits = Array.from(this.hitPatterns.values()).reduce((sum, p) => sum + p.hits, 0);
    const totalMisses = Array.from(this.missedQueries.values()).reduce((sum, count) => sum + count, 0);
    const hitRate = totalHits + totalMisses > 0 ? (totalHits / (totalHits + totalMisses)) * 100 : 0;
    
    return {
      hitRate,
      totalHits,
      totalMisses,
      uniqueHitPatterns: this.hitPatterns.size,
      topMissedQueries: Array.from(this.missedQueries.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    };
  }
}

export const cacheHitOptimizer = new CacheHitOptimizer();
