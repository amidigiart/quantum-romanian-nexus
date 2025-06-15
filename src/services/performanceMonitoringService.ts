import { AnalyticsEvent } from '@/types/analytics';
import { analyticsService } from './analyticsService';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
    this.setupMemoryMonitoring();
  }

  private initializeObservers(): void {
    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric('navigation', entry.duration, {
            type: entry.entryType,
            name: entry.name
          });
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric('resource_load', entry.duration, {
            type: entry.entryType,
            name: entry.name,
            size: (entry as PerformanceResourceTiming).transferSize
          });
        });
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.recordMetric('long_task', entry.duration, {
            startTime: entry.startTime
          });
          
          // Report long tasks as potential performance issues
          analyticsService.trackEvent('performance_issue', {
            type: 'long_task',
            duration: entry.duration,
            startTime: entry.startTime
          });
        });
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        // longtask observer not supported in all browsers
        console.warn('Long task observer not supported');
      }
    }
  }

  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.recordMetric('memory_usage', memory.usedJSHeapSize, {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        });
      }, 30000); // Every 30 seconds
    }
  }

  recordMetric(name: string, value: number, metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory bloat
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Track performance events in analytics
    analyticsService.trackEvent('performance_metric', {
      metric_name: name,
      metric_value: value,
      ...metadata
    });
  }

  measureOperation<T>(name: string, operation: () => T | Promise<T>): T | Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = operation();
      
      if (result instanceof Promise) {
        return result.then((res) => {
          const duration = performance.now() - startTime;
          this.recordMetric(name, duration);
          return res;
        }).catch((error) => {
          const duration = performance.now() - startTime;
          this.recordMetric(name, duration, { error: true });
          throw error;
        });
      } else {
        const duration = performance.now() - startTime;
        this.recordMetric(name, duration);
        return result;
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration, { error: true });
      throw error;
    }
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageMetric(name: string, timeWindow?: number): number {
    const now = Date.now();
    const windowStart = timeWindow ? now - timeWindow : 0;
    
    const relevantMetrics = this.metrics.filter(m => 
      m.name === name && m.timestamp >= windowStart
    );
    
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
