
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
