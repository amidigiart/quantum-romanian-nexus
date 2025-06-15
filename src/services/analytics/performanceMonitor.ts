
import { AnalyticsEvent } from '@/types/analytics';

export class PerformanceMonitor {
  private performanceObserver?: PerformanceObserver;
  private onEvent: (event: AnalyticsEvent) => void;

  constructor(onEvent: (event: AnalyticsEvent) => void) {
    this.onEvent = onEvent;
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring(): void {
    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.onEvent({
            event_type: 'performance',
            session_id: '',
            timestamp: Date.now(),
            data: {
              name: entry.name,
              duration: entry.duration,
              type: entry.entryType
            }
          });
        });
      });
      
      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'resource', 'measure'] 
      });
    }

    // Track memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.onEvent({
          event_type: 'memory_usage',
          session_id: '',
          timestamp: Date.now(),
          data: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          }
        });
      }, 60000); // Every minute
    }
  }

  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}
