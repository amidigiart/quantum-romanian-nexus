
import { UserBehaviorMetrics } from '@/types/analytics';

export class BehaviorTracker {
  private userBehavior: UserBehaviorMetrics;
  private sessionStartTime: number;

  constructor() {
    this.sessionStartTime = Date.now();
    this.userBehavior = {
      pageViews: 0,
      sessionDuration: 0,
      clickEvents: 0,
      interactions: {},
      conversationCount: 0,
      messageCount: 0
    };
  }

  updateBehavior(eventType: string, data: any): void {
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

  getMetrics(): UserBehaviorMetrics {
    return {
      ...this.userBehavior,
      sessionDuration: Date.now() - this.sessionStartTime
    };
  }

  reset(): void {
    this.userBehavior = {
      pageViews: 0,
      sessionDuration: 0,
      clickEvents: 0,
      interactions: {},
      conversationCount: 0,
      messageCount: 0
    };
    this.sessionStartTime = Date.now();
  }
}
