
import { CacheTTLStrategy, TTLPolicy } from '@/types/cachePolicy';

export class FixedTTLStrategy implements CacheTTLStrategy {
  readonly type: TTLPolicy = 'fixed';

  calculateTTL(baseTTL: number): number {
    return baseTTL;
  }
}

export class SlidingTTLStrategy implements CacheTTLStrategy {
  readonly type: TTLPolicy = 'sliding';

  calculateTTL(baseTTL: number, priority: 'low' | 'medium' | 'high', accessCount = 0): number {
    const accessMultiplier = Math.min(1 + (accessCount * 0.1), 2); // Max 2x TTL
    return baseTTL * accessMultiplier;
  }
}

export class AdaptiveTTLStrategy implements CacheTTLStrategy {
  readonly type: TTLPolicy = 'adaptive';

  calculateTTL(baseTTL: number, priority: 'low' | 'medium' | 'high', accessCount = 0): number {
    const now = Date.now();
    const hourOfDay = new Date(now).getHours();
    
    // Adaptive based on time of day (peak hours get longer TTL)
    const peakHours = hourOfDay >= 9 && hourOfDay <= 17;
    const timeMultiplier = peakHours ? 1.5 : 0.8;
    
    // Access frequency multiplier
    const frequencyMultiplier = accessCount > 5 ? 1.3 : 1;
    
    return baseTTL * timeMultiplier * frequencyMultiplier;
  }
}

export class PriorityWeightedTTLStrategy implements CacheTTLStrategy {
  readonly type: TTLPolicy = 'priority-weighted';

  calculateTTL(baseTTL: number, priority: 'low' | 'medium' | 'high'): number {
    const priorityMultipliers = {
      low: 0.7,
      medium: 1,
      high: 1.5
    };
    
    return baseTTL * priorityMultipliers[priority];
  }
}
