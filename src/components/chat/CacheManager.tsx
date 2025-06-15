
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, BarChart3, Clock, Zap, TrendingUp } from 'lucide-react';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CacheAnalytics } from './CacheAnalytics';

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
    
    trackUserAction('cache_warming_started');
    
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

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 70) return 'bg-green-500';
    if (hitRate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Response Cache Management</h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleWarmFAQ}
                  variant="outline"
                  size="sm"
                  className="border-green-400 text-green-400 hover:bg-green-400/10"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Warm FAQ
                </Button>
                <Button 
                  onClick={handleClearCache}
                  variant="outline"
                  size="sm"
                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{stats.totalQueries}</div>
                <div className="text-sm text-gray-300">Total Queries</div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">{stats.cacheHits}</div>
                <div className="text-sm text-gray-300">Cache Hits</div>
              </div>

              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl font-bold text-red-400">{stats.cacheMisses}</div>
                <div className="text-sm text-gray-300">Cache Misses</div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-white">{stats.hitRate.toFixed(1)}%</div>
                  <div className="text-sm text-gray-300">Hit Rate</div>
                </div>
                <Badge 
                  className={`${getHitRateColor(stats.hitRate)} text-white border-0`}
                >
                  {stats.hitRate >= 70 ? 'Excellent' : stats.hitRate >= 40 ? 'Good' : 'Poor'}
                </Badge>
              </div>
            </div>

            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="w-4 h-4" />
                <span>Cache expires after 10 minutes of inactivity</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Responses are automatically cached to improve performance for common queries.
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Advanced Cache Overview
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-400">{advancedMetrics.totalSize}</div>
                  <div className="text-xs text-gray-400">Multi-level Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{advancedMetrics.hitRate.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">Advanced Hit Rate</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <CacheAnalytics />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
