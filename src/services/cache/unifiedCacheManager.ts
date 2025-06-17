import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';
import { responseCacheService } from '../responseCacheService';
import { advancedCacheWarmingService } from './advancedCacheWarmingService';
import { CacheMetrics, CacheWarmingStrategy } from '@/types/cache';
import { CacheMetricsCalculator, CacheStats } from './cacheMetricsCalculator';

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
  private cacheStats: CacheStats;

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
    this.cacheStats = CacheMetricsCalculator.createEmptyStats();

    // Start periodic cleanup
    this.startPeriodicMaintenance();

    // Initialize warming service if enabled
    if (this.config.enableWarming) {
      advancedCacheWarmingService.startPeriodicWarming();
    }
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
        advancedCacheWarmingService.scheduleForWarming(key, tags, priority);
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

  // Delegate warming operations to the warming service
  async warmCache(strategies: CacheWarmingStrategy[]): Promise<void> {
    if (!this.config.enableWarming) {
      console.log('Cache warming is disabled');
      return;
    }

    return advancedCacheWarmingService.warmCache(strategies);
  }

  // Prefetch related data based on patterns
  async prefetch(baseKey: string, patterns: string[]): Promise<void> {
    return advancedCacheWarmingService.prefetchRelatedContent(baseKey, patterns);
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

  // Get comprehensive metrics across all cache layers using the metrics calculator
  getMetrics(): CacheMetrics & {
    memoryStats: { size: number; hitRate: number };
    sessionStats: { size: number; hitRate: number };
    responseCacheStats: any;
    warmingStatus: { size: number; isWarming: boolean };
  } {
    const responseCacheStats = responseCacheService.getCacheStats();
    const warmingStatus = advancedCacheWarmingService.getQueueStatus();

    return CacheMetricsCalculator.calculateExtendedMetrics(
      this.memoryCache,
      this.sessionCache,
      this.cacheStats,
      responseCacheStats,
      warmingStatus
    );
  }

  // Clear all cache layers
  clearAll(): void {
    this.memoryCache.clear();
    this.sessionCache.clear();
    responseCacheService.clearCache();
    advancedCacheWarmingService.clearWarmingQueue();
    this.resetStats();
    console.log('All cache layers cleared');
  }

  // Private methods for internal management
  private recordCacheHit(layer: 'memory' | 'session' | 'response', responseTime: number): void {
    this.cacheStats[layer].hits++;
    CacheMetricsCalculator.updateHitRates(this.cacheStats);
  }

  private recordCacheMiss(): void {
    this.cacheStats.totalMisses++;
    CacheMetricsCalculator.updateHitRates(this.cacheStats);
  }

  private startPeriodicMaintenance(): void {
    setInterval(() => {
      this.memoryCache.cleanupExpired();
      this.sessionCache.cleanupExpired();
    }, 60000); // Every minute
  }

  private resetStats(): void {
    this.cacheStats = CacheMetricsCalculator.createEmptyStats();
  }

  // Cleanup method for when service is destroyed
  destroy(): void {
    this.clearAll();
    advancedCacheWarmingService.destroy();
    console.log('Unified cache manager destroyed');
  }
}

// Export singleton instance
export const unifiedCacheManager = new UnifiedCacheManager({
  enableHierarchy: true,
  enableWarming: true
});
