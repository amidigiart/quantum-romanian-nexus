
import React from 'react';
import { TrendingUp } from 'lucide-react';

interface CacheOverviewProps {
  advancedMetrics: {
    totalSize: number;
    hitRate: number;
  };
}

export const CacheOverview: React.FC<CacheOverviewProps> = ({ advancedMetrics }) => {
  return (
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
  );
};
