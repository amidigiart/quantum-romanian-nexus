
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CacheAnalytics } from './CacheAnalytics';
import { CacheStats } from './CacheStats';
import { CacheControls } from './CacheControls';
import { CacheOverview } from './CacheOverview';
import { cacheHitOptimizer } from '@/services/cache/cacheHitOptimizer';

export const CacheManager = () => {
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
  React.useEffect(() => {
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
  React.useEffect(() => {
    const interval = setInterval(() => {
      const metrics = cacheHitOptimizer.getOptimizationMetrics();
      setOptimizationMetrics(metrics);
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger 
              value="basic" 
              className="text-white"
              onClick={() => trackUserAction('cache_tab_switched', { tab: 'basic' })}
            >
              Basic Cache
            </TabsTrigger>
            <TabsTrigger 
              value="optimization" 
              className="text-white"
              onClick={() => trackUserAction('cache_tab_switched', { tab: 'optimization' })}
            >
              Optimization
            </TabsTrigger>
            <TabsTrigger 
              value="advanced" 
              className="text-white"
              onClick={() => trackUserAction('cache_tab_switched', { tab: 'advanced' })}
            >
              Advanced Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <CacheControls 
              onClearCache={handleClearCache}
              onWarmFAQ={handleWarmFAQ}
              onTrackAction={trackUserAction}
            />

            <CacheStats stats={stats} />

            <CacheOverview advancedMetrics={advancedMetrics} />
          </TabsContent>

          <TabsContent value="optimization" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{optimizationMetrics.hitRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-300">Optimized Hit Rate</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{optimizationMetrics.totalHits}</div>
                <div className="text-sm text-gray-300">Total Hits</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{optimizationMetrics.uniqueHitPatterns}</div>
                <div className="text-sm text-gray-300">Unique Patterns</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">{optimizationMetrics.totalMisses}</div>
                <div className="text-sm text-gray-300">Cache Misses</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleOptimizeCache}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Optimize Cache
              </button>
              
              <button
                onClick={handleWarmFAQ}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Warm Patterns
              </button>
            </div>

            {optimizationMetrics.topMissedQueries.length > 0 && (
              <div className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Top Missed Queries</h4>
                <div className="space-y-2">
                  {optimizationMetrics.topMissedQueries.map(([query, count], index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-300 truncate">{query}</span>
                      <span className="text-red-400">{count} misses</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced">
            <CacheAnalytics />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
