
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { ComponentMemoryThreshold } from '@/services/cache/gc/types';

interface ComponentThresholdSettingsProps {
  thresholds: ComponentMemoryThreshold[];
  onUpdateThreshold: (threshold: ComponentMemoryThreshold) => void;
  onRemoveThreshold: (componentName: string) => void;
}

export const ComponentThresholdSettings: React.FC<ComponentThresholdSettingsProps> = ({
  thresholds,
  onUpdateThreshold,
  onRemoveThreshold
}) => {
  const [editingThreshold, setEditingThreshold] = useState<ComponentMemoryThreshold | null>(null);

  const formatMemorySize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  const handleThresholdUpdate = (threshold: ComponentMemoryThreshold) => {
    onUpdateThreshold(threshold);
    setEditingThreshold(null);
  };

  return (
    <div className="space-y-3 border-t border-white/10 pt-3">
      <h4 className="text-sm font-medium text-white">Component Thresholds</h4>
      
      {thresholds.map((threshold) => (
        <div key={threshold.componentName} className="space-y-2 p-2 bg-white/5 rounded">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-300">{threshold.componentName}</span>
            <div className="flex items-center gap-1">
              <Switch 
                checked={threshold.enabled}
                onCheckedChange={(enabled) => 
                  onUpdateThreshold({ ...threshold, enabled })
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingThreshold(threshold)}
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {editingThreshold?.componentName === threshold.componentName && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Warning (MB)"
                  value={editingThreshold.warningThresholdMB}
                  onChange={(e) => setEditingThreshold({
                    ...editingThreshold,
                    warningThresholdMB: Number(e.target.value)
                  })}
                  className="text-xs"
                />
                <Input
                  type="number"
                  placeholder="Max (MB)"
                  value={editingThreshold.maxMemoryMB}
                  onChange={(e) => setEditingThreshold({
                    ...editingThreshold,
                    maxMemoryMB: Number(e.target.value)
                  })}
                  className="text-xs"
                />
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => handleThresholdUpdate(editingThreshold)}
                  className="text-xs"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingThreshold(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-400">
            Warning: {formatMemorySize(threshold.warningThresholdMB)} | 
            Max: {formatMemorySize(threshold.maxMemoryMB)}
          </div>
        </div>
      ))}
    </div>
  );
};
