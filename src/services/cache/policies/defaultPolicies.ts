
import { CachePolicyConfig } from '@/types/cachePolicy';

export const DEFAULT_CACHE_POLICIES: CachePolicyConfig = {
  eviction: {
    strategy: 'lru',
    maxMemorySize: 50,
    maxSessionSize: 200
  },
  ttl: {
    strategy: 'priority-weighted',
    baseMemoryTTL: 2 * 60 * 1000, // 2 minutes
    baseSessionTTL: 5 * 60 * 1000, // 5 minutes
    adaptiveMultiplier: 1.5
  },
  priority: {
    strategy: 'balanced',
    memoryPriorityThreshold: 'medium',
    promotionThreshold: 3
  }
};

export const PERFORMANCE_OPTIMIZED_POLICIES: CachePolicyConfig = {
  eviction: {
    strategy: 'priority-based',
    maxMemorySize: 100,
    maxSessionSize: 300
  },
  ttl: {
    strategy: 'adaptive',
    baseMemoryTTL: 5 * 60 * 1000, // 5 minutes
    baseSessionTTL: 15 * 60 * 1000, // 15 minutes
    adaptiveMultiplier: 2
  },
  priority: {
    strategy: 'weighted',
    memoryPriorityThreshold: 'medium',
    promotionThreshold: 2
  }
};

export const MEMORY_CONSERVATIVE_POLICIES: CachePolicyConfig = {
  eviction: {
    strategy: 'ttl-based',
    maxMemorySize: 25,
    maxSessionSize: 100
  },
  ttl: {
    strategy: 'fixed',
    baseMemoryTTL: 1 * 60 * 1000, // 1 minute
    baseSessionTTL: 3 * 60 * 1000, // 3 minutes
  },
  priority: {
    strategy: 'strict',
    memoryPriorityThreshold: 'high',
    promotionThreshold: 5
  }
};
