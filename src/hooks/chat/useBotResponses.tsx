import { useQuantumNews } from '@/hooks/useQuantumNews';
import { responseCacheService } from '@/services/responseCacheService';
import { advancedCacheService } from '@/services/advancedCacheService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useBotResponses = () => {
  const { getNewsResponse, newsContext, lastUpdated } = useQuantumNews();
  const { user } = useAuth();

  const generateBotResponse = async (message: string, conversationId?: string): Promise<string> => {
    // Check advanced cache first (multi-level caching)
    const cacheKey = `bot-response:${message}`;
    const cachedResponse = await advancedCacheService.get<string>(
      cacheKey, 
      ['chat-response', 'bot-generated']
    );
    
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      // First check if the query relates to recent news (local processing for real-time data)
      const newsResponse = getNewsResponse(message);
      if (newsResponse) {
        // Cache news responses with shorter TTL since they're time-sensitive
        await advancedCacheService.set(
          cacheKey, 
          newsResponse, 
          2 * 60 * 1000, // 2 minutes TTL
          ['chat-response', 'news', 'time-sensitive'],
          'high'
        );
        return newsResponse;
      }

      // Use edge function for bot response generation
      const { data, error } = await supabase.functions.invoke('generate-bot-response', {
        body: {
          message,
          conversationId,
          userId: user?.id
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        // Fallback to local generation
        return generateLocalFallback(message);
      }

      const response = data.response;
      
      // Cache the response in advanced cache with appropriate tags and priority
      const isAlgorithmQuery = message.toLowerCase().includes('algoritm') || 
                             message.toLowerCase().includes('quantum');
      const priority = isAlgorithmQuery ? 'high' : 'medium';
      const tags = ['chat-response', 'bot-generated'];
      
      if (isAlgorithmQuery) tags.push('algorithms');
      
      await advancedCacheService.set(
        cacheKey,
        response,
        10 * 60 * 1000, // 10 minutes TTL
        tags,
        priority
      );

      return response;
    } catch (error) {
      console.error('Error calling bot response edge function:', error);
      return generateLocalFallback(message);
    }
  };

  const generateCachedBotResponse = async (message: string): Promise<string> => {
    // Use advanced cache for FAQ responses with longer TTL
    const cacheKey = `faq-response:${message}`;
    const cachedResponse = await advancedCacheService.get<string>(
      cacheKey,
      ['chat-response', 'faq', 'static']
    );

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      // Use cached edge function for frequently asked questions
      const { data, error } = await supabase.functions.invoke('cached-bot-response', {
        body: {
          message,
          userId: user?.id
        }
      });

      if (error) {
        console.error('Cached edge function error:', error);
        return generateLocalFallback(message);
      }

      const response = data.response;
      
      // Cache FAQ responses with longer TTL since they're static
      await advancedCacheService.set(
        cacheKey,
        response,
        30 * 60 * 1000, // 30 minutes TTL
        ['chat-response', 'faq', 'static'],
        'high' // High priority for FAQ
      );

      return response;
    } catch (error) {
      console.error('Error calling cached bot response edge function:', error);
      return generateLocalFallback(message);
    }
  };

  const generateLocalFallback = (message: string): string => {
    // Simplified local fallback for when edge functions fail
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('algoritm') || lowerMessage.includes('grover') || lowerMessage.includes('shor')) {
      return `Am implementat 10 algoritmi cuantici avansați: Grover pentru căutare (O(√N)), Shor pentru factorizare (O((log N)³)), QAOA pentru optimizare, VQE pentru energie, QML pentru învățare automată, QRNG pentru generare aleatoare, QFT pentru transformate, QEC pentru corecția erorilor, simulare cuantică, și optimizare de portofoliu.\n\nCare vă interesează în mod specific?`;
    }
    
    return `Înțeleg întrebarea dvs. despre computarea cuantică avansată. Sistemul nostru implementează 10 funcții cuantice hibride principale.\n\nCu ce anume vă pot ajuta în mod specific?`;
  };

  const clearResponseCache = () => {
    responseCacheService.clearCache();
    // Also clear relevant entries from advanced cache
    advancedCacheService.invalidateByTags(['chat-response']);
  };

  const getCacheStats = () => {
    return responseCacheService.getCacheStats();
  };

  const getAdvancedCacheMetrics = () => {
    return advancedCacheService.getMetrics();
  };

  const warmFrequentlyAskedQuestions = async () => {
    const commonQuestions = [
      'Ce este quantum computing?',
      'Cum funcționează un computer cuantic?',
      'Care sunt avantajele quantum computing?',
      'Ce algoritmi cuantici implementați?'
    ];

    const warmingStrategies = commonQuestions.map(question => ({
      key: `faq-response:${question}`,
      dataLoader: () => generateCachedBotResponse(question),
      ttl: 30 * 60 * 1000, // 30 minutes
      tags: ['chat-response', 'faq', 'static'],
      priority: 'high' as const
    }));

    await advancedCacheService.warmCache(warmingStrategies);
  };

  return {
    generateBotResponse,
    generateCachedBotResponse,
    newsContext,
    lastUpdated,
    clearResponseCache,
    getCacheStats,
    getAdvancedCacheMetrics,
    warmFrequentlyAskedQuestions
  };
};
