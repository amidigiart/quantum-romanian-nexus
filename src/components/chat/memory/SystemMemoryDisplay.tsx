
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Cpu } from 'lucide-react';

interface SystemMemoryDisplayProps {
  systemMemory: {
    used: number;
    limit: number;
    available: number;
    usagePercent: number;
  };
}

export const SystemMemoryDisplay: React.FC<SystemMemoryDisplayProps> = ({ systemMemory }) => {
  const formatMemorySize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  const getMemoryHealthColor = () => {
    const percent = systemMemory.usagePercent;
    if (percent < 50) return 'text-green-400';
    if (percent < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSystemMemoryPercent = () => {
    return Math.min(systemMemory.usagePercent, 100);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2">
          <Cpu className={`w-4 h-4 ${getMemoryHealthColor()}`} />
          <span className="text-gray-300">System Memory</span>
        </div>
        <span className="text-white">
          {formatMemorySize(systemMemory.used)} / {formatMemorySize(systemMemory.limit)}
        </span>
      </div>
      <Progress 
        value={getSystemMemoryPercent()} 
        className="h-2 bg-white/10"
      />
      <div className="text-xs text-gray-400">
        Available: {formatMemorySize(systemMemory.available)}
      </div>
    </div>
  );
};
