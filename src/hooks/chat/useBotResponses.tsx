
import { useNewsContextManager } from './useNewsContextManager';
import { useCacheManager } from './useCacheManager';
import { useBotResponsesCore } from './useBotResponsesCore';

export const useBotResponses = () => {
  const {
    newsContext,
    lastUpdated,
    updateNewsContext,
    getNewsResponse
  } = useNewsContextManager();

  const {
    isWarming,
    warmFrequentlyAskedQuestions,
    clearResponseCache,
    getCacheStats,
    getAdvancedCacheMetrics,
    getCacheOptimizationStats
  } = useCacheManager();

  const {
    generateBotResponse,
    assessResponse,
    responseMetrics
  } = useBotResponsesCore();

  const generateBotResponseWithNews = async (message: string, conversationId?: string): Promise<string> => {
    // Check for news-based responses first
    const newsResponse = getNewsResponse(message);
    if (newsResponse) {
      return newsResponse;
    }

    // Fall back to regular bot response
    return generateBotResponse(message, conversationId);
  };

  return {
    generateBotResponse: generateBotResponseWithNews,
    getNewsResponse,
    updateNewsContext,
    warmFrequentlyAskedQuestions,
    clearResponseCache,
    getCacheStats,
    getAdvancedCacheMetrics,
    isWarming,
    assessResponse,
    newsContext,
    lastUpdated,
    getCacheOptimizationStats
  };
};
