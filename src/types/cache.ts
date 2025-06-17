
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  compression?: {
    isCompressed: boolean;
    originalSize: number;
    compressedSize: number;
  };
}

export interface CacheMetrics {
  totalSize: number;
  hitRate: number;
  missRate: number;
  averageResponseTime: number;
  popularQueries: { query: string; hits: number }[];
  cacheEfficiency: number;
  compressionStats?: {
    totalCompressed: number;
    totalUncompressed: number;
    compressionRatio: number;
    spaceSaved: number;
  };
}

export interface CacheWarmingStrategy {
  key: string;
  dataLoader: () => Promise<any>;
  ttl?: number;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}
