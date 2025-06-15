
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CacheControls } from './CacheControls';
import { CacheStats } from './CacheStats';
import { CacheOverview } from './CacheOverview';
import { CacheAnalytics } from './CacheAnalytics';
import { CacheOptimizationPanel } from './CacheOptimizationPanel';

interface CacheManagerTabsProps {
  stats: any;
  advancedMetrics: any;
  optimizationMetrics: any;
  onClearCache: () => void;
  onWarmFAQ: () => Promise<void>;
  onOptimizeCache: () => Promise<void>;
  onTrackAction: (action: string, details?: any) => void;
}

export const CacheManagerTabs: React.FC<CacheManagerTabsProps> = ({
  stats,
  advancedMetrics,
  optimizationMetrics,
  onClearCache,
  onWarmFAQ,
  onOptimizeCache,
  onTrackAction
}) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger 
          value="basic" 
          className="text-white"
          onClick={() => onTrackAction('cache_tab_switched', { tab: 'basic' })}
        >
          Basic Cache
        </TabsTrigger>
        <TabsTrigger 
          value="optimization" 
          className="text-white"
          onClick={() => onTrackAction('cache_tab_switched', { tab: 'optimization' })}
        >
          Optimization
        </TabsTrigger>
        <TabsTrigger 
          value="advanced" 
          className="text-white"
          onClick={() => onTrackAction('cache_tab_switched', { tab: 'advanced' })}
        >
          Advanced Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <CacheControls 
          onClearCache={onClearCache}
          onWarmFAQ={onWarmFAQ}
          onTrackAction={onTrackAction}
        />
        <CacheStats stats={stats} />
        <CacheOverview advancedMetrics={advancedMetrics} />
      </TabsContent>

      <TabsContent value="optimization" className="space-y-4">
        <CacheOptimizationPanel 
          optimizationMetrics={optimizationMetrics}
          onOptimizeCache={onOptimizeCache}
          onWarmFAQ={onWarmFAQ}
        />
      </TabsContent>

      <TabsContent value="advanced">
        <CacheAnalytics />
      </TabsContent>
    </Tabs>
  );
};
