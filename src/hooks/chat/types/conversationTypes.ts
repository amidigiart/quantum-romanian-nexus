
export interface ConversationContext {
  recentMessages: string[];
  topics: string[];
  userPreferences: string[];
  conversationFlow: Array<{ question: string; response: string; timestamp: Date }>;
  userExpertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredResponseStyle: 'detailed' | 'concise' | 'technical';
}

export interface EnhancedResponseMetrics {
  responseTime: number;
  cacheHit: boolean;
  qualityScore: number;
  contextRelevance: number;
  userSatisfactionPrediction: number;
}

export interface NewsContext {
  news: Array<{ id: string; title: string; summary: string; created_at: string }>;
  lastUpdated: Date | null;
}
