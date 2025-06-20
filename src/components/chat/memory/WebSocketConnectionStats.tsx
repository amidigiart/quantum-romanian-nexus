
import React from 'react';
import { Wifi } from 'lucide-react';

interface WebSocketStats {
  activeConnections: number;
  maxConnections: number;
  connections: Array<{ subscribers: number }>;
  memoryUsage: number;
}

interface WebSocketConnectionStatsProps {
  wsStats: WebSocketStats;
}

export const WebSocketConnectionStats: React.FC<WebSocketConnectionStatsProps> = ({ wsStats }) => {
  const formatMemorySize = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  const getConnectionHealthColor = () => {
    if (wsStats.activeConnections === 0) return 'text-gray-400';
    if (wsStats.activeConnections <= wsStats.maxConnections * 0.5) return 'text-green-400';
    if (wsStats.activeConnections <= wsStats.maxConnections * 0.8) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
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
  );
};
