
import { CacheMetrics } from '@/types/cache';
import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';

export interface CacheStats {
  memory: { hits: number; misses: number; hitRate: number };
  session: { hits: number; misses: number; hitRate: number };
  response: { hits: number; misses: number; hitRate: number };
  totalMisses: number;
}

export class CacheMetricsCalculator {
  static calculateUnifiedMetrics(
    memoryCache: MemoryCacheManager,
    sessionCache: SessionCacheManager,
    cacheStats: CacheStats
  ): CacheMetrics {
    const totalHits = cacheStats.memory.hits + cacheStats.session.hits + cacheStats.response.hits;
    const totalRequests = totalHits + cacheStats.totalMisses;
    
    return {
      totalSize: memoryCache.size() + sessionCache.size(),
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (cacheStats.totalMisses / totalRequests) * 100 : 0,
      averageResponseTime: 0, // Would need to track this separately
      popularQueries: this.getPopularQueries(sessionCache),
      cacheEfficiency: this.calculateEfficiency(memoryCache, sessionCache)
    };
  }

  static calculateExtendedMetrics(
    memoryCache: MemoryCacheManager,
    sessionCache: SessionCacheManager,
    cacheStats: CacheStats,
    responseCacheStats: any,
    warmingStatus: { size: number; isWarming: boolean }
  ) {
    const baseMetrics = this.calculateUnifiedMetrics(memoryCache, sessionCache, cacheStats);
    
    return {
      ...baseMetrics,
      memoryStats: {
        size: memoryCache.size(),
        hitRate: cacheStats.memory.hitRate
      },
      sessionStats: {
        size: sessionCache.size(),
        hitRate: cacheStats.session.hitRate
      },
      responseCacheStats,
      warmingStatus
    };
  }

  static updateHitRates(cacheStats: CacheStats): void {
    Object.keys(cacheStats).forEach(key => {
      if (key !== 'totalMisses') {
        const stats = cacheStats[key as keyof CacheStats];
        if (typeof stats === 'object' && 'hits' in stats && 'misses' in stats) {
          const total = stats.hits + stats.misses;
          stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
        }
      }
    });
  }

  static createEmptyStats(): CacheStats {
    return {
      memory: { hits: 0, misses: 0, hitRate: 0 },
      session: { hits: 0, misses: 0, hitRate: 0 },
      response: { hits: 0, misses: 0, hitRate: 0 },
      totalMisses: 0
    };
  }

  private static getPopularQueries(sessionCache: SessionCacheManager): { query: string; hits: number }[] {
    const queryHits = new Map<string, number>();
    
    for (const [key, entry] of sessionCache.entries()) {
      if (entry.tags.includes('chat-response')) {
        queryHits.set(key, entry.accessCount);
      }
    }

    return Array.from(queryHits.entries())
      .map(([query, hits]) => ({ query, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);
  }

  private static calculateEfficiency(memoryCache: MemoryCacheManager, sessionCache: SessionCacheManager): number {
    const memorySize = memoryCache.size();
    const sessionSize = sessionCache.size();
    const totalSize = memorySize + sessionSize;
    
    if (totalSize === 0) return 0;
    
    // Efficiency based on memory cache utilization (faster access)
    return (memorySize / totalSize) * 100;
  }
}
