
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Database, 
  Clock, 
  Target,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { advancedCacheService } from '@/services/advancedCacheService';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useToast } from '@/hooks/use-toast';

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

  const getPerformanceColor = (value: number, thresholds: { good: number; ok: number }) => {
    if (value >= thresholds.good) return 'text-green-400';
    if (value >= thresholds.ok) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 3) return { color: 'bg-green-500', label: 'Excellent' };
    if (efficiency >= 2) return { color: 'bg-yellow-500', label: 'Good' };
    return { color: 'bg-red-500', label: 'Needs Optimization' };
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Advanced Cache Analytics</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refreshMetrics}
            variant="outline"
            size="sm"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={handleWarmCache}
            variant="outline"
            size="sm"
            className="border-green-400 text-green-400 hover:bg-green-400/10"
          >
            <Zap className="w-4 h-4 mr-2" />
            Warm Cache
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="text-white">Performance</TabsTrigger>
          <TabsTrigger value="management" className="text-white">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{metrics.totalSize}</div>
              <div className="text-sm text-gray-300">Total Entries</div>
              <div className="flex items-center gap-1 mt-1">
                <Database className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-cyan-400">Multi-level</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className={`text-2xl font-bold ${getPerformanceColor(metrics.hitRate, { good: 70, ok: 40 })}`}>
                {metrics.hitRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">Hit Rate</div>
              <Progress value={metrics.hitRate} className="mt-2 h-1" />
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">
                {metrics.averageResponseTime.toFixed(1)}ms
              </div>
              <div className="text-sm text-gray-300">Avg Response</div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Fast</span>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">
                {metrics.cacheEfficiency.toFixed(1)}
              </div>
              <div className="text-sm text-gray-300">Efficiency Score</div>
              <Badge className={`${getEfficiencyBadge(metrics.cacheEfficiency).color} text-white border-0 mt-1`}>
                {getEfficiencyBadge(metrics.cacheEfficiency).label}
              </Badge>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Popular Queries
            </h4>
            {metrics.popularQueries.length > 0 ? (
              <div className="space-y-2">
                {metrics.popularQueries.slice(0, 5).map((query, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm truncate flex-1">
                      {query.query}
                    </span>
                    <Badge variant="outline" className="border-cyan-400 text-cyan-400 ml-2">
                      {query.hits} hits
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No popular queries yet</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10 p-4">
              <h4 className="text-white font-medium mb-3">Advanced Cache Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Hit Rate:</span>
                  <span className={getPerformanceColor(metrics.hitRate, { good: 70, ok: 40 })}>
                    {metrics.hitRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Miss Rate:</span>
                  <span className="text-red-400">{metrics.missRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Response:</span>
                  <span className="text-green-400">{metrics.averageResponseTime.toFixed(1)}ms</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <h4 className="text-white font-medium mb-3">Response Cache Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Queries:</span>
                  <span className="text-white">{responseCacheStats.totalQueries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cache Hits:</span>
                  <span className="text-green-400">{responseCacheStats.cacheHits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Hit Rate:</span>
                  <span className={getPerformanceColor(responseCacheStats.hitRate, { good: 60, ok: 30 })}>
                    {responseCacheStats.hitRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10 p-4">
              <h4 className="text-white font-medium mb-3">Cache Invalidation</h4>
              <div className="space-y-2">
                {['chat-response', 'algorithms', 'news', 'user-data'].map((tag) => (
                  <Button
                    key={tag}
                    onClick={() => handleInvalidateTag(tag)}
                    variant="outline"
                    size="sm"
                    className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Invalidate "{tag}" entries
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <h4 className="text-white font-medium mb-3">Cache Management</h4>
              <div className="space-y-2">
                <Button 
                  onClick={handleClearAdvanced}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-400 text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Caches
                </Button>
                
                <div className="mt-4 p-3 bg-white/5 rounded">
                  <p className="text-xs text-gray-400">
                    Advanced caching uses memory, session, and response-level caching 
                    for optimal performance. Cache warming preloads frequently accessed data.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
