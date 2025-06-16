
import { unifiedCacheManager } from './unifiedCacheManager';
import { CacheWarmingStrategy } from '@/types/cache';

export class AdvancedCacheWarmingService {
  private warmingQueue: Map<string, CacheWarmingStrategy> = new Map();
  private isWarming = false;
  private warmingInterval: number | null = null;
  private readonly DEFAULT_WARMING_INTERVAL = 20 * 60 * 1000; // 20 minutes

  // Core warming methods
  async warmCache(strategies: CacheWarmingStrategy[]): Promise<void> {
    console.log(`Queuing ${strategies.length} cache warming strategies...`);
    
    // Add strategies to warming queue
    strategies.forEach(strategy => {
      this.warmingQueue.set(strategy.key, strategy);
    });

    if (!this.isWarming) {
      await this.processWarmingQueue();
    }
  }

  async warmFrequentPatterns(): Promise<void> {
    const strategies = this.generateFrequentPatternStrategies();
    await this.warmCache(strategies);
  }

  async warmUserContextualContent(userPreferences: string[] = []): Promise<void> {
    const strategies = this.generateContextualStrategies(userPreferences);
    await this.warmCache(strategies);
  }

  async warmExpertiseLevelContent(expertiseLevel: 'beginner' | 'intermediate' | 'advanced'): Promise<void> {
    const strategies = this.generateExpertiseStrategies(expertiseLevel);
    await this.warmCache(strategies);
  }

  async prefetchRelatedContent(baseKey: string, patterns: string[]): Promise<void> {
    const prefetchPromises = patterns.map(async (pattern) => {
      const prefetchKey = `${baseKey}:${pattern}`;
      const existing = await unifiedCacheManager.get(prefetchKey);
      
      if (!existing) {
        this.scheduleForWarming(prefetchKey, ['prefetch'], 'low');
      }
    });

    await Promise.allSettled(prefetchPromises);
  }

  // Automatic warming management
  startPeriodicWarming(interval: number = this.DEFAULT_WARMING_INTERVAL): void {
    if (this.warmingInterval) {
      this.stopPeriodicWarming();
    }

    this.warmingInterval = window.setInterval(async () => {
      await this.warmFrequentPatterns();
    }, interval);

    console.log(`Started periodic cache warming every ${interval / 1000 / 60} minutes`);
  }

  stopPeriodicWarming(): void {
    if (this.warmingInterval) {
      clearInterval(this.warmingInterval);
      this.warmingInterval = null;
      console.log('Stopped periodic cache warming');
    }
  }

  // Queue management
  scheduleForWarming(key: string, tags: string[], priority: 'low' | 'medium' | 'high'): void {
    if (!this.warmingQueue.has(key)) {
      this.warmingQueue.set(key, {
        key,
        dataLoader: async () => this.generateDefaultContent(key),
        tags,
        priority
      });
    }
  }

  clearWarmingQueue(): void {
    this.warmingQueue.clear();
    console.log('Cache warming queue cleared');
  }

  getQueueStatus(): { size: number; isWarming: boolean } {
    return {
      size: this.warmingQueue.size,
      isWarming: this.isWarming
    };
  }

  // Private warming implementation
  private async processWarmingQueue(): Promise<void> {
    if (this.isWarming || this.warmingQueue.size === 0) return;

    this.isWarming = true;
    console.log(`Processing ${this.warmingQueue.size} cache warming strategies...`);

    const warmingPromises = Array.from(this.warmingQueue.values()).map(async (strategy) => {
      try {
        const data = await strategy.dataLoader();
        await unifiedCacheManager.set(
          strategy.key,
          data,
          strategy.ttl,
          strategy.tags,
          strategy.priority || 'medium'
        );
        console.log(`Cache warmed: ${strategy.key}`);
      } catch (error) {
        console.error(`Failed to warm cache for ${strategy.key}:`, error);
      }
    });

    await Promise.allSettled(warmingPromises);
    this.warmingQueue.clear();
    this.isWarming = false;
    console.log('Cache warming completed');
  }

  private generateFrequentPatternStrategies(): CacheWarmingStrategy[] {
    return [
      {
        key: 'frequent:quantum-algorithms:general',
        dataLoader: async () => this.generateAlgorithmContent(),
        ttl: 30 * 60 * 1000,
        tags: ['chat-response', 'quantum-algorithms', 'frequent'],
        priority: 'high'
      },
      {
        key: 'frequent:quantum-principles:general',
        dataLoader: async () => this.generatePrinciplesContent(),
        ttl: 45 * 60 * 1000,
        tags: ['chat-response', 'quantum-principles', 'frequent'],
        priority: 'high'
      },
      {
        key: 'frequent:quantum-news:general',
        dataLoader: async () => this.generateNewsContent(),
        ttl: 15 * 60 * 1000,
        tags: ['chat-response', 'quantum-news', 'frequent'],
        priority: 'medium'
      }
    ];
  }

  private generateContextualStrategies(userPreferences: string[]): CacheWarmingStrategy[] {
    return userPreferences.map(preference => ({
      key: `contextual:${preference}:user-specific`,
      dataLoader: async () => this.generateContextualContent(preference),
      ttl: 20 * 60 * 1000,
      tags: ['chat-response', 'contextual', preference],
      priority: 'medium'
    }));
  }

  private generateExpertiseStrategies(level: string): CacheWarmingStrategy[] {
    return [
      {
        key: `expertise:${level}:overview`,
        dataLoader: async () => this.generateExpertiseContent(level),
        ttl: 25 * 60 * 1000,
        tags: ['chat-response', 'expertise', level],
        priority: 'medium'
      }
    ];
  }

  // Content generators
  private async generateAlgorithmContent(): Promise<string> {
    return 'Quantum algorithms leverage quantum mechanical phenomena like superposition and entanglement to solve specific problems faster than classical computers...';
  }

  private async generatePrinciplesContent(): Promise<string> {
    return 'Quantum computing principles are built on quantum mechanics fundamentals: superposition, entanglement, and measurement...';
  }

  private async generateNewsContent(): Promise<string> {
    return 'Latest quantum computing developments include advances in error correction, new quantum processor architectures...';
  }

  private async generateContextualContent(preference: string): Promise<string> {
    return `Specialized content for ${preference} in quantum computing applications and implementations...`;
  }

  private async generateExpertiseContent(level: string): Promise<string> {
    const content = {
      beginner: 'Introduction to quantum computing concepts with simplified explanations...',
      intermediate: 'Detailed quantum algorithms and their mathematical foundations...',
      advanced: 'Advanced quantum computing topics including error correction...'
    };
    return content[level as keyof typeof content] || 'General quantum computing overview...';
  }

  private async generateDefaultContent(key: string): Promise<string> {
    return `Generated content for cache key: ${key}`;
  }

  // Cleanup
  destroy(): void {
    this.stopPeriodicWarming();
    this.clearWarmingQueue();
    console.log('Advanced cache warming service destroyed');
  }
}

export const advancedCacheWarmingService = new AdvancedCacheWarmingService();
