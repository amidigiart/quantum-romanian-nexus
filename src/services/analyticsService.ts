
import { AnalyticsEvent, UserBehaviorMetrics, PerformanceMetrics } from '@/types/analytics';
import { PerformanceMonitor } from './analytics/performanceMonitor';
import { BehaviorTracker } from './analytics/behaviorTracker';
import { EventStorage } from './analytics/eventStorage';
import { MetricsCalculator } from './analytics/metricsCalculator';

export class AnalyticsService {
  private sessionId: string;
  private performanceMonitor: PerformanceMonitor;
  private behaviorTracker: BehaviorTracker;
  private eventStorage: EventStorage;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.eventStorage = new EventStorage();
    this.behaviorTracker = new BehaviorTracker();
    this.performanceMonitor = new PerformanceMonitor(this.handlePerformanceEvent.bind(this));
    
    this.eventStorage.loadPersistedEvents();
    this.trackPageView();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private handlePerformanceEvent(event: AnalyticsEvent): void {
    event.session_id = this.sessionId;
    event.route = window.location.pathname;
    this.eventStorage.addEvent(event);
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

    this.eventStorage.addEvent(event);
    this.behaviorTracker.updateBehavior(eventType, data);
    
    console.log('Analytics Event:', event);
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
      key: key ? key.substring(0, 50) : undefined
    });
  }

  getSessionMetrics(): UserBehaviorMetrics {
    return this.behaviorTracker.getMetrics();
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return MetricsCalculator.calculatePerformanceMetrics(this.eventStorage.getEvents());
  }

  getRecentEvents(limit: number = 100): AnalyticsEvent[] {
    return this.eventStorage.getRecentEvents(limit);
  }

  getEventsByType(eventType: string, limit: number = 50): AnalyticsEvent[] {
    return this.eventStorage.getEventsByType(eventType, limit);
  }

  exportAnalytics(): string {
    const analytics = {
      session_id: this.sessionId,
      session_start: new Date(Date.now() - this.behaviorTracker.getMetrics().sessionDuration).toISOString(),
      session_duration: this.behaviorTracker.getMetrics().sessionDuration,
      user_behavior: this.behaviorTracker.getMetrics(),
      performance_metrics: this.getPerformanceMetrics(),
      events: this.eventStorage.getEvents()
    };

    return JSON.stringify(analytics, null, 2);
  }

  clearAnalytics(): void {
    this.eventStorage.clearEvents();
    this.behaviorTracker.reset();
    sessionStorage.removeItem('user_behavior');
  }
}

export const analyticsService = new AnalyticsService();
