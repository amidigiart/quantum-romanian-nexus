
import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';

export class CacheCleanupService {
  private cleanupInterval?: NodeJS.Timeout;

  startPeriodicCleanup(memoryCache: MemoryCacheManager, sessionCache: SessionCacheManager): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries(memoryCache, sessionCache);
    }, 60000); // Clean up every minute
  }

  stopPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  }

  cleanupExpiredEntries(memoryCache: MemoryCacheManager, sessionCache: SessionCacheManager): void {
    const memoryCleanedCount = memoryCache.cleanupExpired();
    const sessionCleanedCount = sessionCache.cleanupExpired();
    const totalCleaned = memoryCleanedCount + sessionCleanedCount;

    if (totalCleaned > 0) {
      console.log(`Cleaned up ${totalCleaned} expired cache entries`);
    }
  }

  invalidateByTags(
    tags: string[], 
    memoryCache: MemoryCacheManager, 
    sessionCache: SessionCacheManager
  ): void {
    const memoryInvalidated = memoryCache.invalidateByTags(tags);
    const sessionInvalidated = sessionCache.invalidateByTags(tags);
    const totalInvalidated = memoryInvalidated + sessionInvalidated;

    console.log(`Invalidated ${totalInvalidated} cache entries with tags:`, tags);
  }
}
