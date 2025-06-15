
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, Clock, TrendingUp } from 'lucide-react';
import { CacheMetrics } from '@/types/cache';

interface CacheAnalyticsOverviewProps {
  metrics: CacheMetrics;
}

export const CacheAnalyticsOverview: React.FC<CacheAnalyticsOverviewProps> = ({ metrics }) => {
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
    <div className="space-y-4">
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
    </div>
  );
};
