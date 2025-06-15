
import { unifiedCacheManager } from './cache/unifiedCacheManager';
import { CacheMetrics, CacheWarmingStrategy } from '@/types/cache';

export class AdvancedCacheService {
  // Delegate all operations to the unified cache manager
  async get<T>(key: string, tags: string[] = []): Promise<T | null> {
    return unifiedCacheManager.get<T>(key, tags);
  }

  async set<T>(
    key: string, 
    data: T, 
    ttl?: number,
    tags: string[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    return unifiedCacheManager.set(key, data, ttl, tags, priority);
  }

  async setBatch<T>(entries: Array<{
    key: string;
    data: T;
    ttl?: number;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  }>): Promise<void> {
    return unifiedCacheManager.setBatch(entries);
  }

  async warmCache(warmingStrategies: CacheWarmingStrategy[]): Promise<void> {
    return unifiedCacheManager.warmCache(warmingStrategies);
  }

  async prefetch(baseKey: string, patterns: string[]): Promise<void> {
    return unifiedCacheManager.prefetch(baseKey, patterns);
  }

  invalidateByTags(tags: string[]): void {
    unifiedCacheManager.invalidateByTags(tags);
  }

  getMetrics(): CacheMetrics {
    const unifiedMetrics = unifiedCacheManager.getMetrics();
    // Return only the base metrics for compatibility
    return {
      totalSize: unifiedMetrics.totalSize,
      hitRate: unifiedMetrics.hitRate,
      missRate: unifiedMetrics.missRate,
      averageResponseTime: unifiedMetrics.averageResponseTime,
      popularQueries: unifiedMetrics.popularQueries,
      cacheEfficiency: unifiedMetrics.cacheEfficiency
    };
  }

  getDetailedMetrics() {
    return unifiedCacheManager.getMetrics();
  }

  clearAll(): void {
    unifiedCacheManager.clearAll();
  }

  destroy(): void {
    unifiedCacheManager.destroy();
  }
}

export const advancedCacheService = new AdvancedCacheService();
