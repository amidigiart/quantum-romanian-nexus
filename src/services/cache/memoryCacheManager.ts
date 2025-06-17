
import { CacheEntry } from '@/types/cache';
import { CompressedCacheManager } from './compressedCacheManager';

export class MemoryCacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly defaultTtl: number;
  private compressedCacheManager = new CompressedCacheManager();

  constructor(maxSize: number = 50, defaultTtl: number = 2 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      return null;
    }
    
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    
    // Handle decompression if needed
    if (entry.compression?.isCompressed) {
      return await this.compressedCacheManager.decompressAndRetrieve<T>(entry);
    }
    
    return entry.data as T;
  }

  async set<T>(
    key: string, 
    data: T, 
    ttl: number = this.defaultTtl,
    tags: string[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    if (this.cache.size >= this.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    // Create compressed cache entry
    const compressedEntry = await this.compressedCacheManager.compressAndStore(
      data,
      Date.now(),
      ttl,
      1,
      Date.now(),
      tags,
      priority
    );

    this.cache.set(key, compressedEntry);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.compressedCacheManager.resetCompressionStats();
  }

  size(): number {
    return this.cache.size;
  }

  entries(): IterableIterator<[string, CacheEntry]> {
    return this.cache.entries();
  }

  async cleanupExpired(): Promise<number> {
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

  getCompressionStats() {
    return this.compressedCacheManager.getCompressionStats();
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
