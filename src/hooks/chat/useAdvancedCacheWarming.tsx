
import { optimizedCacheWarmingService } from '@/services/cache/optimizedCacheWarmingService';
import { cacheHitOptimizer } from '@/services/cache/cacheHitOptimizer';

export const useAdvancedCacheWarming = () => {
  const warmAdvancedCache = async () => {
    console.log('Starting advanced cache warming with optimizations...');
    
    // Use the optimized warming service
    await optimizedCacheWarmingService.warmFrequentPatterns();
    
    // Schedule periodic warming
    optimizedCacheWarmingService.schedulePeriodicWarming();
    
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
