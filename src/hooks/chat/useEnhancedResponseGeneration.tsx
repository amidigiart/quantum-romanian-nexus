
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useConversationContext } from './useConversationContext';
import { EnhancedResponseMetrics } from './types/conversationTypes';
import { assessAdvancedResponseQuality, predictUserSatisfaction } from './utils/responseQuality';
import { generateIntelligentFallback, enhanceWithAdvancedContext } from './utils/fallbackResponses';
import { cacheHitOptimizer } from '@/services/cache/cacheHitOptimizer';

export const useEnhancedResponseGeneration = () => {
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
    
    // Use optimized cache retrieval
    const cachedResponse = await cacheHitOptimizer.optimizedGet<string>(
      `legacy-${message}`, // fallback key
      message,
      conversationContext,
      user?.id,
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
      
      // Use optimized cache storage with quality-based priority
      const priority = quality.relevance > 0.85 ? 'high' : 'medium';
      await cacheHitOptimizer.optimizedSet(
        `legacy-response-${message}`,
        response,
        message,
        conversationContext,
        user?.id,
        undefined, // Let optimizer calculate optimal TTL
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

  const generateNewsEnhancedResponse = async (newsResponse: string): Promise<string> => {
    const startTime = performance.now();
    const enhancedNewsResponse = await enhanceWithAdvancedContext(newsResponse, conversationContext);
    
    const metrics: EnhancedResponseMetrics = {
      responseTime: performance.now() - startTime,
      cacheHit: false,
      qualityScore: 0.85,
      contextRelevance: 0.9,
      userSatisfactionPrediction: 0.82
    };
    setResponseMetrics(metrics);
    
    return enhancedNewsResponse;
  };

  return {
    generateEnhancedBotResponse,
    generateNewsEnhancedResponse,
    isStreaming,
    responseMetrics
  };
};
