
import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Trash2, Zap } from 'lucide-react';

interface CacheControlsProps {
  onClearCache: () => void;
  onWarmFAQ: () => Promise<void>;
  onTrackAction: (action: string, details?: any) => void;
}

export const CacheControls: React.FC<CacheControlsProps> = ({ 
  onClearCache, 
  onWarmFAQ, 
  onTrackAction 
}) => {
  const handleWarmFAQ = async () => {
    onTrackAction('cache_warming_started');
    await onWarmFAQ();
  };

  const handleClearCache = () => {
    onTrackAction('cache_cleared');
    onClearCache();
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Response Cache Management</h3>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={handleWarmFAQ}
          variant="outline"
          size="sm"
          className="border-green-400 text-green-400 hover:bg-green-400/10"
        >
          <Zap className="w-4 h-4 mr-2" />
          Warm FAQ
        </Button>
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
    </div>
  );
};
