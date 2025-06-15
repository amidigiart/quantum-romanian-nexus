
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cachePerformanceMonitor } from '@/services/cachePerformanceMonitor';
import { cacheHitOptimizer } from '@/services/cache/cacheHitOptimizer';
import { useConversationContext } from './useConversationContext';
import { EnhancedResponseMetrics } from './types/conversationTypes';
import { assessResponseQuality } from './utils/responseQuality';
import { generateIntelligentFallback } from './utils/fallbackResponses';

export const useBotResponsesCore = () => {
  const { user } = useAuth();
  const { conversationContext } = useConversationContext();
  const [responseMetrics, setResponseMetrics] = useState<EnhancedResponseMetrics | null>(null);

  const generateBotResponse = async (message: string, conversationId?: string): Promise<string> => {
    const startTime = performance.now();
    
    // Use optimized cache retrieval
    const cachedResponse = await cacheHitOptimizer.optimizedGet<string>(
      message.toLowerCase().trim(),
      message,
      { userExpertiseLevel: 'general', preferredResponseStyle: 'concise', topics: [], userPreferences: [] },
      user?.id,
      ['chat-response']
    );
    
    if (cachedResponse) {
      cachePerformanceMonitor.recordCacheHit(message, 'response', performance.now() - startTime);
      return cachedResponse;
    }

    try {
      // Generate response using edge function
      const { data, error } = await supabase.functions.invoke('cached-bot-response', {
        body: { message, userId: user?.id }
      });

      if (error) throw error;

      const response = data.response;
      
      // Use optimized cache storage
      await cacheHitOptimizer.optimizedSet(
        message.toLowerCase().trim(),
        response,
        message,
        { userExpertiseLevel: 'general', preferredResponseStyle: 'concise', topics: [], userPreferences: [] },
        user?.id,
        10 * 60 * 1000, // 10 minutes
        ['chat-response'],
        'medium'
      );

      cachePerformanceMonitor.recordCacheHit(message, 'response', performance.now() - startTime);
      return response;
    } catch (error) {
      console.error("Failed to generate bot response:", error);
      cachePerformanceMonitor.recordCacheMiss(message, 'response', performance.now() - startTime);
      return generateIntelligentFallback(message, conversationContext);
    }
  };

  const assessResponse = async (message: string, response: string) => {
    return assessResponseQuality(message, response, conversationContext);
  };

  return {
    generateBotResponse,
    assessResponse,
    responseMetrics
  };
};
