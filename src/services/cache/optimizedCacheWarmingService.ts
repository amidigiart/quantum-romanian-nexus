
import { advancedCacheWarmingService } from './advancedCacheWarmingService';

// Re-export the advanced cache warming service for backward compatibility
export const optimizedCacheWarmingService = advancedCacheWarmingService;

// Legacy class for backward compatibility
export class OptimizedCacheWarmingService {
  async warmFrequentPatterns(): Promise<void> {
    return advancedCacheWarmingService.warmFrequentPatterns();
  }

  async schedulePeriodicWarming(): Promise<void> {
    advancedCacheWarmingService.startPeriodicWarming();
  }

  getPopularPatterns(): Map<string, number> {
    // Return empty map for compatibility - actual implementation in advanced service
    return new Map();
  }
}
