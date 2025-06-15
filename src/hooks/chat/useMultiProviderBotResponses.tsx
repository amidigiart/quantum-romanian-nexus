
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuantumNews } from '@/hooks/useQuantumNews';
import { advancedCacheService } from '@/services/advancedCacheService';

export interface AIProviderConfig {
  provider: string;
  model: string;
}

export const useMultiProviderBotResponses = () => {
  const { user } = useAuth();
  const { getNewsResponse, newsContext } = useQuantumNews();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateResponseWithProvider = useCallback(async (
    message: string,
    config: AIProviderConfig,
    conversationId?: string
  ): Promise<string> => {
    setIsGenerating(true);
    
    try {
      // Check cache first
      const cacheKey = `multi-provider:${config.provider}:${config.model}:${message.substring(0, 100)}`;
      const cachedResponse = await advancedCacheService.get<string>(
        cacheKey,
        ['chat-response', 'multi-provider', config.provider]
      );

      if (cachedResponse) {
        setIsGenerating(false);
        return cachedResponse;
      }

      // Check for news responses first (local processing)
      const newsResponse = getNewsResponse(message);
      if (newsResponse && config.provider !== 'perplexity') {
        setIsGenerating(false);
        return newsResponse;
      }

      // Call the appropriate edge function based on provider
      const { data, error } = await supabase.functions.invoke('multi-provider-chat', {
        body: {
          message,
          provider: config.provider,
          model: config.model,
          conversationId,
          userId: user?.id
        }
      });

      if (error) {
        console.error(`Error with ${config.provider}:`, error);
        return generateFallbackResponse(message, config);
      }

      const response = data.response;
      
      // Cache the response
      await advancedCacheService.set(
        cacheKey,
        response,
        10 * 60 * 1000, // 10 minutes
        ['chat-response', 'multi-provider', config.provider],
        'medium'
      );

      setIsGenerating(false);
      return response;
    } catch (error) {
      console.error('Multi-provider response error:', error);
      setIsGenerating(false);
      return generateFallbackResponse(message, config);
    }
  }, [user, getNewsResponse]);

  const generateFallbackResponse = (message: string, config: AIProviderConfig): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('algoritm') || lowerMessage.includes('quantum')) {
      return `Sistemul cuantic implementează 10 algoritmi avansați folosind ${config.provider} ${config.model}. Grover pentru căutare O(√N), Shor pentru factorizare, QAOA pentru optimizare, și multe altele.\n\nCu ce algoritm specific vă pot ajuta?`;
    }
    
    return `Înțeleg întrebarea dvs. despre computarea cuantică. Sistemul folosește ${config.provider} cu modelul ${config.model} pentru răspunsuri de înaltă calitate.\n\nCu ce anume vă pot ajuta?`;
  };

  return {
    generateResponseWithProvider,
    isGenerating,
    newsContext
  };
};
