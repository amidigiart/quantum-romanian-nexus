
import { CacheEntry } from '@/types/cache';

export class MemoryCacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly defaultTtl: number;

  constructor(maxSize: number = 50, defaultTtl: number = 2 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }
    
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.data as T;
  }

  set<T>(
    key: string, 
    data: T, 
    ttl: number = this.defaultTtl,
    tags: string[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      tags,
      priority
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  entries(): IterableIterator<[string, CacheEntry]> {
    return this.cache.entries();
  }

  cleanupExpired(): number {
    let cleanedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    return cleanedCount;
  }

  invalidateByTags(tags: string[]): number {
    let invalidatedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }
    return invalidatedCount;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime && entry.priority !== 'high') {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
