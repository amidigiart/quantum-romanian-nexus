
import { useQuantumNews } from '@/hooks/useQuantumNews';
import { responseCacheService } from '@/services/responseCacheService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useBotResponses = () => {
  const { getNewsResponse, newsContext, lastUpdated } = useQuantumNews();
  const { user } = useAuth();

  const generateBotResponse = async (message: string, conversationId?: string): Promise<string> => {
    // Check local cache first for immediate response
    const cachedResponse = responseCacheService.getCachedResponse(message);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      // First check if the query relates to recent news (local processing for real-time data)
      const newsResponse = getNewsResponse(message);
      if (newsResponse) {
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
      
      // Cache the response locally if it's not news-based
      if (!newsResponse) {
        responseCacheService.setCachedResponse(message, response);
      }

      return response;
    } catch (error) {
      console.error('Error calling bot response edge function:', error);
      return generateLocalFallback(message);
    }
  };

  const generateCachedBotResponse = async (message: string): Promise<string> => {
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

      return data.response;
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
  };

  const getCacheStats = () => {
    return responseCacheService.getCacheStats();
  };

  return {
    generateBotResponse,
    generateCachedBotResponse,
    newsContext,
    lastUpdated,
    clearResponseCache,
    getCacheStats
  };
};
