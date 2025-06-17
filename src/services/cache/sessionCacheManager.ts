
import { CacheEntry } from '@/types/cache';
import { CompressedCacheManager } from './compressedCacheManager';

export class SessionCacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly defaultTtl: number;
  private readonly storageKey: string;
  private compressedCacheManager = new CompressedCacheManager();

  constructor(maxSize: number = 200, defaultTtl: number = 5 * 60 * 1000, storageKey: string = 'advanced-cache') {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.cache.delete(key);
        await this.saveToStorage();
      }
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
    await this.saveToStorage();
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    await this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    this.compressedCacheManager.resetCompressionStats();
    this.clearStorage();
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
    if (cleanedCount > 0) {
      await this.saveToStorage();
    }
    return cleanedCount;
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidatedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }
    if (invalidatedCount > 0) {
      await this.saveToStorage();
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

  private loadFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, entry] of Object.entries(parsed)) {
          this.cache.set(key, entry as CacheEntry);
        }
      }
    } catch (error) {
      console.error('Failed to load session cache:', error);
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      const cacheObject = Object.fromEntries(this.cache.entries());
      sessionStorage.setItem(this.storageKey, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save session cache:', error);
    }
  }

  private clearStorage(): void {
    sessionStorage.removeItem(this.storageKey);
  }
}
