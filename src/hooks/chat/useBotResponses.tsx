
import { useState, useCallback } from 'react';
import { useQuantumNews } from '@/hooks/useQuantumNews';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { responseCacheService } from '@/services/responseCacheService';
import { cachePerformanceMonitor } from '@/services/cachePerformanceMonitor';
import { useConversationContext } from './useConversationContext';
import {
  ConversationContext,
  EnhancedResponseMetrics,
  NewsContext
} from './types/conversationTypes';
import { assessResponseQuality } from './utils/responseQuality';
import { generateIntelligentFallback } from './utils/fallbackResponses';
import { advancedCacheService } from '@/services/advancedCacheService';
import { cacheHitOptimizer } from '@/services/cache/cacheHitOptimizer';
import { optimizedCacheWarmingService } from '@/services/cache/optimizedCacheWarmingService';

export const useBotResponses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isWarming, setIsWarming] = useState(false);
  const [newsContext, setNewsContext] = useState<NewsContext>({
    news: [],
    lastUpdated: null,
  });
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { conversationContext } = useConversationContext();
  const [responseMetrics, setResponseMetrics] = useState<EnhancedResponseMetrics | null>(null);

  const updateNewsContext = useCallback(async () => {
    try {
      // Since quantum_news table doesn't exist, let's create mock data for now
      // In a real implementation, you would create this table or use a different approach
      const mockNewsData = [
        {
          id: '1',
          title: 'Quantum Computing Breakthrough',
          summary: 'New quantum algorithm shows 1000x speedup',
          created_at: new Date().toISOString()
        },
        {
          id: '2', 
          title: 'IBM Announces New Quantum Processor',
          summary: 'IBM reveals 1000-qubit quantum processor',
          created_at: new Date().toISOString()
        }
      ];

      setNewsContext({
        news: mockNewsData,
        lastUpdated: new Date(),
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error updating news context:", error);
    }
  }, []);

  const getNewsResponse = (message: string): string | null => {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('știri quantum') || normalizedMessage.includes('ultimele noutăți')) {
      if (!newsContext.news || newsContext.news.length === 0) {
        return "Nu există noutăți disponibile momentan.";
      }

      const newsItems = newsContext.news.map((item, index) =>
        `${index + 1}. ${item.title} - ${item.summary}`
      ).join('\n');

      return `Ultimele noutăți quantum:\n${newsItems}\nData actualizării: ${lastUpdated?.toLocaleDateString()}`;
    }

    return null;
  };

  const warmFrequentlyAskedQuestions = async () => {
    setIsWarming(true);
    try {
      const commonQuestions = [
        "Ce este quantum computing?",
        "Cum funcționează un computer cuantic?",
        "Care sunt avantajele quantum computing?",
        "Care sunt dezavantajele quantum computing?",
        "Care este viitorul quantum computing?"
      ];

      for (const question of commonQuestions) {
        // Invoke the edge function directly to cache the responses
        await supabase.functions.invoke('cached-bot-response', {
          body: { message: question, userId: user?.id }
        });
      }
      toast({
        title: "Cache preîncărcat",
        description: "Întrebările frecvente au fost preîncărcate în cache.",
      });
    } catch (error) {
      console.error("Failed to warm cache:", error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut preîncărca întrebările frecvente.",
        variant: "destructive"
      });
    } finally {
      setIsWarming(false);
    }
  };

  const clearResponseCache = () => {
    responseCacheService.clearCache();
    toast({
      title: "Cache șters",
      description: "Cache-ul de răspunsuri a fost golit cu succes.",
    });
  };

  const getCacheStats = () => {
    return responseCacheService.getCacheStats();
  };

  const getAdvancedCacheMetrics = () => {
    return advancedCacheService.getMetrics();
  };

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
      if (message.toLowerCase().includes('știri quantum') || message.toLowerCase().includes('ultimele noutăți')) {
        return getNewsResponse(message) || "Nu există noutăți disponibile momentan.";
      }

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

  const getCacheOptimizationStats = () => {
    return cacheHitOptimizer.getOptimizationMetrics();
  };

  return {
    generateBotResponse,
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
