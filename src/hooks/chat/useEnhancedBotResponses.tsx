
import { useQuantumNews } from '@/hooks/useQuantumNews';
import { useConversationContext } from './useConversationContext';
import { useEnhancedResponseGeneration } from './useEnhancedResponseGeneration';
import { usePersonalizedResponses } from './usePersonalizedResponses';
import { useAdvancedCacheWarming } from './useAdvancedCacheWarming';
import { cacheHitOptimizer } from '@/services/cache/cacheHitOptimizer';
import { useAuth } from '@/hooks/useAuth';

export const useEnhancedBotResponses = () => {
  const { getNewsResponse, newsContext, lastUpdated } = useQuantumNews();
  const { user } = useAuth();
  const { conversationContext, updateConversationContext } = useConversationContext();
  const { 
    generateEnhancedBotResponse, 
    generateNewsEnhancedResponse, 
    isStreaming, 
    responseMetrics 
  } = useEnhancedResponseGeneration();
  const { generatePersonalizedResponse } = usePersonalizedResponses();
  const { warmAdvancedCache, getCacheOptimizationMetrics } = useAdvancedCacheWarming();

  const generateEnhancedBotResponseWithNews = async (
    message: string, 
    conversationId?: string,
    onStream?: (chunk: string) => void
  ): Promise<string> => {
    // Check for news-based responses with context enhancement
    const newsResponse = getNewsResponse(message);
    if (newsResponse) {
      const enhancedNewsResponse = await generateNewsEnhancedResponse(newsResponse);
      
      // Use optimized cache storage
      await cacheHitOptimizer.optimizedSet(
        `legacy-news-${message}`,
        enhancedNewsResponse,
        message,
        conversationContext,
        user?.id,
        3 * 60 * 1000,
        ['chat-response', 'news', 'enhanced', `expertise-${conversationContext.userExpertiseLevel}`],
        'high'
      );
      
      updateConversationContext(message, enhancedNewsResponse);
      return enhancedNewsResponse;
    }

    // Fall back to regular enhanced response
    return generateEnhancedBotResponse(message, conversationId, onStream);
  };

  return {
    generateEnhancedBotResponse: generateEnhancedBotResponseWithNews,
    generatePersonalizedResponse,
    conversationContext,
    isStreaming,
    warmAdvancedCache,
    newsContext,
    lastUpdated,
    responseMetrics,
    getCacheOptimizationMetrics
  };
};
