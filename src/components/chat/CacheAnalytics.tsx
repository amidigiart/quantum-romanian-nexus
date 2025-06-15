
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { advancedCacheService } from '@/services/advancedCacheService';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useToast } from '@/hooks/use-toast';
import { CacheAnalyticsHeader } from './CacheAnalyticsHeader';
import { CacheAnalyticsOverview } from './CacheAnalyticsOverview';
import { CacheAnalyticsPerformance } from './CacheAnalyticsPerformance';
import { CacheAnalyticsManagement } from './CacheAnalyticsManagement';

export const CacheAnalytics = () => {
  const [metrics, setMetrics] = useState(advancedCacheService.getMetrics());
  const { getCacheStats } = useBotResponses();
  const { toast } = useToast();
  const responseCacheStats = getCacheStats();

  const refreshMetrics = () => {
    setMetrics(advancedCacheService.getMetrics());
  };

  const handleWarmCache = async () => {
    const warmingStrategies = [
      {
        key: 'quantum-algorithms-overview',
        dataLoader: async () => 'Overview of 10 advanced quantum algorithms implemented in our system',
        tags: ['chat-response', 'algorithms'],
        priority: 'high' as const
      },
      {
        key: 'quantum-news-summary',
        dataLoader: async () => 'Latest developments in quantum computing technology',
        tags: ['chat-response', 'news'],
        priority: 'medium' as const
      }
    ];

    await advancedCacheService.warmCache(warmingStrategies);
    refreshMetrics();
    toast({
      title: "Cache Warmed",
      description: "Frequently accessed data has been preloaded.",
    });
  };

  const handleClearAdvanced = () => {
    advancedCacheService.clearAll();
    refreshMetrics();
    toast({
      title: "Advanced Cache Cleared",
      description: "All cache levels have been cleared.",
    });
  };

  const handleInvalidateTag = (tag: string) => {
    advancedCacheService.invalidateByTags([tag]);
    refreshMetrics();
    toast({
      title: "Cache Invalidated",
      description: `All entries with tag "${tag}" have been removed.`,
    });
  };

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <CacheAnalyticsHeader 
        onRefresh={refreshMetrics}
        onWarmCache={handleWarmCache}
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="text-white">Performance</TabsTrigger>
          <TabsTrigger value="management" className="text-white">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <CacheAnalyticsOverview metrics={metrics} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <CacheAnalyticsPerformance 
            metrics={metrics}
            responseCacheStats={responseCacheStats}
          />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <CacheAnalyticsManagement
            onInvalidateTag={handleInvalidateTag}
            onClearAdvanced={handleClearAdvanced}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
