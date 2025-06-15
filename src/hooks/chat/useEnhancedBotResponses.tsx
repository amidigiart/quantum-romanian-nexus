
import { useQuantumNews } from '@/hooks/useQuantumNews';
import { advancedCacheService } from '@/services/advancedCacheService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useConversationContext } from './useConversationContext';
import { EnhancedResponseMetrics } from './types/conversationTypes';
import { assessAdvancedResponseQuality, predictUserSatisfaction } from './utils/responseQuality';
import { generateAdvancedCacheKey } from './utils/cacheUtils';
import { generateIntelligentFallback, enhanceWithAdvancedContext, generateExpertiseLevelOverview, generateContextualAlgorithmsGuide } from './utils/fallbackResponses';

export const useEnhancedBotResponses = () => {
  const { getNewsResponse, newsContext, lastUpdated } = useQuantumNews();
  const { user } = useAuth();
  const { conversationContext, updateConversationContext } = useConversationContext();
  const [isStreaming, setIsStreaming] = useState(false);
  const [responseMetrics, setResponseMetrics] = useState<EnhancedResponseMetrics | null>(null);

  const generateEnhancedBotResponse = async (
    message: string, 
    conversationId?: string,
    onStream?: (chunk: string) => void
  ): Promise<string> => {
    const startTime = performance.now();
    
    // Enhanced cache key with user context
    const contextKey = generateAdvancedCacheKey(message, conversationContext);
    const cachedResponse = await advancedCacheService.get<string>(
      contextKey, 
      ['chat-response', 'enhanced', 'contextual', `expertise-${conversationContext.userExpertiseLevel}`]
    );
    
    if (cachedResponse) {
      const metrics: EnhancedResponseMetrics = {
        responseTime: performance.now() - startTime,
        cacheHit: true,
        qualityScore: 0.9,
        contextRelevance: 0.95,
        userSatisfactionPrediction: 0.88
      };
      setResponseMetrics(metrics);
      return cachedResponse;
    }

    try {
      // Check for news-based responses with context enhancement
      const newsResponse = getNewsResponse(message);
      if (newsResponse) {
        const enhancedNewsResponse = await enhanceWithAdvancedContext(newsResponse, conversationContext);
        await advancedCacheService.set(
          contextKey, 
          enhancedNewsResponse, 
          3 * 60 * 1000,
          ['chat-response', 'news', 'enhanced', `expertise-${conversationContext.userExpertiseLevel}`],
          'high'
        );
        updateConversationContext(message, enhancedNewsResponse);
        
        const metrics: EnhancedResponseMetrics = {
          responseTime: performance.now() - startTime,
          cacheHit: false,
          qualityScore: 0.85,
          contextRelevance: 0.9,
          userSatisfactionPrediction: 0.82
        };
        setResponseMetrics(metrics);
        return enhancedNewsResponse;
      }

      // Generate contextually aware response
      setIsStreaming(true);
      const { data, error } = await supabase.functions.invoke('enhanced-bot-response', {
        body: {
          message,
          conversationId,
          userId: user?.id,
          context: conversationContext,
          streamingEnabled: !!onStream,
          enhancedContext: true
        }
      });

      if (error) {
        console.error('Enhanced edge function error:', error);
        const fallbackResponse = generateIntelligentFallback(message, conversationContext);
        const metrics: EnhancedResponseMetrics = {
          responseTime: performance.now() - startTime,
          cacheHit: false,
          qualityScore: 0.6,
          contextRelevance: 0.7,
          userSatisfactionPrediction: 0.65
        };
        setResponseMetrics(metrics);
        return fallbackResponse;
      }

      const response = data.response;
      const quality = assessAdvancedResponseQuality(message, response, conversationContext);
      
      // Enhanced caching with quality-based TTL
      const ttl = quality.relevance > 0.9 ? 20 * 60 * 1000 : 12 * 60 * 1000;
      const priority = quality.relevance > 0.85 ? 'high' : 'medium';
      
      await advancedCacheService.set(
        contextKey,
        response,
        ttl,
        ['chat-response', 'enhanced', `quality-${Math.round(quality.relevance * 10)}`, `expertise-${conversationContext.userExpertiseLevel}`],
        priority
      );

      updateConversationContext(message, response);
      setIsStreaming(false);
      
      const metrics: EnhancedResponseMetrics = {
        responseTime: performance.now() - startTime,
        cacheHit: false,
        qualityScore: (quality.relevance + quality.completeness + quality.accuracy + quality.engagement + quality.contextualFit) / 5,
        contextRelevance: quality.contextualFit,
        userSatisfactionPrediction: predictUserSatisfaction(quality, conversationContext)
      };
      setResponseMetrics(metrics);
      
      return response;
    } catch (error) {
      console.error('Error in enhanced bot response:', error);
      setIsStreaming(false);
      const fallbackResponse = generateIntelligentFallback(message, conversationContext);
      
      const metrics: EnhancedResponseMetrics = {
        responseTime: performance.now() - startTime,
        cacheHit: false,
        qualityScore: 0.5,
        contextRelevance: 0.6,
        userSatisfactionPrediction: 0.55
      };
      setResponseMetrics(metrics);
      return fallbackResponse;
    }
  };

  const generatePersonalizedResponse = async (message: string): Promise<string> => {
    // Get user preferences from database and context
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    const personalizedContext = {
      ...conversationContext,
      userPreferences: preferences ? [
        preferences.quantum_algorithm_preference,
        preferences.ml_model_preference,
        preferences.theme_preference
      ].filter(Boolean) : conversationContext.userPreferences
    };

    // Update context temporarily for this request
    const response = await generateEnhancedBotResponse(message);
    return response;
  };

  const warmAdvancedCache = async () => {
    const expertiseLevels = ['beginner', 'intermediate', 'advanced'];
    const cacheStrategies = expertiseLevels.flatMap(level => [
      {
        key: `enhanced-quantum-overview-${level}`,
        dataLoader: async () => generateExpertiseLevelOverview(level as any),
        ttl: 25 * 60 * 1000,
        tags: ['chat-response', 'enhanced', 'overview', `expertise-${level}`],
        priority: 'high' as const
      },
      {
        key: `contextual-algorithms-guide-${level}`,
        dataLoader: async () => generateContextualAlgorithmsGuide(level as any),
        ttl: 30 * 60 * 1000,
        tags: ['chat-response', 'enhanced', 'algorithms', `expertise-${level}`],
        priority: 'high' as const
      }
    ]);

    await advancedCacheService.warmCache(cacheStrategies);
  };

  return {
    generateEnhancedBotResponse,
    generatePersonalizedResponse,
    conversationContext,
    isStreaming,
    warmAdvancedCache,
    newsContext,
    lastUpdated,
    responseMetrics
  };
};
