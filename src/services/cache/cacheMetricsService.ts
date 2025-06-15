
import { CacheMetrics } from '@/types/cache';
import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';

export class CacheMetricsService {
  private metrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    responseTimeSum: 0
  };

  recordHit(responseTime: number): void {
    this.metrics.hits++;
    this.metrics.totalRequests++;
    this.metrics.responseTimeSum += responseTime;
  }

  recordMiss(): void {
    this.metrics.misses++;
    this.metrics.totalRequests++;
  }

  getMetrics(memoryCache: MemoryCacheManager, sessionCache: SessionCacheManager): CacheMetrics {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0;
    
    const averageResponseTime = this.metrics.hits > 0
      ? this.metrics.responseTimeSum / this.metrics.hits
      : 0;

    const popularQueries = this.getPopularQueries(sessionCache);
    const cacheEfficiency = this.calculateCacheEfficiency(memoryCache, sessionCache);

    return {
      totalSize: memoryCache.size() + sessionCache.size(),
      hitRate,
      missRate: 100 - hitRate,
      averageResponseTime,
      popularQueries,
      cacheEfficiency
    };
  }

  reset(): void {
    this.metrics = { hits: 0, misses: 0, totalRequests: 0, responseTimeSum: 0 };
  }

  private getPopularQueries(sessionCache: SessionCacheManager): { query: string; hits: number }[] {
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

  private calculateCacheEfficiency(memoryCache: MemoryCacheManager, sessionCache: SessionCacheManager): number {
    const totalEntries = memoryCache.size() + sessionCache.size();
    if (totalEntries === 0) return 0;

    let totalAccess = 0;
    for (const [, entry] of memoryCache.entries()) {
      totalAccess += entry.accessCount;
    }
    for (const [, entry] of sessionCache.entries()) {
      totalAccess += entry.accessCount;
    }

    return totalEntries > 0 ? (totalAccess / totalEntries) : 0;
  }
}
