
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, BarChart3, Clock } from 'lucide-react';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useToast } from '@/hooks/use-toast';

export const CacheManager = () => {
  const { clearResponseCache, getCacheStats } = useBotResponses();
  const { toast } = useToast();
  const stats = getCacheStats();

  const handleClearCache = () => {
    clearResponseCache();
    toast({
      title: "Cache șters",
      description: "Cache-ul de răspunsuri a fost golit cu succes.",
    });
  };

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 70) return 'bg-green-500';
    if (hitRate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Cache Management</h3>
        </div>
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
    </Card>
  );
};
