
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CacheAnalytics } from './CacheAnalytics';
import { CacheStats } from './CacheStats';
import { CacheControls } from './CacheControls';
import { CacheOverview } from './CacheOverview';

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

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger 
              value="basic" 
              className="text-white"
              onClick={() => trackUserAction('cache_tab_switched', { tab: 'basic' })}
            >
              Basic Cache
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

          <TabsContent value="advanced">
            <CacheAnalytics />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
