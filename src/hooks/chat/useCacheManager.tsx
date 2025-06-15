
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { responseCacheService } from '@/services/responseCacheService';
import { advancedCacheService } from '@/services/advancedCacheService';
import { cacheHitOptimizer } from '@/services/cache/cacheHitOptimizer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useCacheManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isWarming, setIsWarming] = useState(false);

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

  const getCacheOptimizationStats = () => {
    return cacheHitOptimizer.getOptimizationMetrics();
  };

  return {
    isWarming,
    warmFrequentlyAskedQuestions,
    clearResponseCache,
    getCacheStats,
    getAdvancedCacheMetrics,
    getCacheOptimizationStats
  };
};
