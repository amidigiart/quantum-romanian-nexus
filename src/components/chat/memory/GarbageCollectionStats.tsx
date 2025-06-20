
import React from 'react';
import { Zap } from 'lucide-react';
import { GCMetrics } from '@/services/cache/gc/types';

interface GarbageCollectionStatsProps {
  gcMetrics: GCMetrics;
}

export const GarbageCollectionStats: React.FC<GarbageCollectionStatsProps> = ({ gcMetrics }) => {
  const formatMemorySize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-300">Garbage Collection</span>
        </div>
        <span className="text-sm text-white">
          {gcMetrics.gcCount} runs
        </span>
      </div>
      
      {gcMetrics.lastGCTime > 0 && (
        <div className="text-xs text-gray-400 space-y-1">
          <div className="flex justify-between">
            <span>Last GC:</span>
            <span>{new Date(gcMetrics.lastGCTime).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Memory Freed:</span>
            <span>{formatMemorySize(gcMetrics.memoryFreed)}</span>
          </div>
          <div className="flex justify-between">
            <span>Avg GC Time:</span>
            <span>{gcMetrics.averageGCTime.toFixed(1)}ms</span>
          </div>
        </div>
      )}
    </div>
  );
};
