
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analyticsService';

interface UseAnalyticsOptions {
  trackClicks?: boolean;
  trackPageViews?: boolean;
  trackErrors?: boolean;
  component?: string;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const { user } = useAuth();
  const componentRef = useRef<HTMLDivElement>(null);
  const {
    trackClicks = true,
    trackPageViews = true,
    trackErrors = true,
    component
  } = options;

  // Track page views
  useEffect(() => {
    if (trackPageViews) {
      analyticsService.trackPageView();
    }
  }, [trackPageViews]);

  // Track clicks
  useEffect(() => {
    if (!trackClicks || !componentRef.current) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const elementType = target.tagName.toLowerCase();
      const elementText = target.textContent?.slice(0, 50) || '';
      const elementId = target.id || '';
      const elementClass = target.className || '';

      analyticsService.trackClick(component || 'unknown', 'click', {
        element_type: elementType,
        element_text: elementText,
        element_id: elementId,
        element_class: elementClass,
        position: {
          x: event.clientX,
          y: event.clientY
        }
      });
    };

    const element = componentRef.current;
    element.addEventListener('click', handleClick);

    return () => {
      element.removeEventListener('click', handleClick);
    };
  }, [trackClicks, component]);

  // Track errors
  useEffect(() => {
    if (!trackErrors) return;

    const handleError = (event: ErrorEvent) => {
      analyticsService.trackError(new Error(event.message), component);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analyticsService.trackError(
        new Error(event.reason?.toString() || 'Unhandled promise rejection'),
        component
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackErrors, component]);

  const trackEvent = (eventType: string, data: any = {}) => {
    analyticsService.trackEvent(eventType, {
      ...data,
      component
    }, user?.id);
  };

  const trackUserAction = (action: string, details: any = {}) => {
    trackEvent('user_action', {
      action,
      ...details
    });
  };

  const trackPerformance = (operation: string, duration: number, details: any = {}) => {
    trackEvent('performance_metric', {
      operation,
      duration,
      ...details
    });
  };

  const trackCacheOperation = (operation: 'hit' | 'miss' | 'set' | 'clear', key?: string) => {
    analyticsService.trackCacheOperation(operation, key);
  };

  return {
    componentRef,
    trackEvent,
    trackUserAction,
    trackPerformance,
    trackCacheOperation,
    getSessionMetrics: () => analyticsService.getSessionMetrics(),
    getPerformanceMetrics: () => analyticsService.getPerformanceMetrics()
  };
};
