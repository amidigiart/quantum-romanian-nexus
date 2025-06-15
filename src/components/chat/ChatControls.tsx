
import React from 'react';
import { Button } from '@/components/ui/button';

interface ChatControlsProps {
  onPersonalizationClick: () => void;
  onMemoryToggle: () => void;
  showMemoryControls: boolean;
  queueSize: number;
  isConnected: boolean;
}

export const ChatControls: React.FC<ChatControlsProps> = ({
  onPersonalizationClick,
  onMemoryToggle,
  showMemoryControls,
  queueSize,
  isConnected
}) => {
  return (
    <div className="flex justify-between mb-4">
      <div className="flex gap-2">
        <Button
          onClick={onPersonalizationClick}
          variant="outline"
          size="sm"
          className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
        >
          🧠 Personalization
        </Button>
        
        <Button
          onClick={onMemoryToggle}
          variant="outline"
          size="sm"
          className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
        >
          📊 Memory
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        {queueSize > 0 && (
          <div className="text-orange-400 text-sm">
            {queueSize} messages queued
          </div>
        )}
        
        {isConnected && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Real-time Connected
          </div>
        )}
      </div>
    </div>
  );
};
