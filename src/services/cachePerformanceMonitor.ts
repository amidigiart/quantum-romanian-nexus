import { performanceMonitoringService } from './performanceMonitoringService';
import { analyticsService } from './analyticsService';

interface CacheHitMetric {
  key: string;
  hit: boolean;
  responseTime: number;
  timestamp: number;
  cacheType: 'memory' | 'session' | 'response';
}

interface CachePerformanceMetrics {
  totalRequests: number;
  hits: number;
  misses: number;
  hitRate: number;
  averageHitTime: number;
  averageMissTime: number;
  popularKeys: { key: string; hits: number }[];
}

export class CachePerformanceMonitor {
  private metrics: CacheHitMetric[] = [];
  private keyHitCounts = new Map<string, number>();

  recordCacheHit(key: string, cacheType: 'memory' | 'session' | 'response', responseTime: number = 0): void {
    const metric: CacheHitMetric = {
      key,
      hit: true,
      responseTime,
      timestamp: Date.now(),
      cacheType
    };

    this.metrics.push(metric);
    this.keyHitCounts.set(key, (this.keyHitCounts.get(key) || 0) + 1);
    
    // Record in performance monitoring
    performanceMonitoringService.recordMetric('cache_hit', responseTime, {
      cache_type: cacheType,
      key: key.substring(0, 50) // Truncate key for privacy
    });

    analyticsService.trackCacheOperation('hit', key);
    
    this.cleanup();
  }

  recordCacheMiss(key: string, cacheType: 'memory' | 'session' | 'response', responseTime: number): void {
    const metric: CacheHitMetric = {
      key,
      hit: false,
      responseTime,
      timestamp: Date.now(),
      cacheType
    };

    this.metrics.push(metric);
    
    // Record in performance monitoring
    performanceMonitoringService.recordMetric('cache_miss', responseTime, {
      cache_type: cacheType,
      key: key.substring(0, 50)
    });

    analyticsService.trackCacheOperation('miss', key);
    
    this.cleanup();
  }

  getMetrics(timeWindow?: number): CachePerformanceMetrics {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;
    
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= windowStart);
    
    const hits = relevantMetrics.filter(m => m.hit);
    const misses = relevantMetrics.filter(m => !m.hit);
    
    const totalRequests = relevantMetrics.length;
    const hitRate = totalRequests > 0 ? (hits.length / totalRequests) * 100 : 0;
    
    const averageHitTime = hits.length > 0 
      ? hits.reduce((sum, m) => sum + m.responseTime, 0) / hits.length 
      : 0;
      
    const averageMissTime = misses.length > 0 
      ? misses.reduce((sum, m) => sum + m.responseTime, 0) / misses.length 
      : 0;

    // Get popular keys
    const keyHits = new Map<string, number>();
    hits.forEach(hit => {
      keyHits.set(hit.key, (keyHits.get(hit.key) || 0) + 1);
    });
    
    const popularKeys = Array.from(keyHits.entries())
      .map(([key, hits]) => ({ key, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    return {
      totalRequests,
      hits: hits.length,
      misses: misses.length,
      hitRate,
      averageHitTime,
      averageMissTime,
      popularKeys
    };
  }

  getCacheTypeMetrics(cacheType: 'memory' | 'session' | 'response', timeWindow?: number): CachePerformanceMetrics {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;
    
    const typeMetrics = this.metrics.filter(m => 
      m.cacheType === cacheType && m.timestamp >= windowStart
    );
    
    const hits = typeMetrics.filter(m => m.hit);
    const misses = typeMetrics.filter(m => !m.hit);
    
    const totalRequests = typeMetrics.length;
    const hitRate = totalRequests > 0 ? (hits.length / totalRequests) * 100 : 0;
    
    const averageHitTime = hits.length > 0 
      ? hits.reduce((sum, m) => sum + m.responseTime, 0) / hits.length 
      : 0;
      
    const averageMissTime = misses.length > 0 
      ? misses.reduce((sum, m) => sum + m.responseTime, 0) / misses.length 
      : 0;

    return {
      totalRequests,
      hits: hits.length,
      misses: misses.length,
      hitRate,
      averageHitTime,
      averageMissTime,
      popularKeys: []
    };
  }

  private cleanup(): void {
    // Keep only last 5000 metrics to prevent memory bloat
    if (this.metrics.length > 5000) {
      const oldMetrics = this.metrics.slice(0, this.metrics.length - 5000);
      this.metrics = this.metrics.slice(-5000);
      
      // Clean up key hit counts for removed metrics
      oldMetrics.forEach(metric => {
        if (metric.hit) {
          const currentCount = this.keyHitCounts.get(metric.key) || 0;
          if (currentCount <= 1) {
            this.keyHitCounts.delete(metric.key);
          } else {
            this.keyHitCounts.set(metric.key, currentCount - 1);
          }
        }
      });
    }
  }

  reset(): void {
    this.metrics = [];
    this.keyHitCounts.clear();
  }
}

export const cachePerformanceMonitor = new CachePerformanceMonitor();
