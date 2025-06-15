
import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';
import { responseCacheService } from '../responseCacheService';
import { CacheMetrics, CacheWarmingStrategy } from '@/types/cache';

export interface UnifiedCacheConfig {
  memoryMaxSize?: number;
  sessionMaxSize?: number;
  memoryTtl?: number;
  sessionTtl?: number;
  enableHierarchy?: boolean;
  enableWarming?: boolean;
}

export class UnifiedCacheManager {
  private memoryCache: MemoryCacheManager;
  private sessionCache: SessionCacheManager;
  private config: Required<UnifiedCacheConfig>;
  private warmingQueue: Map<string, CacheWarmingStrategy> = new Map();
  private isWarming = false;

  constructor(config: UnifiedCacheConfig = {}) {
    this.config = {
      memoryMaxSize: config.memoryMaxSize ?? 50,
      sessionMaxSize: config.sessionMaxSize ?? 200,
      memoryTtl: config.memoryTtl ?? 2 * 60 * 1000,
      sessionTtl: config.sessionTtl ?? 5 * 60 * 1000,
      enableHierarchy: config.enableHierarchy ?? true,
      enableWarming: config.enableWarming ?? true
    };

    this.memoryCache = new MemoryCacheManager(this.config.memoryMaxSize, this.config.memoryTtl);
    this.sessionCache = new SessionCacheManager(this.config.sessionMaxSize, this.config.sessionTtl);

    // Start periodic cleanup
    this.startPeriodicMaintenance();
  }

  // Hierarchical cache retrieval: Memory → Session → Response Cache
  async get<T>(key: string, tags: string[] = []): Promise<T | null> {
    const startTime = performance.now();

    try {
      // Level 1: Memory Cache (fastest)
      const memoryResult = this.memoryCache.get<T>(key);
      if (memoryResult !== null) {
        this.recordCacheHit('memory', performance.now() - startTime);
        return memoryResult;
      }

      // Level 2: Session Cache
      const sessionResult = this.sessionCache.get<T>(key);
      if (sessionResult !== null) {
        // Promote to memory cache if hierarchy is enabled
        if (this.config.enableHierarchy) {
          this.memoryCache.set(key, sessionResult, this.config.memoryTtl, tags, 'medium');
        }
        this.recordCacheHit('session', performance.now() - startTime);
        return sessionResult;
      }

      // Level 3: Response Cache (for chat responses)
      if (tags.includes('chat-response')) {
        const responseResult = responseCacheService.getCachedResponse(key);
        if (responseResult) {
          try {
            const parsedResult = JSON.parse(responseResult) as T;
            
            // Promote through hierarchy
            if (this.config.enableHierarchy) {
              this.sessionCache.set(key, parsedResult, this.config.sessionTtl, tags, 'low');
            }
            
            this.recordCacheHit('response', performance.now() - startTime);
            return parsedResult;
          } catch (error) {
            console.warn('Failed to parse cached response:', error);
          }
        }
      }

      this.recordCacheMiss();
      return null;
    } catch (error) {
      console.error('Unified cache retrieval error:', error);
      this.recordCacheMiss();
      return null;
    }
  }

  // Intelligent cache storage with automatic hierarchy placement
  async set<T>(
    key: string, 
    data: T, 
    ttl?: number,
    tags: string[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    const sessionTtl = ttl || this.config.sessionTtl;
    const memoryTtl = Math.min(sessionTtl, this.config.memoryTtl);

    try {
      // Always store in session cache
      this.sessionCache.set(key, data, sessionTtl, tags, priority);

      // Store in memory cache based on priority and hierarchy setting
      if (this.config.enableHierarchy && (priority === 'high' || priority === 'medium')) {
        this.memoryCache.set(key, data, memoryTtl, tags, priority);
      }

      // Store chat responses in response cache service
      if (tags.includes('chat-response') && typeof data === 'string') {
        responseCacheService.setCachedResponse(key, data);
      }

      // Schedule for warming if it's a high-priority item
      if (priority === 'high' && this.config.enableWarming) {
        this.scheduleForWarming(key, tags, priority);
      }
    } catch (error) {
      console.error('Unified cache storage error:', error);
    }
  }

  // Batch cache operations for better performance
  async setBatch<T>(entries: Array<{
    key: string;
    data: T;
    ttl?: number;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  }>): Promise<void> {
    const promises = entries.map(entry => 
      this.set(entry.key, entry.data, entry.ttl, entry.tags, entry.priority)
    );
    await Promise.allSettled(promises);
  }

  // Advanced cache warming with queue management
  async warmCache(strategies: CacheWarmingStrategy[]): Promise<void> {
    if (!this.config.enableWarming) {
      console.log('Cache warming is disabled');
      return;
    }

    // Add strategies to warming queue
    strategies.forEach(strategy => {
      this.warmingQueue.set(strategy.key, strategy);
    });

    if (!this.isWarming) {
      await this.processWarmingQueue();
    }
  }

  // Prefetch related data based on patterns
  async prefetch(baseKey: string, patterns: string[]): Promise<void> {
    const prefetchPromises = patterns.map(async (pattern) => {
      const prefetchKey = `${baseKey}:${pattern}`;
      const existing = await this.get(prefetchKey);
      
      if (!existing) {
        // Schedule for warming with lower priority
        this.scheduleForWarming(prefetchKey, ['prefetch'], 'low');
      }
    });

    await Promise.allSettled(prefetchPromises);
  }

  // Invalidation with cascade through hierarchy
  invalidateByTags(tags: string[]): number {
    const memoryInvalidated = this.memoryCache.invalidateByTags(tags);
    const sessionInvalidated = this.sessionCache.invalidateByTags(tags);
    
    // Also clear from response cache if it's a chat response
    if (tags.includes('chat-response')) {
      responseCacheService.clearCache();
    }

    const totalInvalidated = memoryInvalidated + sessionInvalidated;
    console.log(`Invalidated ${totalInvalidated} cache entries with tags:`, tags);
    
    return totalInvalidated;
  }

  // Get comprehensive metrics across all cache layers
  getMetrics(): CacheMetrics & {
    memoryStats: { size: number; hitRate: number };
    sessionStats: { size: number; hitRate: number };
    responseCacheStats: any;
  } {
    const baseMetrics = this.calculateUnifiedMetrics();
    const responseCacheStats = responseCacheService.getCacheStats();

    return {
      ...baseMetrics,
      memoryStats: {
        size: this.memoryCache.size(),
        hitRate: this.cacheStats.memory.hitRate
      },
      sessionStats: {
        size: this.sessionCache.size(),
        hitRate: this.cacheStats.session.hitRate
      },
      responseCacheStats
    };
  }

  // Clear all cache layers
  clearAll(): void {
    this.memoryCache.clear();
    this.sessionCache.clear();
    responseCacheService.clearCache();
    this.warmingQueue.clear();
    this.resetStats();
    console.log('All cache layers cleared');
  }

  // Private methods for internal management
  private cacheStats = {
    memory: { hits: 0, misses: 0, hitRate: 0 },
    session: { hits: 0, misses: 0, hitRate: 0 },
    response: { hits: 0, misses: 0, hitRate: 0 },
    totalMisses: 0
  };

  private recordCacheHit(layer: 'memory' | 'session' | 'response', responseTime: number): void {
    this.cacheStats[layer].hits++;
    this.updateHitRates();
  }

  private recordCacheMiss(): void {
    this.cacheStats.totalMisses++;
    this.updateHitRates();
  }

  private updateHitRates(): void {
    Object.keys(this.cacheStats).forEach(key => {
      if (key !== 'totalMisses') {
        const stats = this.cacheStats[key as keyof typeof this.cacheStats];
        if (typeof stats === 'object' && 'hits' in stats && 'misses' in stats) {
          const total = stats.hits + stats.misses;
          stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
        }
      }
    });
  }

  private async processWarmingQueue(): Promise<void> {
    if (this.isWarming || this.warmingQueue.size === 0) return;

    this.isWarming = true;
    console.log(`Processing ${this.warmingQueue.size} cache warming strategies...`);

    const warmingPromises = Array.from(this.warmingQueue.values()).map(async (strategy) => {
      try {
        const data = await strategy.dataLoader();
        await this.set(
          strategy.key,
          data,
          strategy.ttl,
          strategy.tags,
          strategy.priority || 'medium'
        );
        console.log(`Cache warmed: ${strategy.key}`);
      } catch (error) {
        console.error(`Failed to warm cache for ${strategy.key}:`, error);
      }
    });

    await Promise.allSettled(warmingPromises);
    this.warmingQueue.clear();
    this.isWarming = false;
    console.log('Cache warming completed');
  }

  private scheduleForWarming(key: string, tags: string[], priority: 'low' | 'medium' | 'high'): void {
    if (!this.warmingQueue.has(key)) {
      this.warmingQueue.set(key, {
        key,
        dataLoader: async () => null, // Placeholder - actual warming strategies should provide this
        tags,
        priority
      });
    }
  }

  private calculateUnifiedMetrics(): CacheMetrics {
    const totalHits = this.cacheStats.memory.hits + this.cacheStats.session.hits + this.cacheStats.response.hits;
    const totalRequests = totalHits + this.cacheStats.totalMisses;
    
    return {
      totalSize: this.memoryCache.size() + this.sessionCache.size(),
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.cacheStats.totalMisses / totalRequests) * 100 : 0,
      averageResponseTime: 0, // Would need to track this separately
      popularQueries: [],
      cacheEfficiency: this.calculateEfficiency()
    };
  }

  private calculateEfficiency(): number {
    const memorySize = this.memoryCache.size();
    const sessionSize = this.sessionCache.size();
    const totalSize = memorySize + sessionSize;
    
    if (totalSize === 0) return 0;
    
    // Efficiency based on memory cache utilization (faster access)
    return (memorySize / totalSize) * 100;
  }

  private startPeriodicMaintenance(): void {
    setInterval(() => {
      this.memoryCache.cleanupExpired();
      this.sessionCache.cleanupExpired();
    }, 60000); // Every minute
  }

  private resetStats(): void {
    this.cacheStats = {
      memory: { hits: 0, misses: 0, hitRate: 0 },
      session: { hits: 0, misses: 0, hitRate: 0 },
      response: { hits: 0, misses: 0, hitRate: 0 },
      totalMisses: 0
    };
  }

  // Cleanup method for when service is destroyed
  destroy(): void {
    this.clearAll();
    console.log('Unified cache manager destroyed');
  }
}

// Export singleton instance
export const unifiedCacheManager = new UnifiedCacheManager({
  enableHierarchy: true,
  enableWarming: true
});
