
interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  session_id: string;
  timestamp: number;
  data: any;
  route?: string;
}

interface UserBehaviorMetrics {
  pageViews: number;
  sessionDuration: number;
  clickEvents: number;
  interactions: { [key: string]: number };
  conversationCount: number;
  messageCount: number;
}

interface PerformanceMetrics {
  loadTime: number;
  responseTime: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsage: number;
}

interface SystemMetrics {
  activeUsers: number;
  totalSessions: number;
  errorCount: number;
  cachePerformance: {
    hits: number;
    misses: number;
    efficiency: number;
  };
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStartTime: number;
  private performanceObserver?: PerformanceObserver;
  private userBehavior: UserBehaviorMetrics;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.userBehavior = {
      pageViews: 0,
      sessionDuration: 0,
      clickEvents: 0,
      interactions: {},
      conversationCount: 0,
      messageCount: 0
    };
    this.initializePerformanceMonitoring();
    this.trackPageView();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializePerformanceMonitoring(): void {
    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          this.trackEvent('performance', {
            name: entry.name,
            duration: entry.duration,
            type: entry.entryType
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
        this.trackEvent('memory_usage', {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      }, 60000); // Every minute
    }
  }

  trackEvent(eventType: string, data: any = {}, userId?: string): void {
    const event: AnalyticsEvent = {
      event_type: eventType,
      user_id: userId,
      session_id: this.sessionId,
      timestamp: Date.now(),
      data,
      route: window.location.pathname
    };

    this.events.push(event);
    this.updateUserBehavior(eventType, data);
    
    // Store in sessionStorage for persistence
    this.persistEvents();
    
    console.log('Analytics Event:', event);
  }

  private updateUserBehavior(eventType: string, data: any): void {
    switch (eventType) {
      case 'page_view':
        this.userBehavior.pageViews++;
        break;
      case 'click':
        this.userBehavior.clickEvents++;
        if (data.component) {
          this.userBehavior.interactions[data.component] = 
            (this.userBehavior.interactions[data.component] || 0) + 1;
        }
        break;
      case 'conversation_created':
        this.userBehavior.conversationCount++;
        break;
      case 'message_sent':
        this.userBehavior.messageCount++;
        break;
    }
    
    this.userBehavior.sessionDuration = Date.now() - this.sessionStartTime;
  }

  trackPageView(route?: string): void {
    this.trackEvent('page_view', {
      route: route || window.location.pathname,
      timestamp: Date.now()
    });
  }

  trackClick(component: string, action: string, data: any = {}): void {
    this.trackEvent('click', {
      component,
      action,
      ...data
    });
  }

  trackError(error: Error, context?: string): void {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href
    });
  }

  trackConversation(conversationId: string, action: 'created' | 'deleted' | 'selected'): void {
    this.trackEvent(`conversation_${action}`, {
      conversation_id: conversationId
    });
  }

  trackCacheOperation(operation: 'hit' | 'miss' | 'set' | 'clear', key?: string): void {
    this.trackEvent('cache_operation', {
      operation,
      key: key ? key.substring(0, 50) : undefined // Truncate long keys
    });
  }

  getSessionMetrics(): UserBehaviorMetrics {
    return {
      ...this.userBehavior,
      sessionDuration: Date.now() - this.sessionStartTime
    };
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? navigation.loadEventEnd - navigation.navigationStart : 0;
    
    const errorEvents = this.events.filter(e => e.event_type === 'error');
    const cacheEvents = this.events.filter(e => e.event_type === 'cache_operation');
    const cacheHits = cacheEvents.filter(e => e.data.operation === 'hit').length;
    const cacheMisses = cacheEvents.filter(e => e.data.operation === 'miss').length;
    const cacheHitRate = (cacheHits + cacheMisses) > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0;

    return {
      loadTime,
      responseTime: this.getAverageResponseTime(),
      errorRate: (errorEvents.length / this.events.length) * 100,
      cacheHitRate,
      memoryUsage: this.getCurrentMemoryUsage()
    };
  }

  private getAverageResponseTime(): number {
    const performanceEvents = this.events.filter(e => e.event_type === 'performance');
    if (performanceEvents.length === 0) return 0;
    
    const totalDuration = performanceEvents.reduce((sum, event) => sum + event.data.duration, 0);
    return totalDuration / performanceEvents.length;
  }

  private getCurrentMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
    return 0;
  }

  getRecentEvents(limit: number = 100): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByType(eventType: string, limit: number = 50): AnalyticsEvent[] {
    return this.events
      .filter(e => e.event_type === eventType)
      .slice(-limit);
  }

  exportAnalytics(): string {
    const analytics = {
      session_id: this.sessionId,
      session_start: new Date(this.sessionStartTime).toISOString(),
      session_duration: Date.now() - this.sessionStartTime,
      user_behavior: this.userBehavior,
      performance_metrics: this.getPerformanceMetrics(),
      events: this.events
    };

    return JSON.stringify(analytics, null, 2);
  }

  private persistEvents(): void {
    try {
      const recentEvents = this.events.slice(-500); // Keep last 500 events
      sessionStorage.setItem('analytics_events', JSON.stringify(recentEvents));
      sessionStorage.setItem('user_behavior', JSON.stringify(this.userBehavior));
    } catch (error) {
      console.error('Failed to persist analytics events:', error);
    }
  }

  private loadPersistedEvents(): void {
    try {
      const storedEvents = sessionStorage.getItem('analytics_events');
      const storedBehavior = sessionStorage.getItem('user_behavior');
      
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }
      
      if (storedBehavior) {
        this.userBehavior = { ...this.userBehavior, ...JSON.parse(storedBehavior) };
      }
    } catch (error) {
      console.error('Failed to load persisted analytics:', error);
    }
  }

  clearAnalytics(): void {
    this.events = [];
    this.userBehavior = {
      pageViews: 0,
      sessionDuration: 0,
      clickEvents: 0,
      interactions: {},
      conversationCount: 0,
      messageCount: 0
    };
    sessionStorage.removeItem('analytics_events');
    sessionStorage.removeItem('user_behavior');
  }
}

export const analyticsService = new AnalyticsService();
