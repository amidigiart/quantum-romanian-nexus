
import { useState, useEffect } from 'react';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cacheHitOptimizer } from '@/services/cache/cacheHitOptimizer';

export const useCacheManagerLogic = () => {
  const { 
    clearResponseCache, 
    getCacheStats, 
    getAdvancedCacheMetrics,
    warmFrequentlyAskedQuestions 
  } = useBotResponses();
  const { toast } = useToast();
  const { trackUserAction, trackEvent } = useAnalytics({
    component: 'CacheManager'
  });
  
  const stats = getCacheStats();
  const advancedMetrics = getAdvancedCacheMetrics();

  const [optimizationMetrics, setOptimizationMetrics] = useState({
    hitRate: 0,
    totalHits: 0,
    totalMisses: 0,
    uniqueHitPatterns: 0,
    topMissedQueries: []
  });

  const handleClearCache = () => {
    const startTime = performance.now();
    clearResponseCache();
    const duration = performance.now() - startTime;
    
    // Track analytics
    trackUserAction('cache_cleared', {
      previous_hit_rate: stats.hitRate,
      previous_total_queries: stats.totalQueries,
      operation_duration: duration
    });
    
    trackEvent('cache_operation', {
      operation: 'clear_all',
      duration,
      entries_cleared: stats.totalQueries
    });
    
    toast({
      title: "Cache șters",
      description: "Cache-ul de răspunsuri a fost golit cu succes.",
    });
  };

  const handleWarmFAQ = async () => {
    const startTime = performance.now();
    
    try {
      await warmFrequentlyAskedQuestions();
      const duration = performance.now() - startTime;
      
      trackEvent('cache_operation', {
        operation: 'warm_faq',
        duration,
        success: true
      });
      
      toast({
        title: "Cache preîncărcat",
        description: "Întrebările frecvente au fost preîncărcate în cache.",
      });
    } catch (error) {
      const duration = performance.now() - startTime;
      
      trackEvent('cache_operation', {
        operation: 'warm_faq',
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast({
        title: "Eroare",
        description: "Nu s-au putut preîncărca întrebările frecvente.",
        variant: "destructive"
      });
    }
  };

  const handleOptimizeCache = async () => {
    try {
      await cacheHitOptimizer.performMaintenanceOptimization();
      const metrics = cacheHitOptimizer.getOptimizationMetrics();
      setOptimizationMetrics(metrics);
      
      toast({
        title: "Cache Optimized",
        description: `Hit rate improved to ${metrics.hitRate.toFixed(1)}%`,
      });
    } catch (error) {
      toast({
        title: "Optimization Error",
        description: "Failed to optimize cache performance",
        variant: "destructive"
      });
    }
  };

  // Track cache performance when component mounts
  useEffect(() => {
    trackEvent('cache_stats_viewed', {
      hit_rate: stats.hitRate,
      total_queries: stats.totalQueries,
      cache_hits: stats.cacheHits,
      cache_misses: stats.cacheMisses,
      advanced_total_size: advancedMetrics.totalSize,
      advanced_hit_rate: advancedMetrics.hitRate
    });
  }, []);

  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = cacheHitOptimizer.getOptimizationMetrics();
      setOptimizationMetrics(metrics);
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    advancedMetrics,
    optimizationMetrics,
    handleClearCache,
    handleWarmFAQ,
    handleOptimizeCache,
    trackUserAction
  };
};
