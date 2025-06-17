
import { CachePolicyConfig } from '@/types/cachePolicy';
import { DEFAULT_CACHE_POLICIES } from './policies/defaultPolicies';

export interface UnifiedCacheConfig {
  memoryMaxSize?: number;
  sessionMaxSize?: number;
  memoryTtl?: number;
  sessionTtl?: number;
  enableHierarchy?: boolean;
  enableWarming?: boolean;
  policies?: CachePolicyConfig;
}

export const DEFAULT_CACHE_CONFIG: Required<UnifiedCacheConfig> = {
  memoryMaxSize: 50,
  sessionMaxSize: 200,
  memoryTtl: 2 * 60 * 1000,
  sessionTtl: 5 * 60 * 1000,
  enableHierarchy: true,
  enableWarming: true,
  policies: DEFAULT_CACHE_POLICIES
};
