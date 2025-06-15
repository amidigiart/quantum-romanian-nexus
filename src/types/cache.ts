
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface CacheMetrics {
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  popularQueries: { query: string; hits: number }[];
  cacheEfficiency: number;
}

export interface CacheWarmingStrategy {
  key: string;
  dataLoader: () => Promise<any>;
  ttl?: number;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}
