
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Activity, Database, Wifi, Cpu, Zap } from 'lucide-react';
import { useMemoryManagement } from '@/hooks/chat/useMemoryManagement';
import { websocketPool } from '@/services/websocketPoolManager';

export const MemoryManagementControls: React.FC = () => {
  const {
    memoryUsage,
    memoryConfig,
    performCleanup,
    forceGarbageCollection,
    isMemoryOptimized,
    checkMemoryPressure
  } = useMemoryManagement();

  const [wsStats, setWsStats] = React.useState(websocketPool.getPoolStats());

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

  const formatMemorySize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  const getMemoryUsagePercent = () => {
    return Math.min((memoryUsage.messagesInMemory / memoryConfig.maxMessagesInMemory) * 100, 100);
  };

  const getSystemMemoryPercent = () => {
    return Math.min(memoryUsage.systemMemory.usagePercent, 100);
  };

  const getConnectionHealthColor = () => {
    if (wsStats.activeConnections === 0) return 'text-gray-400';
    if (wsStats.activeConnections <= wsStats.maxConnections * 0.5) return 'text-green-400';
    if (wsStats.activeConnections <= wsStats.maxConnections * 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMemoryHealthColor = () => {
    const percent = memoryUsage.systemMemory.usagePercent;
    if (percent < 50) return 'text-green-400';
    if (percent < 80) return 'text-yellow-400';
    return 'text-red-400';
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

      {/* System Memory Usage */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-2">
            <Cpu className={`w-4 h-4 ${getMemoryHealthColor()}`} />
            <span className="text-gray-300">System Memory</span>
          </div>
          <span className="text-white">
            {formatMemorySize(memoryUsage.systemMemory.used)} / {formatMemorySize(memoryUsage.systemMemory.limit)}
          </span>
        </div>
        <Progress 
          value={getSystemMemoryPercent()} 
          className="h-2 bg-white/10"
        />
        <div className="text-xs text-gray-400">
          Available: {formatMemorySize(memoryUsage.systemMemory.available)}
        </div>
      </div>

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

      {/* Garbage Collection Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Garbage Collection</span>
          </div>
          <span className="text-sm text-white">
            {memoryUsage.gcMetrics.gcCount} runs
          </span>
        </div>
        
        {memoryUsage.gcMetrics.lastGCTime > 0 && (
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Last GC:</span>
              <span>{new Date(memoryUsage.gcMetrics.lastGCTime).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Freed:</span>
              <span>{formatMemorySize(memoryUsage.gcMetrics.memoryFreed)}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg GC Time:</span>
              <span>{memoryUsage.gcMetrics.averageGCTime.toFixed(1)}ms</span>
            </div>
          </div>
        )}
      </div>

      {/* WebSocket Connections */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Wifi className={`w-4 h-4 ${getConnectionHealthColor()}`} />
          <span className="text-sm text-gray-300">Active Connections</span>
          <span className={`text-sm ml-auto ${getConnectionHealthColor()}`}>
            {wsStats.activeConnections} / {wsStats.maxConnections}
          </span>
        </div>
        
        {wsStats.connections.length > 0 && (
          <div className="text-xs text-gray-400 space-y-1">
            {wsStats.connections.slice(0, 3).map((conn, index) => (
              <div key={index} className="flex justify-between">
                <span>Connection {index + 1}</span>
                <span>{conn.subscribers} subscribers</span>
              </div>
            ))}
            {wsStats.connections.length > 3 && (
              <div className="text-center">
                ... and {wsStats.connections.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Last Cleanup */}
      {memoryUsage.lastCleanup && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Last Cleanup</span>
          <span className="text-white">
            {memoryUsage.lastCleanup.toLocaleDateString()}
          </span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-y-2">
        <Button
          onClick={handleManualCleanup}
          variant="outline"
          size="sm"
          className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Manual Cleanup
        </Button>

        <Button
          onClick={handleForceGC}
          variant="outline"
          size="sm"
          className="w-full border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
        >
          <Zap className="w-4 h-4 mr-2" />
          Force Garbage Collection
        </Button>
      </div>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 border-t border-white/10 pt-2 space-y-1">
          <div>Conversations: {memoryUsage.conversationsInMemory}</div>
          <div>WS Memory: {formatMemorySize(wsStats.memoryUsage / (1024 * 1024))}</div>
          <div>Buffer Size: {memoryConfig.virtualizationBufferSize}</div>
          <div>GC Threshold: {memoryConfig.gcThresholdMB}MB</div>
        </div>
      )}
    </Card>
  );
};
