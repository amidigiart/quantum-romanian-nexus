
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Trash2 } from 'lucide-react';

interface CacheAnalyticsManagementProps {
  onInvalidateTag: (tag: string) => void;
  onClearAdvanced: () => void;
}

export const CacheAnalyticsManagement: React.FC<CacheAnalyticsManagementProps> = ({
  onInvalidateTag,
  onClearAdvanced
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-white/5 border-white/10 p-4">
        <h4 className="text-white font-medium mb-3">Cache Invalidation</h4>
        <div className="space-y-2">
          {['chat-response', 'algorithms', 'news', 'user-data'].map((tag) => (
            <Button
              key={tag}
              onClick={() => onInvalidateTag(tag)}
              variant="outline"
              size="sm"
              className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
            >
              <Target className="w-4 h-4 mr-2" />
              Invalidate "{tag}" entries
            </Button>
          ))}
        </div>
      </Card>

      <Card className="bg-white/5 border-white/10 p-4">
        <h4 className="text-white font-medium mb-3">Cache Management</h4>
        <div className="space-y-2">
          <Button 
            onClick={onClearAdvanced}
            variant="outline"
            size="sm"
            className="w-full border-red-400 text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Caches
          </Button>
          
          <div className="mt-4 p-3 bg-white/5 rounded">
            <p className="text-xs text-gray-400">
              Advanced caching uses memory, session, and response-level caching 
              for optimal performance. Cache warming preloads frequently accessed data.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
