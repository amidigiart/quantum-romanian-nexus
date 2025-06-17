
import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';
import { responseCacheService } from '../responseCacheService';

export class CacheInvalidationService {
  constructor(
    private memoryCache: MemoryCacheManager,
    private sessionCache: SessionCacheManager
  ) {}

  async invalidateByTags(tags: string[]): Promise<number> {
    const memoryInvalidated = this.memoryCache.invalidateByTags(tags);
    const sessionInvalidated = await this.sessionCache.invalidateByTags(tags);
    
    // Also clear from response cache if it's a chat response
    if (tags.includes('chat-response')) {
      responseCacheService.clearCache();
    }

    const totalInvalidated = memoryInvalidated + sessionInvalidated;
    console.log(`Invalidated ${totalInvalidated} cache entries with tags:`, tags);
    
    return totalInvalidated;
  }

  clearAll(): void {
    this.memoryCache.clear();
    this.sessionCache.clear();
    responseCacheService.clearCache();
    console.log('All cache layers cleared');
  }
}
