
import React from 'react';
import { Button } from '@/components/ui/button';
import { Rss, Clock, RefreshCw } from 'lucide-react';

interface NewsFeedHeaderProps {
  lastUpdated: Date | null;
  loading: boolean;
  onRefresh: () => void;
}

export const NewsFeedHeader: React.FC<NewsFeedHeaderProps> = ({
  lastUpdated,
  loading,
  onRefresh
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Rss className="w-6 h-6 text-cyan-400" />
        <h3 className="text-white text-lg font-semibold">Știri Quantum Computing</h3>
      </div>
      <div className="flex items-center gap-2">
        {lastUpdated && (
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Actualizat: {lastUpdated.toLocaleTimeString('ro-RO')}</span>
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};
