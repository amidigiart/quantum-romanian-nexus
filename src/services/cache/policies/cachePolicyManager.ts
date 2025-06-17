
import { CachePolicyConfig, CacheEvictionStrategy, CacheTTLStrategy, CachePriorityStrategy } from '@/types/cachePolicy';
import { CacheEntry } from '@/types/cache';

// Import all strategy implementations
import { LRUEvictionStrategy, FIFOEvictionStrategy, PriorityBasedEvictionStrategy, TTLBasedEvictionStrategy } from './evictionStrategies';
import { FixedTTLStrategy, SlidingTTLStrategy, AdaptiveTTLStrategy, PriorityWeightedTTLStrategy } from './ttlStrategies';
import { StrictPriorityStrategy, WeightedPriorityStrategy, BalancedPriorityStrategy } from './priorityStrategies';

export class CachePolicyManager {
  private evictionStrategy: CacheEvictionStrategy;
  private ttlStrategy: CacheTTLStrategy;
  private priorityStrategy: CachePriorityStrategy;
  private config: CachePolicyConfig;

  constructor(config: CachePolicyConfig) {
    this.config = config;
    this.evictionStrategy = this.createEvictionStrategy(config.eviction.strategy);
    this.ttlStrategy = this.createTTLStrategy(config.ttl.strategy);
    this.priorityStrategy = this.createPriorityStrategy(config.priority.strategy);
  }

  // Factory methods for strategies
  private createEvictionStrategy(type: string): CacheEvictionStrategy {
    switch (type) {
      case 'lru': return new LRUEvictionStrategy();
      case 'fifo': return new FIFOEvictionStrategy();
      case 'priority-based': return new PriorityBasedEvictionStrategy();
      case 'ttl-based': return new TTLBasedEvictionStrategy();
      default: return new LRUEvictionStrategy();
    }
  }

  private createTTLStrategy(type: string): CacheTTLStrategy {
    switch (type) {
      case 'fixed': return new FixedTTLStrategy();
      case 'sliding': return new SlidingTTLStrategy();
      case 'adaptive': return new AdaptiveTTLStrategy();
      case 'priority-weighted': return new PriorityWeightedTTLStrategy();
      default: return new FixedTTLStrategy();
    }
  }

  private createPriorityStrategy(type: string): CachePriorityStrategy {
    switch (type) {
      case 'strict': return new StrictPriorityStrategy();
      case 'weighted': return new WeightedPriorityStrategy();
      case 'balanced': return new BalancedPriorityStrategy();
      default: return new BalancedPriorityStrategy();
    }
  }

  // Policy application methods
  shouldEvict(entry: CacheEntry, cacheSize: number, layer: 'memory' | 'session'): boolean {
    const maxSize = layer === 'memory' ? this.config.eviction.maxMemorySize : this.config.eviction.maxSessionSize;
    return this.evictionStrategy.shouldEvict(entry, cacheSize, maxSize);
  }

  selectEntriesForEviction(entries: Map<string, CacheEntry>): string[] {
    return this.evictionStrategy.selectForEviction(entries);
  }

  calculateTTL(priority: 'low' | 'medium' | 'high', layer: 'memory' | 'session', accessCount?: number): number {
    const baseTTL = layer === 'memory' ? this.config.ttl.baseMemoryTTL : this.config.ttl.baseSessionTTL;
    return this.ttlStrategy.calculateTTL(baseTTL, priority, accessCount);
  }

  shouldPromoteToMemory(entry: CacheEntry): boolean {
    return this.priorityStrategy.shouldPromote(entry, 'session', 'memory');
  }

  determineStorageLayer(priority: 'low' | 'medium' | 'high', dataSize?: number): 'memory' | 'session' {
    return this.priorityStrategy.calculateStorageLayer(priority, dataSize);
  }

  // Configuration management
  updateConfig(newConfig: Partial<CachePolicyConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Recreate strategies if their types changed
    if (newConfig.eviction?.strategy) {
      this.evictionStrategy = this.createEvictionStrategy(newConfig.eviction.strategy);
    }
    if (newConfig.ttl?.strategy) {
      this.ttlStrategy = this.createTTLStrategy(newConfig.ttl.strategy);
    }
    if (newConfig.priority?.strategy) {
      this.priorityStrategy = this.createPriorityStrategy(newConfig.priority.strategy);
    }
  }

  getConfig(): CachePolicyConfig {
    return { ...this.config };
  }

  // Policy introspection
  getCurrentStrategies() {
    return {
      eviction: this.evictionStrategy.type,
      ttl: this.ttlStrategy.type,
      priority: this.priorityStrategy.type
    };
  }
}
