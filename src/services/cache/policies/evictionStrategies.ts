
import { CacheEvictionStrategy, EvictionPolicy } from '@/types/cachePolicy';
import { CacheEntry } from '@/types/cache';

export class LRUEvictionStrategy implements CacheEvictionStrategy {
  readonly type: EvictionPolicy = 'lru';

  shouldEvict(entry: CacheEntry, cacheSize: number, maxSize: number): boolean {
    return cacheSize >= maxSize;
  }

  selectForEviction(entries: Map<string, CacheEntry>): string[] {
    const sortedByAccess = Array.from(entries.entries())
      .sort(([,a], [,b]) => a.lastAccessed - b.lastAccessed);
    
    const toEvict = Math.ceil(entries.size * 0.1); // Evict 10%
    return sortedByAccess.slice(0, toEvict).map(([key]) => key);
  }
}

export class FIFOEvictionStrategy implements CacheEvictionStrategy {
  readonly type: EvictionPolicy = 'fifo';

  shouldEvict(entry: CacheEntry, cacheSize: number, maxSize: number): boolean {
    return cacheSize >= maxSize;
  }

  selectForEviction(entries: Map<string, CacheEntry>): string[] {
    const sortedByTimestamp = Array.from(entries.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp);
    
    const toEvict = Math.ceil(entries.size * 0.1);
    return sortedByTimestamp.slice(0, toEvict).map(([key]) => key);
  }
}

export class PriorityBasedEvictionStrategy implements CacheEvictionStrategy {
  readonly type: EvictionPolicy = 'priority-based';

  shouldEvict(entry: CacheEntry, cacheSize: number, maxSize: number): boolean {
    return cacheSize >= maxSize;
  }

  selectForEviction(entries: Map<string, CacheEntry>): string[] {
    const priorityOrder = { low: 0, medium: 1, high: 2 };
    
    const sortedByPriority = Array.from(entries.entries())
      .sort(([,a], [,b]) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.lastAccessed - b.lastAccessed;
      });
    
    const toEvict = Math.ceil(entries.size * 0.15);
    return sortedByPriority.slice(0, toEvict).map(([key]) => key);
  }
}

export class TTLBasedEvictionStrategy implements CacheEvictionStrategy {
  readonly type: EvictionPolicy = 'ttl-based';

  shouldEvict(entry: CacheEntry, cacheSize: number, maxSize: number): boolean {
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    return isExpired || cacheSize >= maxSize;
  }

  selectForEviction(entries: Map<string, CacheEntry>): string[] {
    const now = Date.now();
    const expired = Array.from(entries.entries())
      .filter(([, entry]) => now - entry.timestamp > entry.ttl)
      .map(([key]) => key);

    if (expired.length > 0) return expired;

    // If no expired entries, fall back to TTL remaining
    const sortedByTTL = Array.from(entries.entries())
      .sort(([,a], [,b]) => {
        const aTTLRemaining = a.ttl - (now - a.timestamp);
        const bTTLRemaining = b.ttl - (now - b.timestamp);
        return aTTLRemaining - bTTLRemaining;
      });
    
    const toEvict = Math.ceil(entries.size * 0.1);
    return sortedByTTL.slice(0, toEvict).map(([key]) => key);
  }
}
