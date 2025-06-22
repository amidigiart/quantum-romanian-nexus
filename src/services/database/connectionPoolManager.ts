export interface PoolConfig {
  maxConnections: number;
  minConnections: number;
  acquireTimeoutMs: number;
  idleTimeoutMs: number;
  maxLifetimeMs: number;
}

export interface ConnectionMetrics {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  queuedRequests: number;
  averageAcquireTime: number;
  connectionErrors: number;
}

export class DatabaseConnectionPoolManager {
  private config: PoolConfig;
  private metrics: ConnectionMetrics;
  private acquireTimes: number[] = [];
  private lastCleanup: number = Date.now();

  constructor(config: Partial<PoolConfig> = {}) {
    this.config = {
      maxConnections: 20,
      minConnections: 2,
      acquireTimeoutMs: 30000,
      idleTimeoutMs: 300000, // 5 minutes
      maxLifetimeMs: 3600000, // 1 hour
      ...config
    };

    this.metrics = {
      activeConnections: 0,
      idleConnections: 0,
      totalConnections: 0,
      queuedRequests: 0,
      averageAcquireTime: 0,
      connectionErrors: 0
    };

    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  async withConnection<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    
    try {
      this.metrics.queuedRequests++;
      
      // Simulate connection acquisition (in real implementation, this would get from pool)
      await this.acquireConnection();
      
      const acquireTime = performance.now() - startTime;
      this.recordAcquireTime(acquireTime);
      
      this.metrics.queuedRequests--;
      this.metrics.activeConnections++;
      
      const result = await operation();
      
      return result;
    } catch (error) {
      this.metrics.connectionErrors++;
      throw error;
    } finally {
      this.metrics.activeConnections--;
      this.releaseConnection();
    }
  }

  private async acquireConnection(): Promise<void> {
    // Simulate connection acquisition delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
    
    if (this.metrics.totalConnections >= this.config.maxConnections) {
      // Wait for available connection or timeout
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection acquire timeout')), this.config.acquireTimeoutMs)
      );
      
      const waitForConnection = new Promise(resolve => {
        const check = () => {
          if (this.metrics.totalConnections < this.config.maxConnections) {
            resolve(void 0);
          } else {
            setTimeout(check, 10);
          }
        };
        check();
      });
      
      await Promise.race([waitForConnection, timeout]);
    }
    
    this.metrics.totalConnections++;
  }

  private releaseConnection(): void {
    this.metrics.idleConnections++;
    
    // Schedule connection for potential cleanup
    setTimeout(() => {
      if (this.metrics.idleConnections > this.config.minConnections) {
        this.metrics.idleConnections--;
        this.metrics.totalConnections--;
      }
    }, this.config.idleTimeoutMs);
  }

  private recordAcquireTime(time: number): void {
    this.acquireTimes.push(time);
    
    // Keep only last 100 measurements for average calculation
    if (this.acquireTimes.length > 100) {
      this.acquireTimes = this.acquireTimes.slice(-100);
    }
    
    this.metrics.averageAcquireTime = 
      this.acquireTimes.reduce((sum, time) => sum + time, 0) / this.acquireTimes.length;
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.performCleanup();
    }, 60000); // Every minute
  }

  private performCleanup(): void {
    const now = Date.now();
    
    // Log cleanup operation
    console.log('Database connection pool cleanup performed', {
      timestamp: new Date(now).toISOString(),
      metrics: this.getMetrics()
    });
    
    this.lastCleanup = now;
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  getConfig(): PoolConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<PoolConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Connection pool config updated:', this.config);
  }

  destroy(): void {
    // Cleanup resources
    this.metrics = {
      activeConnections: 0,
      idleConnections: 0,
      totalConnections: 0,
      queuedRequests: 0,
      averageAcquireTime: 0,
      connectionErrors: 0
    };
    console.log('Database connection pool destroyed');
  }
}

export const databaseConnectionPool = new DatabaseConnectionPoolManager();
