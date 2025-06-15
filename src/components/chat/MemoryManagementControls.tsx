
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Activity, Database, Wifi } from 'lucide-react';
import { useMemoryManagement } from '@/hooks/chat/useMemoryManagement';
import { websocketPool } from '@/services/websocketPoolManager';

export const MemoryManagementControls: React.FC = () => {
  const {
    memoryUsage,
    memoryConfig,
    performCleanup,
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

  const formatMemorySize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getMemoryUsagePercent = () => {
    return Math.min((memoryUsage.messagesInMemory / memoryConfig.maxMessagesInMemory)  * 100, 100);
  };

  const getConnectionHealthColor = () => {
    if (wsStats.activeConnections === 0) return 'text-gray-400';
    if (wsStats.activeConnections <= wsStats.maxConnections * 0.5) return 'text-green-400';
    if (wsStats.activeConnections <= wsStats.maxConnections * 0.8) return 'text-yellow-400';
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

      {/* Memory Usage */}
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

      {/* Total Memory */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-300">Total Memory</span>
        </div>
        <span className="text-sm text-white">
          {formatMemorySize(memoryUsage.totalMemoryMB * 1024 * 1024)}
        </span>
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

      {/* Cleanup Button */}
      <Button
        onClick={handleManualCleanup}
        variant="outline"
        size="sm"
        className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Manual Cleanup
      </Button>

      {/* Debug Info (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 border-t border-white/10 pt-2 space-y-1">
          <div>Conversations: {memoryUsage.conversationsInMemory}</div>
          <div>WS Memory: {formatMemorySize(wsStats.memoryUsage)}</div>
          <div>Buffer Size: {memoryConfig.virtualizationBufferSize}</div>
        </div>
      )}
    </Card>
  );
};
