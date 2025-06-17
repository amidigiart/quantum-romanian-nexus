
import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';
import { responseCacheService } from '../responseCacheService';
import { CacheStats } from './cacheMetricsCalculator';

export class CacheHierarchyService {
  constructor(
    private memoryCache: MemoryCacheManager,
    private sessionCache: SessionCacheManager,
    private config: { enableHierarchy: boolean; memoryTtl: number; sessionTtl: number },
    private cacheStats: CacheStats
  ) {}

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
    } catch (error) {
      console.error('Unified cache storage error:', error);
    }
  }

  private recordCacheHit(layer: 'memory' | 'session' | 'response', responseTime: number): void {
    this.cacheStats[layer].hits++;
  }

  private recordCacheMiss(): void {
    this.cacheStats.totalMisses++;
  }
}
