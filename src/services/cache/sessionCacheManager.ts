
import { CacheEntry } from '@/types/cache';

export class SessionCacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly defaultTtl: number;
  private readonly storageKey: string;

  constructor(maxSize: number = 200, defaultTtl: number = 5 * 60 * 1000, storageKey: string = 'advanced-cache') {
    this.maxSize = maxSize;
    this.defaultTtl = defaultTtl;
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.cache.delete(key);
        this.saveToStorage();
      }
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

    this.saveToStorage();
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  clear(): void {
    this.cache.clear();
    this.clearStorage();
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
    if (cleanedCount > 0) {
      this.saveToStorage();
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
    if (invalidatedCount > 0) {
      this.saveToStorage();
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

  private saveToStorage(): void {
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
