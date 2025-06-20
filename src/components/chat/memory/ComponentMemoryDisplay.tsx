
import React from 'react';
import { Button } from '@/components/ui/button';
import { Database, Settings, AlertTriangle } from 'lucide-react';
import { ComponentMemoryUsage } from '@/services/cache/gc/componentMemoryTracker';

interface ComponentMemoryDisplayProps {
  components: ComponentMemoryUsage[];
  totalComponentMemory: number;
  onShowSettings: () => void;
  showSettings: boolean;
}

export const ComponentMemoryDisplay: React.FC<ComponentMemoryDisplayProps> = ({
  components,
  totalComponentMemory,
  onShowSettings,
  showSettings
}) => {
  const formatMemorySize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  const getComponentHealthColor = (usage: ComponentMemoryUsage) => {
    if (usage.isOverThreshold) return 'text-red-400';
    if (usage.isOverWarning) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-gray-300">Component Memory</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onShowSettings}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      {components.map((component) => (
        <div key={component.componentName} className="space-y-1">
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${getComponentHealthColor(component)}`} />
              <span className="text-gray-300">{component.componentName}</span>
              {component.isOverThreshold && <AlertTriangle className="w-3 h-3 text-red-400" />}
            </div>
            <span className="text-white">
              {formatMemorySize(component.currentMemoryMB)}
            </span>
          </div>
        </div>
      ))}
      
      <div className="text-xs text-gray-400">
        Total: {formatMemorySize(totalComponentMemory)}
      </div>
    </div>
  );
};
