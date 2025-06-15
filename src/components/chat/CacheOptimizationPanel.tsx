
import React from 'react';

interface CacheOptimizationPanelProps {
  optimizationMetrics: {
    hitRate: number;
    totalHits: number;
    totalMisses: number;
    uniqueHitPatterns: number;
    topMissedQueries: Array<[string, number]>;
  };
  onOptimizeCache: () => Promise<void>;
  onWarmFAQ: () => Promise<void>;
}

export const CacheOptimizationPanel: React.FC<CacheOptimizationPanelProps> = ({
  optimizationMetrics,
  onOptimizeCache,
  onWarmFAQ
}) => {
  return (
    <>
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
          onClick={onOptimizeCache}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Optimize Cache
        </button>
        
        <button
          onClick={onWarmFAQ}
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
    </>
  );
};
