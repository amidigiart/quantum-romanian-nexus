import { useQuantumNews } from '@/hooks/useQuantumNews';
import { unifiedCacheManager } from '@/services/cache/unifiedCacheManager';
import { cacheWarmingService } from '@/services/cache/cacheWarmingService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useBotResponses = () => {
  const { getNewsResponse, newsContext, lastUpdated } = useQuantumNews();
  const { user } = useAuth();

  const generateBotResponse = async (message: string, conversationId?: string): Promise<string> => {
    // Use unified cache with intelligent key generation
    const cacheKey = `bot-response:${message.toLowerCase().substring(0, 100)}`;
    const cachedResponse = await unifiedCacheManager.get<string>(
      cacheKey, 
      ['chat-response', 'bot-generated']
    );
    
    if (cachedResponse) {
      // Prefetch related content in background
      cacheWarmingService.prefetchRelatedContent(message);
      return cachedResponse;
    }

    try {
      // Check for news responses first
      const newsResponse = getNewsResponse(message);
      if (newsResponse) {
        await unifiedCacheManager.set(
          cacheKey, 
          newsResponse, 
          2 * 60 * 1000, // 2 minutes TTL for news
          ['chat-response', 'news', 'time-sensitive'],
          'high'
        );
        return newsResponse;
      }

      // Use edge function for bot response generation
      const { data, error } = await supabase.functions.invoke('generate-bot-response', {
        body: { message, conversationId, userId: user?.id }
      });

      if (error) {
        console.error('Edge function error:', error);
        return generateLocalFallback(message);
      }

      const response = data.response;
      
      // Intelligent caching based on query type
      const isAlgorithmQuery = message.toLowerCase().includes('algoritm') || 
                             message.toLowerCase().includes('quantum');
      const priority = isAlgorithmQuery ? 'high' : 'medium';
      const ttl = isAlgorithmQuery ? 15 * 60 * 1000 : 10 * 60 * 1000;
      const tags = ['chat-response', 'bot-generated'];
      
      if (isAlgorithmQuery) tags.push('algorithms');
      
      await unifiedCacheManager.set(cacheKey, response, ttl, tags, priority);

      // Prefetch related content
      cacheWarmingService.prefetchRelatedContent(message);

      return response;
    } catch (error) {
      console.error('Error calling bot response edge function:', error);
      return generateLocalFallback(message);
    }
  };

  const generateCachedBotResponse = async (message: string): Promise<string> => {
    const cacheKey = `faq-response:${message}`;
    const cachedResponse = await unifiedCacheManager.get<string>(
      cacheKey,
      ['chat-response', 'faq', 'static']
    );

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const { data, error } = await supabase.functions.invoke('cached-bot-response', {
        body: { message, userId: user?.id }
      });

      if (error) {
        console.error('Cached edge function error:', error);
        return generateLocalFallback(message);
      }

      const response = data.response;
      
      // Cache FAQ responses with longer TTL
      await unifiedCacheManager.set(
        cacheKey,
        response,
        30 * 60 * 1000, // 30 minutes TTL
        ['chat-response', 'faq', 'static'],
        'high'
      );

      return response;
    } catch (error) {
      console.error('Error calling cached bot response edge function:', error);
      return generateLocalFallback(message);
    }
  };

  const generateLocalFallback = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('algoritm') || lowerMessage.includes('grover') || lowerMessage.includes('shor')) {
      return `Am implementat 10 algoritmi cuantici avansați: Grover pentru căutare (O(√N)), Shor pentru factorizare (O((log N)³)), QAOA pentru optimizare, VQE pentru energie, QML pentru învățare automată, QRNG pentru generare aleatoare, QFT pentru transformate, QEC pentru corecția erorilor, simulare cuantică, și optimizare de portofoliu.\n\nCare vă interesează în mod specific?`;
    }
    
    return `Înțeleg întrebarea dvs. despre computarea cuantică avansată. Sistemul nostru implementează 10 funcții cuantice hibride principale.\n\nCu ce anume vă pot ajuta în mod specific?`;
  };

  const clearResponseCache = () => {
    unifiedCacheManager.clearAll();
  };

  const getCacheStats = () => {
    const detailedMetrics = unifiedCacheManager.getMetrics();
    // Return compatible format for existing UI
    return {
      totalQueries: detailedMetrics.totalSize,
      cacheHits: Math.round(detailedMetrics.hitRate),
      cacheMisses: Math.round(detailedMetrics.missRate),
      hitRate: detailedMetrics.hitRate
    };
  };

  const getAdvancedCacheMetrics = () => {
    return unifiedCacheManager.getMetrics();
  };

  const warmFrequentlyAskedQuestions = async () => {
    await cacheWarmingService.warmFrequentlyAskedQuestions();
  };

  const performStartupWarming = async () => {
    await cacheWarmingService.performStartupWarming();
  };

  const warmUserContent = async (preferences: string[] = [], expertiseLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate') => {
    await Promise.all([
      cacheWarmingService.warmUserContextualContent(preferences),
      cacheWarmingService.warmExpertiseLevelContent(expertiseLevel)
    ]);
  };

  return {
    generateBotResponse,
    generateCachedBotResponse,
    newsContext,
    lastUpdated,
    clearResponseCache,
    getCacheStats,
    getAdvancedCacheMetrics,
    warmFrequentlyAskedQuestions,
    performStartupWarming,
    warmUserContent
  };
};
