
export type EvictionPolicy = 'lru' | 'fifo' | 'priority-based' | 'ttl-based';
export type TTLPolicy = 'fixed' | 'sliding' | 'adaptive' | 'priority-weighted';
export type PriorityPolicy = 'strict' | 'weighted' | 'balanced';

export interface CacheEvictionStrategy {
  readonly type: EvictionPolicy;
  shouldEvict(entry: any, cacheSize: number, maxSize: number): boolean;
  selectForEviction(entries: Map<string, any>): string[];
}

export interface CacheTTLStrategy {
  readonly type: TTLPolicy;
  calculateTTL(baseTTL: number, priority: 'low' | 'medium' | 'high', accessCount?: number): number;
}

export interface CachePriorityStrategy {
  readonly type: PriorityPolicy;
  shouldPromote(entry: any, fromLayer: string, toLayer: string): boolean;
  calculateStorageLayer(priority: 'low' | 'medium' | 'high', dataSize: number): 'memory' | 'session';
}

export interface CachePolicyConfig {
  eviction: {
    strategy: EvictionPolicy;
    maxMemorySize: number;
    maxSessionSize: number;
  };
  ttl: {
    strategy: TTLPolicy;
    baseMemoryTTL: number;
    baseSessionTTL: number;
    adaptiveMultiplier?: number;
  };
  priority: {
    strategy: PriorityPolicy;
    memoryPriorityThreshold: 'medium' | 'high';
    promotionThreshold: number;
  };
}
