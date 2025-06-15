
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, RefreshCw, Zap } from 'lucide-react';

interface CacheAnalyticsHeaderProps {
  onRefresh: () => void;
  onWarmCache: () => Promise<void>;
}

export const CacheAnalyticsHeader: React.FC<CacheAnalyticsHeaderProps> = ({
  onRefresh,
  onWarmCache
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Advanced Cache Analytics</h3>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        <Button 
          onClick={onWarmCache}
          variant="outline"
          size="sm"
          className="border-green-400 text-green-400 hover:bg-green-400/10"
        >
          <Zap className="w-4 h-4 mr-2" />
          Warm Cache
        </Button>
      </div>
    </div>
  );
};
