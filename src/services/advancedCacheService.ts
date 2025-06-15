
import { responseCacheService } from './responseCacheService';

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

interface CacheMetrics {
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  popularQueries: { query: string; hits: number }[];
  cacheEfficiency: number;
}

export class AdvancedCacheService {
  private memoryCache = new Map<string, CacheEntry>();
  private sessionCache = new Map<string, CacheEntry>();
  private metrics = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    responseTimeSum: 0
  };
  
  private readonly MAX_MEMORY_SIZE = 50; // Max entries in memory
  private readonly MAX_SESSION_SIZE = 200; // Max entries in session storage
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MEMORY_TTL = 2 * 60 * 1000; // 2 minutes for memory cache

  constructor() {
    this.loadSessionCache();
    this.startPeriodicCleanup();
  }

  // Multi-level cache retrieval (Memory -> Session -> Response Cache)
  async get<T>(key: string, tags: string[] = []): Promise<T | null> {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    try {
      // Level 1: Memory Cache (fastest)
      const memoryResult = this.getFromMemory<T>(key);
      if (memoryResult !== null) {
        this.recordHit(startTime);
        return memoryResult;
      }

      // Level 2: Session Cache
      const sessionResult = this.getFromSession<T>(key);
      if (sessionResult !== null) {
        // Promote to memory cache
        this.setInMemory(key, sessionResult, this.MEMORY_TTL, tags, 'medium');
        this.recordHit(startTime);
        return sessionResult;
      }

      // Level 3: Response Cache Service (for chat responses)
      if (tags.includes('chat-response')) {
        const responseResult = responseCacheService.getCachedResponse(key);
        if (responseResult) {
          const parsedResult = JSON.parse(responseResult) as T;
          this.setInSession(key, parsedResult, this.DEFAULT_TTL, tags, 'low');
          this.recordHit(startTime);
          return parsedResult;
        }
      }

      this.recordMiss(startTime);
      return null;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      this.recordMiss(startTime);
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
      this.setInSession(key, data, ttl, tags, priority);

      // Store in memory cache for high/medium priority items
      if (priority === 'high' || priority === 'medium') {
        this.setInMemory(key, data, Math.min(ttl, this.MEMORY_TTL), tags, priority);
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
  async warmCache(warmingStrategies: Array<{
    key: string;
    dataLoader: () => Promise<any>;
    ttl?: number;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  }>): Promise<void> {
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
    let invalidatedCount = 0;

    // Invalidate memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.memoryCache.delete(key);
        invalidatedCount++;
      }
    }

    // Invalidate session cache
    for (const [key, entry] of this.sessionCache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.sessionCache.delete(key);
        invalidatedCount++;
      }
    }

    this.saveSessionCache();
    console.log(`Invalidated ${invalidatedCount} cache entries with tags:`, tags);
  }

  // Get cache metrics and analytics
  getMetrics(): CacheMetrics {
    const hitRate = this.metrics.totalRequests > 0 
      ? (this.metrics.hits / this.metrics.totalRequests) * 100 
      : 0;
    
    const averageResponseTime = this.metrics.hits > 0
      ? this.metrics.responseTimeSum / this.metrics.hits
      : 0;

    const popularQueries = this.getPopularQueries();
    const cacheEfficiency = this.calculateCacheEfficiency();

    return {
      totalSize: this.memoryCache.size + this.sessionCache.size,
      hitRate,
      missRate: 100 - hitRate,
      averageResponseTime,
      popularQueries,
      cacheEfficiency
    };
  }

  // Private helper methods
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.memoryCache.delete(key);
      return null;
    }
    
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.data as T;
  }

  private getFromSession<T>(key: string): T | null {
    const entry = this.sessionCache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.sessionCache.delete(key);
        this.saveSessionCache();
      }
      return null;
    }
    
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.data as T;
  }

  private setInMemory<T>(
    key: string, 
    data: T, 
    ttl: number, 
    tags: string[], 
    priority: 'low' | 'medium' | 'high'
  ): void {
    // Evict if at capacity
    if (this.memoryCache.size >= this.MAX_MEMORY_SIZE) {
      this.evictLeastRecentlyUsed(this.memoryCache);
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      tags,
      priority
    });
  }

  private setInSession<T>(
    key: string, 
    data: T, 
    ttl: number, 
    tags: string[], 
    priority: 'low' | 'medium' | 'high'
  ): void {
    // Evict if at capacity
    if (this.sessionCache.size >= this.MAX_SESSION_SIZE) {
      this.evictLeastRecentlyUsed(this.sessionCache);
    }

    this.sessionCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      tags,
      priority
    });

    this.saveSessionCache();
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictLeastRecentlyUsed(cache: Map<string, CacheEntry>): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of cache.entries()) {
      if (entry.lastAccessed < oldestTime && entry.priority !== 'high') {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }

  private recordHit(startTime: number): void {
    this.metrics.hits++;
    this.metrics.responseTimeSum += performance.now() - startTime;
  }

  private recordMiss(startTime: number): void {
    this.metrics.misses++;
  }

  private getPopularQueries(): { query: string; hits: number }[] {
    const queryHits = new Map<string, number>();
    
    for (const [key, entry] of this.sessionCache.entries()) {
      if (entry.tags.includes('chat-response')) {
        queryHits.set(key, entry.accessCount);
      }
    }

    return Array.from(queryHits.entries())
      .map(([query, hits]) => ({ query, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);
  }

  private calculateCacheEfficiency(): number {
    const totalEntries = this.memoryCache.size + this.sessionCache.size;
    if (totalEntries === 0) return 0;

    let totalAccess = 0;
    for (const entry of this.memoryCache.values()) {
      totalAccess += entry.accessCount;
    }
    for (const entry of this.sessionCache.values()) {
      totalAccess += entry.accessCount;
    }

    return totalEntries > 0 ? (totalAccess / totalEntries) : 0;
  }

  private loadSessionCache(): void {
    try {
      const stored = sessionStorage.getItem('advanced-cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, entry] of Object.entries(parsed)) {
          this.sessionCache.set(key, entry as CacheEntry);
        }
      }
    } catch (error) {
      console.error('Failed to load session cache:', error);
    }
  }

  private saveSessionCache(): void {
    try {
      const cacheObject = Object.fromEntries(this.sessionCache.entries());
      sessionStorage.setItem('advanced-cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save session cache:', error);
    }
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredEntries();
    }, 60000); // Clean up every minute
  }

  private cleanupExpiredEntries(): void {
    let cleanedCount = 0;

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }

    // Clean session cache
    for (const [key, entry] of this.sessionCache.entries()) {
      if (this.isExpired(entry)) {
        this.sessionCache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.saveSessionCache();
      console.log(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  // Clear all caches
  clearAll(): void {
    this.memoryCache.clear();
    this.sessionCache.clear();
    responseCacheService.clearCache();
    sessionStorage.removeItem('advanced-cache');
    this.metrics = { hits: 0, misses: 0, totalRequests: 0, responseTimeSum: 0 };
    console.log('All caches cleared');
  }
}

export const advancedCacheService = new AdvancedCacheService();
