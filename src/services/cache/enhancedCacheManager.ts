
import { cachePerformanceMonitor } from '../cachePerformanceMonitor';
import { unifiedCacheManager } from './unifiedCacheManager';

export class EnhancedCacheManager {
  async get<T>(key: string, tags: string[] = []): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      const result = await unifiedCacheManager.get<T>(key, tags);
      const responseTime = performance.now() - startTime;
      
      if (result !== null) {
        cachePerformanceMonitor.recordCacheHit(key, 'memory', responseTime);
      } else {
        cachePerformanceMonitor.recordCacheMiss(key, 'memory', responseTime);
      }
      
      return result;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      cachePerformanceMonitor.recordCacheMiss(key, 'memory', responseTime);
      throw error;
    }
  }

  async set<T>(
    key: string, 
    data: T, 
    ttl?: number,
    tags: string[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      await unifiedCacheManager.set(key, data, ttl, tags, priority);
      const responseTime = performance.now() - startTime;
      
      cachePerformanceMonitor.recordCacheHit(key, 'memory', responseTime);
    } catch (error) {
      const responseTime = performance.now() - startTime;
      cachePerformanceMonitor.recordCacheMiss(key, 'memory', responseTime);
      throw error;
    }
  }

  // Delegate other methods to unified cache manager
  async setBatch<T>(entries: Array<{
    key: string;
    data: T;
    ttl?: number;
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
  }>): Promise<void> {
    return unifiedCacheManager.setBatch(entries);
  }

  invalidateByTags(tags: string[]): void {
    unifiedCacheManager.invalidateByTags(tags);
  }

  getMetrics() {
    return unifiedCacheManager.getMetrics();
  }

  clearAll(): void {
    unifiedCacheManager.clearAll();
  }

  destroy(): void {
    unifiedCacheManager.destroy();
  }
}

export const enhancedCacheManager = new EnhancedCacheManager();
