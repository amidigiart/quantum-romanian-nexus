
export interface GCMetrics {
  lastGCTime: number;
  gcCount: number;
  memoryBeforeGC: number;
  memoryAfterGC: number;
  memoryFreed: number;
  averageGCTime: number;
}

export interface GCConfig {
  memoryThresholdMB: number;
  forceGCInterval: number;
  maxMemoryUsagePercent: number;
  enableAutoGC: boolean;
}

export class GarbageCollectionService {
  private gcMetrics: GCMetrics = {
    lastGCTime: 0,
    gcCount: 0,
    memoryBeforeGC: 0,
    memoryAfterGC: 0,
    memoryFreed: 0,
    averageGCTime: 0
  };

  private config: GCConfig;
  private gcInterval?: number;
  private memoryCheckInterval?: number;

  constructor(config: Partial<GCConfig> = {}) {
    this.config = {
      memoryThresholdMB: 100,
      forceGCInterval: 5 * 60 * 1000, // 5 minutes
      maxMemoryUsagePercent: 80,
      enableAutoGC: true,
      ...config
    };

    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring(): void {
    if (!this.config.enableAutoGC) return;

    // Check memory usage every 30 seconds
    this.memoryCheckInterval = window.setInterval(() => {
      this.checkMemoryPressure();
    }, 30000);

    // Force GC at regular intervals
    this.gcInterval = window.setInterval(() => {
      this.forceGarbageCollection('scheduled');
    }, this.config.forceGCInterval);
  }

  private checkMemoryPressure(): void {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return;

    const memoryUsageMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
    const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;

    // Trigger GC if memory usage is high
    if (memoryUsageMB > this.config.memoryThresholdMB || 
        memoryUsagePercent > this.config.maxMemoryUsagePercent) {
      console.log(`Memory pressure detected: ${memoryUsageMB.toFixed(1)}MB (${memoryUsagePercent.toFixed(1)}%)`);
      this.forceGarbageCollection('pressure');
    }
  }

  forceGarbageCollection(reason: 'manual' | 'pressure' | 'scheduled' | 'cleanup'): boolean {
    const startTime = performance.now();
    const memoryBefore = this.getCurrentMemoryUsage();

    try {
      // Trigger browser GC if available (development only)
      if (this.isGCAvailable()) {
        (window as any).gc();
      }

      // Manual cleanup strategies
      this.performManualCleanup();

      const endTime = performance.now();
      const memoryAfter = this.getCurrentMemoryUsage();
      const gcTime = endTime - startTime;

      this.updateGCMetrics(memoryBefore, memoryAfter, gcTime);

      console.log(`GC triggered (${reason}): ${(memoryBefore - memoryAfter).toFixed(1)}MB freed in ${gcTime.toFixed(1)}ms`);
      
      return true;
    } catch (error) {
      console.error('Error during garbage collection:', error);
      return false;
    }
  }

  private performManualCleanup(): void {
    // Clear any temporary objects or references
    if (typeof window !== 'undefined') {
      // Clear cached DOM queries
      const cachedElements = document.querySelectorAll('[data-cache-cleanup]');
      cachedElements.forEach(el => el.removeAttribute('data-cache-cleanup'));

      // Clear any temporary event listeners or intervals
      this.cleanupTemporaryResources();
    }
  }

  private cleanupTemporaryResources(): void {
    // Clear any orphaned intervals or timeouts
    // This is a basic implementation - in a real app, you'd track these
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      const element = document.querySelector(`[data-timeout-id="${i}"]`);
      if (element && !element.isConnected) {
        clearTimeout(i);
      }
    }
  }

  private isGCAvailable(): boolean {
    return process.env.NODE_ENV === 'development' && 
           typeof window !== 'undefined' && 
           'gc' in window;
  }

  private getCurrentMemoryUsage(): number {
    const memoryInfo = this.getMemoryInfo();
    return memoryInfo ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 0;
  }

  private getMemoryInfo(): MemoryInfo | null {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      return (window.performance as any).memory;
    }
    return null;
  }

  private updateGCMetrics(memoryBefore: number, memoryAfter: number, gcTime: number): void {
    const memoryFreed = Math.max(0, memoryBefore - memoryAfter);
    
    this.gcMetrics.lastGCTime = Date.now();
    this.gcMetrics.gcCount++;
    this.gcMetrics.memoryBeforeGC = memoryBefore;
    this.gcMetrics.memoryAfterGC = memoryAfter;
    this.gcMetrics.memoryFreed = memoryFreed;
    
    // Calculate rolling average GC time
    this.gcMetrics.averageGCTime = 
      (this.gcMetrics.averageGCTime * (this.gcMetrics.gcCount - 1) + gcTime) / this.gcMetrics.gcCount;
  }

  getGCMetrics(): GCMetrics {
    return { ...this.gcMetrics };
  }

  getMemoryStats() {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) {
      return {
        used: 0,
        total: 0,
        limit: 0,
        usagePercent: 0,
        available: 0
      };
    }

    return {
      used: Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024)),
      total: Math.round(memoryInfo.totalJSHeapSize / (1024 * 1024)),
      limit: Math.round(memoryInfo.jsHeapSizeLimit / (1024 * 1024)),
      usagePercent: (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100,
      available: Math.round((memoryInfo.jsHeapSizeLimit - memoryInfo.usedJSHeapSize) / (1024 * 1024))
    };
  }

  updateConfig(newConfig: Partial<GCConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring with new config
    this.stopMonitoring();
    this.startMemoryMonitoring();
  }

  stopMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = undefined;
    }
    if (this.gcInterval) {
      clearInterval(this.gcInterval);
      this.gcInterval = undefined;
    }
  }

  destroy(): void {
    this.stopMonitoring();
    console.log('Garbage collection service destroyed');
  }
}

// Export singleton instance
export const garbageCollectionService = new GarbageCollectionService();
