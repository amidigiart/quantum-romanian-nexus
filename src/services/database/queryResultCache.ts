
import { enhancedCacheManager } from '../cache/enhancedCacheManager';

export interface QueryCacheConfig {
  defaultTtl: number;
  maxCacheSize: number;
  enableCompression: boolean;
  enableQueryFingerprinting: boolean;
}

export interface QueryCacheMetrics {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  averageQueryTime: number;
  totalCacheSize: number;
}

export class QueryResultCache {
  private config: QueryCacheConfig;
  private metrics: QueryCacheMetrics;
  private queryTimes: Map<string, number[]> = new Map();

  constructor(config: Partial<QueryCacheConfig> = {}) {
    this.config = {
      defaultTtl: 300000, // 5 minutes
      maxCacheSize: 1000,
      enableCompression: true,
      enableQueryFingerprinting: true,
      ...config
    };

    this.metrics = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      averageQueryTime: 0,
      totalCacheSize: 0
    };
  }

  async getCachedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: {
      ttl?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
      skipCache?: boolean;
    } = {}
  ): Promise<T> {
    const startTime = performance.now();
    this.metrics.totalQueries++;

    const {
      ttl = this.config.defaultTtl,
      tags = [],
      priority = 'medium',
      skipCache = false
    } = options;

    // Generate cache key with fingerprinting if enabled
    const cacheKey = this.config.enableQueryFingerprinting 
      ? this.generateQueryFingerprint(queryKey)
      : queryKey;

    // Try to get from cache first (unless skip cache is true)
    if (!skipCache) {
      try {
        const cachedResult = await enhancedCacheManager.get<T>(cacheKey, tags);
        
        if (cachedResult !== null) {
          this.metrics.cacheHits++;
          this.recordQueryTime(queryKey, performance.now() - startTime);
          this.updateHitRate();
          
          console.log(`Query cache hit for key: ${queryKey}`);
          return cachedResult;
        }
      } catch (error) {
        console.error('Error retrieving from query cache:', error);
      }
    }

    // Cache miss - execute query
    this.metrics.cacheMisses++;
    
    try {
      const result = await queryFn();
      const queryTime = performance.now() - startTime;
      
      this.recordQueryTime(queryKey, queryTime);
      
      // Cache the result
      if (!skipCache && result !== null && result !== undefined) {
        try {
          await enhancedCacheManager.set(cacheKey, result, ttl, tags, priority);
          this.metrics.totalCacheSize++;
          
          console.log(`Query result cached for key: ${queryKey}, time: ${queryTime.toFixed(2)}ms`);
        } catch (error) {
          console.error('Error caching query result:', error);
        }
      }
      
      this.updateHitRate();
      return result;
    } catch (error) {
      const queryTime = performance.now() - startTime;
      this.recordQueryTime(queryKey, queryTime);
      throw error;
    }
  }

  private generateQueryFingerprint(queryKey: string): string {
    // Simple fingerprinting - in production, use a proper hash function
    const normalized = queryKey.toLowerCase().trim().replace(/\s+/g, ' ');
    return `query_${btoa(normalized).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`;
  }

  private recordQueryTime(queryKey: string, time: number): void {
    if (!this.queryTimes.has(queryKey)) {
      this.queryTimes.set(queryKey, []);
    }
    
    const times = this.queryTimes.get(queryKey)!;
    times.push(time);
    
    // Keep only last 50 measurements
    if (times.length > 50) {
      times.splice(0, times.length - 50);
    }
    
    // Update average query time
    const allTimes = Array.from(this.queryTimes.values()).flat();
    this.metrics.averageQueryTime = allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length;
  }

  private updateHitRate(): void {
    this.metrics.hitRate = this.metrics.totalQueries > 0
      ? (this.metrics.cacheHits / this.metrics.totalQueries) * 100
      : 0;
  }

  async invalidateQueryPattern(pattern: string): Promise<number> {
    try {
      const tags = [`query_pattern:${pattern}`];
      enhancedCacheManager.invalidateByTags(tags);
      return 1; // Return 1 to indicate successful invalidation
    } catch (error) {
      console.error('Error invalidating query pattern:', error);
      return 0;
    }
  }

  async invalidateUserQueries(userId: string): Promise<number> {
    try {
      const tags = [`user:${userId}`];
      enhancedCacheManager.invalidateByTags(tags);
      return 1; // Return 1 to indicate successful invalidation
    } catch (error) {
      console.error('Error invalidating user queries:', error);
      return 0;
    }
  }

  async invalidateConversationQueries(conversationId: string): Promise<number> {
    try {
      const tags = [`conversation:${conversationId}`];
      enhancedCacheManager.invalidateByTags(tags);
      return 1; // Return 1 to indicate successful invalidation
    } catch (error) {
      console.error('Error invalidating conversation queries:', error);
      return 0;
    }
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      enhancedCacheManager.invalidateByTags(tags);
      return tags.length; // Return number of tag patterns processed
    } catch (error) {
      console.error('Error invalidating by tags:', error);
      return 0;
    }
  }

  async preloadQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    options: {
      ttl?: number;
      tags?: string[];
      priority?: 'low' | 'medium' | 'high';
    } = {}
  ): Promise<void> {
    const { priority = 'low' } = options;
    
    // Preload with low priority to not interfere with active queries
    await this.getCachedQuery(queryKey, queryFn, { ...options, priority });
  }

  getMetrics(): QueryCacheMetrics {
    return { ...this.metrics };
  }

  getTopQueries(limit: number = 10): Array<{ queryKey: string; averageTime: number; callCount: number }> {
    return Array.from(this.queryTimes.entries())
      .map(([queryKey, times]) => ({
        queryKey,
        averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
        callCount: times.length
      }))
      .sort((a, b) => b.callCount - a.callCount)
      .slice(0, limit);
  }

  clearMetrics(): void {
    this.metrics = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      averageQueryTime: 0,
      totalCacheSize: 0
    };
    this.queryTimes.clear();
  }

  destroy(): void {
    this.clearMetrics();
    console.log('Query result cache destroyed');
  }
}

export const queryResultCache = new QueryResultCache();
