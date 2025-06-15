
interface WebSocketConnection {
  id: string;
  socket: WebSocket;
  isActive: boolean;
  lastUsed: Date;
  subscribers: Set<string>;
  reconnectAttempts: number;
}

interface PoolConfig {
  maxConnections: number;
  idleTimeout: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
  maxConnections: 5,
  idleTimeout: 5 * 60 * 1000, // 5 minutes
  maxReconnectAttempts: 3,
  heartbeatInterval: 30 * 1000 // 30 seconds
};

export class WebSocketPoolManager {
  private connections: Map<string, WebSocketConnection> = new Map();
  private config: PoolConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = { ...DEFAULT_POOL_CONFIG, ...config };
    this.startCleanupTimer();
    this.startHeartbeat();
  }

  // Get or create a WebSocket connection
  async getConnection(url: string, protocols?: string[]): Promise<WebSocket> {
    const connectionId = this.generateConnectionId(url, protocols);
    
    // Check if we have an existing active connection
    const existing = this.connections.get(connectionId);
    if (existing && existing.socket.readyState === WebSocket.OPEN) {
      existing.lastUsed = new Date();
      existing.isActive = true;
      return existing.socket;
    }

    // Remove old connection if it exists
    if (existing) {
      this.removeConnection(connectionId);
    }

    // Check pool size limit
    if (this.connections.size >= this.config.maxConnections) {
      this.evictOldestConnection();
    }

    // Create new connection
    return this.createConnection(connectionId, url, protocols);
  }

  // Subscribe to a connection for cleanup tracking
  subscribe(url: string, subscriberId: string, protocols?: string[]): WebSocket | null {
    const connectionId = this.generateConnectionId(url, protocols);
    const connection = this.connections.get(connectionId);
    
    if (connection && connection.socket.readyState === WebSocket.OPEN) {
      connection.subscribers.add(subscriberId);
      connection.lastUsed = new Date();
      return connection.socket;
    }
    
    return null;
  }

  // Unsubscribe from a connection
  unsubscribe(url: string, subscriberId: string, protocols?: string[]): void {
    const connectionId = this.generateConnectionId(url, protocols);
    const connection = this.connections.get(connectionId);
    
    if (connection) {
      connection.subscribers.delete(subscriberId);
      
      // If no more subscribers, mark as inactive
      if (connection.subscribers.size === 0) {
        connection.isActive = false;
      }
    }
  }

  // Get pool statistics
  getPoolStats() {
    const activeConnections = Array.from(this.connections.values()).filter(conn => conn.isActive).length;
    const totalConnections = this.connections.size;
    const connections = Array.from(this.connections.entries()).map(([id, conn]) => ({
      id,
      isActive: conn.isActive,
      readyState: conn.socket.readyState,
      subscribers: conn.subscribers.size,
      lastUsed: conn.lastUsed,
      reconnectAttempts: conn.reconnectAttempts
    }));

    return {
      activeConnections,
      totalConnections,
      maxConnections: this.config.maxConnections,
      connections,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  // Cleanup and destroy all connections
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.connections.forEach((connection, id) => {
      this.removeConnection(id);
    });
    
    this.connections.clear();
  }

  private createConnection(connectionId: string, url: string, protocols?: string[]): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(url, protocols);
        const connection: WebSocketConnection = {
          id: connectionId,
          socket,
          isActive: true,
          lastUsed: new Date(),
          subscribers: new Set(),
          reconnectAttempts: 0
        };

        socket.onopen = () => {
          console.log(`WebSocket connection opened: ${connectionId}`);
          this.connections.set(connectionId, connection);
          resolve(socket);
        };

        socket.onerror = (error) => {
          console.error(`WebSocket error for ${connectionId}:`, error);
          this.handleConnectionError(connectionId);
          reject(error);
        };

        socket.onclose = (event) => {
          console.log(`WebSocket closed: ${connectionId}`, event.code, event.reason);
          this.handleConnectionClose(connectionId);
        };

        // Timeout for connection
        setTimeout(() => {
          if (socket.readyState === WebSocket.CONNECTING) {
            socket.close();
            reject(new Error(`Connection timeout for ${connectionId}`));
          }
        }, 10000); // 10 second timeout

      } catch (error) {
        reject(error);
      }
    });
  }

  private generateConnectionId(url: string, protocols?: string[]): string {
    const protocolString = protocols ? protocols.join(',') : '';
    return `${url}:${protocolString}`;
  }

  private removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      if (connection.socket.readyState === WebSocket.OPEN) {
        connection.socket.close();
      }
      this.connections.delete(connectionId);
      console.log(`Removed WebSocket connection: ${connectionId}`);
    }
  }

  private evictOldestConnection(): void {
    let oldestConnection: [string, WebSocketConnection] | null = null;
    let oldestTime = Date.now();

    for (const [id, connection] of this.connections.entries()) {
      if (!connection.isActive && connection.lastUsed.getTime() < oldestTime) {
        oldestTime = connection.lastUsed.getTime();
        oldestConnection = [id, connection];
      }
    }

    if (oldestConnection) {
      this.removeConnection(oldestConnection[0]);
    }
  }

  private handleConnectionError(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.reconnectAttempts++;
      
      // Try to reconnect if under limit
      if (connection.reconnectAttempts < this.config.maxReconnectAttempts) {
        setTimeout(() => {
          this.attemptReconnection(connectionId);
        }, Math.pow(2, connection.reconnectAttempts) * 1000); // Exponential backoff
      } else {
        this.removeConnection(connectionId);
      }
    }
  }

  private handleConnectionClose(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection && connection.subscribers.size > 0) {
      // Try to reconnect if there are still subscribers
      this.attemptReconnection(connectionId);
    } else {
      this.removeConnection(connectionId);
    }
  }

  private async attemptReconnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      const [url, protocolString] = connectionId.split(':');
      const protocols = protocolString ? protocolString.split(',') : undefined;
      
      await this.createConnection(connectionId, url, protocols);
    } catch (error) {
      console.error(`Reconnection failed for ${connectionId}:`, error);
      this.handleConnectionError(connectionId);
    }
  }

  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      
      for (const [id, connection] of this.connections.entries()) {
        const idleTime = now - connection.lastUsed.getTime();
        
        // Remove inactive connections that have exceeded idle timeout
        if (!connection.isActive && idleTime > this.config.idleTimeout) {
          this.removeConnection(id);
        }
      }
    }, 60000); // Check every minute
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const [id, connection] of this.connections.entries()) {
        if (connection.socket.readyState === WebSocket.OPEN && connection.isActive) {
          try {
            // Send ping frame (if supported) or custom heartbeat
            if ('ping' in connection.socket) {
              (connection.socket as any).ping();
            } else {
              // Fallback: send a heartbeat message
              connection.socket.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
            }
          } catch (error) {
            console.error(`Heartbeat failed for ${id}:`, error);
            this.handleConnectionError(id);
          }
        }
      }
    }, this.config.heartbeatInterval);
  }

  private estimateMemoryUsage(): number {
    // Rough estimation: each connection ~1KB + message buffers
    return this.connections.size * 1024;
  }
}

// Singleton instance
export const websocketPool = new WebSocketPoolManager();
