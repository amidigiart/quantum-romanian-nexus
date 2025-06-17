
import { CachePriorityStrategy, PriorityPolicy } from '@/types/cachePolicy';
import { CacheEntry } from '@/types/cache';

export class StrictPriorityStrategy implements CachePriorityStrategy {
  readonly type: PriorityPolicy = 'strict';

  shouldPromote(entry: CacheEntry, fromLayer: string, toLayer: string): boolean {
    if (toLayer === 'memory' && fromLayer === 'session') {
      return entry.priority === 'high';
    }
    return false;
  }

  calculateStorageLayer(priority: 'low' | 'medium' | 'high'): 'memory' | 'session' {
    return priority === 'high' ? 'memory' : 'session';
  }
}

export class WeightedPriorityStrategy implements CachePriorityStrategy {
  readonly type: PriorityPolicy = 'weighted';

  shouldPromote(entry: CacheEntry, fromLayer: string, toLayer: string): boolean {
    if (toLayer === 'memory' && fromLayer === 'session') {
      const accessThreshold = { low: 10, medium: 5, high: 2 };
      return entry.accessCount >= accessThreshold[entry.priority];
    }
    return false;
  }

  calculateStorageLayer(priority: 'low' | 'medium' | 'high', dataSize = 0): 'memory' | 'session' {
    const sizeThreshold = 1024; // 1KB threshold
    
    if (priority === 'high' || (priority === 'medium' && dataSize < sizeThreshold)) {
      return 'memory';
    }
    return 'session';
  }
}

export class BalancedPriorityStrategy implements CachePriorityStrategy {
  readonly type: PriorityPolicy = 'balanced';

  shouldPromote(entry: CacheEntry, fromLayer: string, toLayer: string): boolean {
    if (toLayer === 'memory' && fromLayer === 'session') {
      const recentlyAccessed = Date.now() - entry.lastAccessed < 60000; // 1 minute
      const frequentlyAccessed = entry.accessCount >= 3;
      const highPriority = entry.priority === 'high';
      
      return highPriority || (recentlyAccessed && frequentlyAccessed);
    }
    return false;
  }

  calculateStorageLayer(priority: 'low' | 'medium' | 'high', dataSize = 0): 'memory' | 'session' {
    if (priority === 'high') return 'memory';
    if (priority === 'low') return 'session';
    
    // Medium priority uses balanced approach
    return dataSize < 512 ? 'memory' : 'session';
  }
}
