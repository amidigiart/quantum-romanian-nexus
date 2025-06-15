
interface CachedResponse {
  response: string;
  timestamp: number;
  hitCount: number;
}

interface CacheStats {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
}

class ResponseCacheService {
  private cache = new Map<string, CachedResponse>();
  private readonly CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
  private readonly MAX_CACHE_SIZE = 100;
  private stats = {
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0
  };

  private normalizeQuery(query: string): string {
    return query.toLowerCase()
      .trim()
      .replace(/[.,!?;]/g, '')
      .replace(/\s+/g, ' ');
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.CACHE_EXPIRY_MS;
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (this.isExpired(cached.timestamp)) {
        this.cache.delete(key);
      }
    }
  }

  private evictLeastUsed(): void {
    if (this.cache.size < this.MAX_CACHE_SIZE) return;

    let leastUsedKey = '';
    let minHitCount = Infinity;

    for (const [key, cached] of this.cache.entries()) {
      if (cached.hitCount < minHitCount) {
        minHitCount = cached.hitCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  getCachedResponse(query: string): string | null {
    this.stats.totalQueries++;
    this.evictExpired();

    const normalizedQuery = this.normalizeQuery(query);
    const cached = this.cache.get(normalizedQuery);

    if (cached && !this.isExpired(cached.timestamp)) {
      cached.hitCount++;
      this.stats.cacheHits++;
      console.log(`Cache hit for query: "${query}"`);
      return cached.response;
    }

    this.stats.cacheMisses++;
    return null;
  }

  setCachedResponse(query: string, response: string): void {
    const normalizedQuery = this.normalizeQuery(query);
    
    this.evictLeastUsed();
    
    this.cache.set(normalizedQuery, {
      response,
      timestamp: Date.now(),
      hitCount: 1
    });

    console.log(`Cached response for query: "${query}"`);
  }

  clearCache(): void {
    this.cache.clear();
    this.stats = {
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    console.log('Response cache cleared');
  }

  getCacheStats(): CacheStats {
    return {
      ...this.stats,
      hitRate: this.stats.totalQueries > 0 ? 
        (this.stats.cacheHits / this.stats.totalQueries) * 100 : 0
    };
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const responseCacheService = new ResponseCacheService();
