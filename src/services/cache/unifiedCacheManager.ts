
import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';
import { responseCacheService } from '../responseCacheService';
import { advancedCacheWarmingService } from './advancedCacheWarmingService';
import { CacheMetrics, CacheWarmingStrategy } from '@/types/cache';
import { CacheMetricsCalculator, CacheStats } from './cacheMetricsCalculator';
import { UnifiedCacheConfig, DEFAULT_CACHE_CONFIG } from './unifiedCacheConfig';
import { CacheHierarchyService } from './cacheHierarchyService';
import { CacheInvalidationService } from './cacheInvalidationService';
import { CacheMaintenanceService } from './cacheMaintenanceService';

export type { UnifiedCacheConfig } from './unifiedCacheConfig';

export class UnifiedCacheManager {
  private memoryCache: MemoryCacheManager;
  private sessionCache: SessionCacheManager;
  private config: Required<UnifiedCacheConfig>;
  private cacheStats: CacheStats;
  private hierarchyService: CacheHierarchyService;
  private invalidationService: CacheInvalidationService;
  private maintenanceService: CacheMaintenanceService;

  constructor(config: UnifiedCacheConfig = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };

    this.memoryCache = new MemoryCacheManager(this.config.memoryMaxSize, this.config.memoryTtl);
    this.sessionCache = new SessionCacheManager(this.config.sessionMaxSize, this.config.sessionTtl);
    this.cacheStats = CacheMetricsCalculator.createEmptyStats();

    // Initialize services
    this.hierarchyService = new CacheHierarchyService(
      this.memoryCache,
      this.sessionCache,
      {
        enableHierarchy: this.config.enableHierarchy,
        memoryTtl: this.config.memoryTtl,
        sessionTtl: this.config.sessionTtl
      },
      this.cacheStats
    );

    this.invalidationService = new CacheInvalidationService(
      this.memoryCache,
      this.sessionCache
    );

    this.maintenanceService = new CacheMaintenanceService(
      this.memoryCache,
      this.sessionCache
    );

    // Start services
    this.maintenanceService.startPeriodicMaintenance();

    // Initialize warming service if enabled
    if (this.config.enableWarming) {
      advancedCacheWarmingService.startPeriodicWarming();
    }
  }

  // Hierarchical cache retrieval: Memory → Session → Response Cache
  async get<T>(key: string, tags: string[] = []): Promise<T | null> {
    return this.hierarchyService.get<T>(key, tags);
  }

  // Intelligent cache storage with automatic hierarchy placement
  async set<T>(
    key: string, 
    data: T, 
    ttl?: number,
    tags: string[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    await this.hierarchyService.set(key, data, ttl, tags, priority);

    // Schedule for warming if it's a high-priority item
    if (priority === 'high' && this.config.enableWarming) {
      advancedCacheWarmingService.scheduleForWarming(key, tags, priority);
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
    return this.invalidationService.invalidateByTags(tags);
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

    // Update hit rates before calculating metrics
    CacheMetricsCalculator.updateHitRates(this.cacheStats);

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
    this.invalidationService.clearAll();
    advancedCacheWarmingService.clearWarmingQueue();
    this.resetStats();
  }

  // Private methods for internal management
  private resetStats(): void {
    this.cacheStats = CacheMetricsCalculator.createEmptyStats();
  }

  // Cleanup method for when service is destroyed
  destroy(): void {
    this.clearAll();
    this.maintenanceService.stopPeriodicMaintenance();
    advancedCacheWarmingService.destroy();
    console.log('Unified cache manager destroyed');
  }
}

// Export singleton instance
export const unifiedCacheManager = new UnifiedCacheManager({
  enableHierarchy: true,
  enableWarming: true
});
