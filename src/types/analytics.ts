
export interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  session_id: string;
  timestamp: number;
  data: any;
  route?: string;
}

export interface UserBehaviorMetrics {
  pageViews: number;
  sessionDuration: number;
  clickEvents: number;
  interactions: { [key: string]: number };
  conversationCount: number;
  messageCount: number;
}

export interface PerformanceMetrics {
  loadTime: number;
  responseTime: number;
  errorRate: number;
  cacheHitRate: number;
  memoryUsage: number;
}

export interface SystemMetrics {
  activeUsers: number;
  totalSessions: number;
  errorCount: number;
  cachePerformance: {
    hits: number;
    misses: number;
    efficiency: number;
  };
}
