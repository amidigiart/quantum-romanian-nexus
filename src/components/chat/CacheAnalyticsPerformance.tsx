
import React from 'react';
import { Card } from '@/components/ui/card';
import { CacheMetrics } from '@/types/cache';

interface CacheAnalyticsPerformanceProps {
  metrics: CacheMetrics;
  responseCacheStats: {
    totalQueries: number;
    cacheHits: number;
    hitRate: number;
  };
}

export const CacheAnalyticsPerformance: React.FC<CacheAnalyticsPerformanceProps> = ({
  metrics,
  responseCacheStats
}) => {
  const getPerformanceColor = (value: number, thresholds: { good: number; ok: number }) => {
    if (value >= thresholds.good) return 'text-green-400';
    if (value >= thresholds.ok) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
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
  );
};
