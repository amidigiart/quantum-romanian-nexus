
import { AnalyticsEvent, PerformanceMetrics } from '@/types/analytics';

export class MetricsCalculator {
  static calculatePerformanceMetrics(events: AnalyticsEvent[]): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
    
    const errorEvents = events.filter(e => e.event_type === 'error');
    const cacheEvents = events.filter(e => e.event_type === 'cache_operation');
    const cacheHits = cacheEvents.filter(e => e.data.operation === 'hit').length;
    const cacheMisses = cacheEvents.filter(e => e.data.operation === 'miss').length;
    const cacheHitRate = (cacheHits + cacheMisses) > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0;

    return {
      loadTime,
      responseTime: this.getAverageResponseTime(events),
      errorRate: events.length > 0 ? (errorEvents.length / events.length) * 100 : 0,
      cacheHitRate,
      memoryUsage: this.getCurrentMemoryUsage()
    };
  }

  private static getAverageResponseTime(events: AnalyticsEvent[]): number {
    const performanceEvents = events.filter(e => e.event_type === 'performance');
    if (performanceEvents.length === 0) return 0;
    
    const totalDuration = performanceEvents.reduce((sum, event) => sum + event.data.duration, 0);
    return totalDuration / performanceEvents.length;
  }

  private static getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }
}
