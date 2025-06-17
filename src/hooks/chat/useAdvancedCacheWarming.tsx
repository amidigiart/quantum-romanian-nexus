
import { advancedCacheWarmingService } from '@/services/cache/advancedCacheWarmingService';
import { cacheHitOptimizer } from '@/services/cache/cacheHitOptimizer';

export const useAdvancedCacheWarming = () => {
  const warmAdvancedCache = async () => {
    console.log('Starting advanced cache warming with optimizations...');
    
    // Use the advanced warming service
    await advancedCacheWarmingService.warmFrequentPatterns();
    
    // Start periodic warming
    advancedCacheWarmingService.startPeriodicWarming();
    
    console.log('Advanced cache warming completed');
  };

  const getCacheOptimizationMetrics = () => {
    return cacheHitOptimizer.getOptimizationMetrics();
  };

  return {
    warmAdvancedCache,
    getCacheOptimizationMetrics
  };
};
