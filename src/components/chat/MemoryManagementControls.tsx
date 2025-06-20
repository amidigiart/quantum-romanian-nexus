
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity } from 'lucide-react';
import { useMemoryManagement } from '@/hooks/chat/useMemoryManagement';
import { websocketPool } from '@/services/websocketPoolManager';
import { SystemMemoryDisplay } from './memory/SystemMemoryDisplay';
import { ComponentMemoryDisplay } from './memory/ComponentMemoryDisplay';
import { ComponentThresholdSettings } from './memory/ComponentThresholdSettings';
import { GarbageCollectionStats } from './memory/GarbageCollectionStats';
import { WebSocketConnectionStats } from './memory/WebSocketConnectionStats';
import { MemoryControlButtons } from './memory/MemoryControlButtons';

export const MemoryManagementControls: React.FC = () => {
  const {
    memoryUsage,
    memoryConfig,
    performCleanup,
    forceGarbageCollection,
    isMemoryOptimized,
    checkMemoryPressure,
    updateComponentThreshold,
    removeComponentThreshold
  } = useMemoryManagement();

  const [wsStats, setWsStats] = React.useState(websocketPool.getPoolStats());
  const [showComponentSettings, setShowComponentSettings] = React.useState(false);

  // Update WebSocket stats periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setWsStats(websocketPool.getPoolStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleManualCleanup = async () => {
    await performCleanup(true);
    checkMemoryPressure();
  };

  const handleForceGC = () => {
    forceGarbageCollection();
  };

  const getMemoryUsagePercent = () => {
    return Math.min((memoryUsage.messagesInMemory / memoryConfig.maxMessagesInMemory) * 100, 100);
  };

  const formatMemorySize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/20 p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Memory Management</h3>
        <Badge 
          variant={isMemoryOptimized ? "default" : "destructive"}
          className="ml-auto"
        >
          {isMemoryOptimized ? "Optimized" : "High Usage"}
        </Badge>
      </div>

      <SystemMemoryDisplay systemMemory={memoryUsage.systemMemory} />

      <ComponentMemoryDisplay
        components={memoryUsage.componentStatus.components}
        totalComponentMemory={memoryUsage.componentStatus.totalComponentMemory}
        onShowSettings={() => setShowComponentSettings(!showComponentSettings)}
        showSettings={showComponentSettings}
      />

      {showComponentSettings && (
        <ComponentThresholdSettings
          thresholds={memoryUsage.componentStatus.thresholds}
          onUpdateThreshold={updateComponentThreshold}
          onRemoveThreshold={removeComponentThreshold}
        />
      )}

      {/* Cache Memory Usage */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Messages in Memory</span>
          <span className="text-white">
            {memoryUsage.messagesInMemory} / {memoryConfig.maxMessagesInMemory}
          </span>
        </div>
        <Progress 
          value={getMemoryUsagePercent()} 
          className="h-2 bg-white/10"
        />
      </div>

      <GarbageCollectionStats gcMetrics={memoryUsage.gcMetrics} />

      <WebSocketConnectionStats wsStats={wsStats} />

      {/* Last Cleanup */}
      {memoryUsage.lastCleanup && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Last Cleanup</span>
          <span className="text-white">
            {memoryUsage.lastCleanup.toLocaleDateString()}
          </span>
        </div>
      )}

      <MemoryControlButtons
        onManualCleanup={handleManualCleanup}
        onForceGC={handleForceGC}
      />

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 border-t border-white/10 pt-2 space-y-1">
          <div>Conversations: {memoryUsage.conversationsInMemory}</div>
          <div>WS Memory: {formatMemorySize(wsStats.memoryUsage / (1024 * 1024))}</div>
          <div>Components Over Threshold: {memoryUsage.componentStatus.overThreshold.length}</div>
          <div>Components Over Warning: {memoryUsage.componentStatus.overWarning.length}</div>
        </div>
      )}
    </Card>
  );
};
