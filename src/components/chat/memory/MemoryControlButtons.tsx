
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Zap } from 'lucide-react';

interface MemoryControlButtonsProps {
  onManualCleanup: () => void;
  onForceGC: () => void;
}

export const MemoryControlButtons: React.FC<MemoryControlButtonsProps> = ({
  onManualCleanup,
  onForceGC
}) => {
  return (
    <div className="space-y-2">
      <Button
        onClick={onManualCleanup}
        variant="outline"
        size="sm"
        className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Manual Cleanup
      </Button>

      <Button
        onClick={onForceGC}
        variant="outline"
        size="sm"
        className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
      >
        <Zap className="w-4 h-4 mr-2" />
        Force Garbage Collection
      </Button>
    </div>
  );
};
