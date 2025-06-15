
import { AnalyticsEvent } from '@/types/analytics';

export class EventStorage {
  private events: AnalyticsEvent[] = [];

  addEvent(event: AnalyticsEvent): void {
    this.events.push(event);
    this.persistEvents();
  }

  getEvents(): AnalyticsEvent[] {
    return this.events;
  }

  getRecentEvents(limit: number = 100): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByType(eventType: string, limit: number = 50): AnalyticsEvent[] {
    return this.events
      .filter(e => e.event_type === eventType)
      .slice(-limit);
  }

  clearEvents(): void {
    this.events = [];
    this.clearPersistedData();
  }

  private persistEvents(): void {
    try {
      const recentEvents = this.events.slice(-500); // Keep last 500 events
      sessionStorage.setItem('analytics_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to persist analytics events:', error);
    }
  }

  loadPersistedEvents(): void {
    try {
      const storedEvents = sessionStorage.getItem('analytics_events');
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }
    } catch (error) {
      console.error('Failed to load persisted analytics:', error);
    }
  }

  private clearPersistedData(): void {
    sessionStorage.removeItem('analytics_events');
  }
}
