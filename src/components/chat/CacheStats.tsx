
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface CacheStatsProps {
  stats: {
    totalQueries: number;
    cacheHits: number;
    cacheMisses: number;
    hitRate: number;
  };
}

export const CacheStats: React.FC<CacheStatsProps> = ({ stats }) => {
  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 70) return 'bg-green-500';
    if (hitRate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
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
    </>
  );
};
