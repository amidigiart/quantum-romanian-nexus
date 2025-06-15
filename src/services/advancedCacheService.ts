
import { responseCacheService } from './responseCacheService';
import { CacheMetrics, CacheWarmingStrategy } from '@/types/cache';
import { MemoryCacheManager } from './cache/memoryCacheManager';
import { SessionCacheManager } from './cache/sessionCacheManager';
import { CacheMetricsService } from './cache/cacheMetricsService';
import { CacheCleanupService } from './cache/cacheCleanupService';

export class AdvancedCacheService {
  private memoryCache: MemoryCacheManager;
  private sessionCache: SessionCacheManager;
  private metricsService: CacheMetricsService;
  private cleanupService: CacheCleanupService;
  
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MEMORY_TTL = 2 * 60 * 1000; // 2 minutes for memory cache

  constructor() {
    this.memoryCache = new MemoryCacheManager(50, this.MEMORY_TTL);
    this.sessionCache = new SessionCacheManager(200, this.DEFAULT_TTL);
    this.metricsService = new CacheMetricsService();
    this.cleanupService = new CacheCleanupService();
    
    this.cleanupService.startPeriodicCleanup(this.memoryCache, this.sessionCache);
  }

  // Multi-level cache retrieval (Memory -> Session -> Response Cache)
  async get<T>(key: string, tags: string[] = []): Promise<T | null> {
    const startTime = performance.now();

    try {
      // Level 1: Memory Cache (fastest)
      const memoryResult = this.memoryCache.get<T>(key);
      if (memoryResult !== null) {
        this.metricsService.recordHit(performance.now() - startTime);
        return memoryResult;
      }

      // Level 2: Session Cache
      const sessionResult = this.sessionCache.get<T>(key);
      if (sessionResult !== null) {
        // Promote to memory cache
        this.memoryCache.set(key, sessionResult, this.MEMORY_TTL, tags, 'medium');
        this.metricsService.recordHit(performance.now() - startTime);
        return sessionResult;
      }

      // Level 3: Response Cache Service (for chat responses)
      if (tags.includes('chat-response')) {
        const responseResult = responseCacheService.getCachedResponse(key);
        if (responseResult) {
          const parsedResult = JSON.parse(responseResult) as T;
          this.sessionCache.set(key, parsedResult, this.DEFAULT_TTL, tags, 'low');
          this.metricsService.recordHit(performance.now() - startTime);
          return parsedResult;
        }
      }

      this.metricsService.recordMiss();
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      this.metricsService.recordMiss();
      return null;
    }
  }

  // Set data in appropriate cache levels based on priority
  async set<T>(
    key: string, 
    data: T, 
    ttl: number = this.DEFAULT_TTL,
    tags: string[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    try {
      // Always store in session cache
      this.sessionCache.set(key, data, ttl, tags, priority);

      // Store in memory cache for high/medium priority items
      if (priority === 'high' || priority === 'medium') {
        this.memoryCache.set(key, data, Math.min(ttl, this.MEMORY_TTL), tags, priority);
      }

      // Store chat responses in response cache service
      if (tags.includes('chat-response') && typeof data === 'string') {
        responseCacheService.setCachedResponse(key, data);
      }
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  // Cache warming - preload frequently accessed data
  async warmCache(warmingStrategies: CacheWarmingStrategy[]): Promise<void> {
    console.log('Starting cache warming...');
    
    const warmingPromises = warmingStrategies.map(async (strategy) => {
      try {
        const data = await strategy.dataLoader();
        await this.set(
          strategy.key,
          data,
          strategy.ttl || this.DEFAULT_TTL,
          strategy.tags || [],
          strategy.priority || 'medium'
        );
        console.log(`Warmed cache for: ${strategy.key}`);
      } catch (error) {
        console.error(`Failed to warm cache for ${strategy.key}:`, error);
      }
    });

    await Promise.allSettled(warmingPromises);
    console.log('Cache warming completed');
  }

  // Invalidate cache by tags
  invalidateByTags(tags: string[]): void {
    this.cleanupService.invalidateByTags(tags, this.memoryCache, this.sessionCache);
  }

  // Get cache metrics and analytics
  getMetrics(): CacheMetrics {
    return this.metricsService.getMetrics(this.memoryCache, this.sessionCache);
  }

  // Clear all caches
  clearAll(): void {
    this.memoryCache.clear();
    this.sessionCache.clear();
    responseCacheService.clearCache();
    this.metricsService.reset();
    console.log('All caches cleared');
  }

  // Cleanup method for when service is destroyed
  destroy(): void {
    this.cleanupService.stopPeriodicCleanup();
  }
}

export const advancedCacheService = new AdvancedCacheService();
