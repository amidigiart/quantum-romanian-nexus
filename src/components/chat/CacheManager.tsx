
import React from 'react';
import { Card } from '@/components/ui/card';
import { CacheManagerTabs } from './CacheManagerTabs';
import { useCacheManagerLogic } from './useCacheManagerLogic';

export const CacheManager = () => {
  const {
    stats,
    advancedMetrics,
    optimizationMetrics,
    handleClearCache,
    handleWarmFAQ,
    handleOptimizeCache,
    trackUserAction
  } = useCacheManagerLogic();

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
        <CacheManagerTabs
          stats={stats}
          advancedMetrics={advancedMetrics}
          optimizationMetrics={optimizationMetrics}
          onClearCache={handleClearCache}
          onWarmFAQ={handleWarmFAQ}
          onOptimizeCache={handleOptimizeCache}
          onTrackAction={trackUserAction}
        />
      </Card>
    </div>
  );
};
