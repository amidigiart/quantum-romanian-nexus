
import { GCMetrics, GCConfig, GCReason } from './types';
import { MemoryMonitor } from './memoryMonitor';
import { CleanupUtilities } from './cleanupUtilities';
import { MetricsTracker } from './metricsTracker';

export class GarbageCollectionService {
  private config: GCConfig;
  private gcInterval?: number;
  private memoryCheckInterval?: number;
  private memoryMonitor: MemoryMonitor;
  private cleanupUtilities: CleanupUtilities;
  private metricsTracker: MetricsTracker;

  constructor(config: Partial<GCConfig> = {}) {
    this.config = {
      memoryThresholdMB: 100,
      forceGCInterval: 5 * 60 * 1000, // 5 minutes
      maxMemoryUsagePercent: 80,
      enableAutoGC: true,
      ...config
    };

    this.memoryMonitor = new MemoryMonitor(this.config);
    this.cleanupUtilities = new CleanupUtilities();
    this.metricsTracker = new MetricsTracker();

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
    if (this.memoryMonitor.checkMemoryPressure()) {
      this.memoryMonitor.logMemoryPressure();
      this.forceGarbageCollection('pressure');
    }
  }

  forceGarbageCollection(reason: GCReason): boolean {
    const startTime = performance.now();
    const memoryBefore = this.memoryMonitor.getCurrentMemoryUsage();

    try {
      // Trigger browser GC if available (development only)
      this.cleanupUtilities.triggerBrowserGC();

      // Manual cleanup strategies
      this.cleanupUtilities.performManualCleanup();

      const endTime = performance.now();
      const memoryAfter = this.memoryMonitor.getCurrentMemoryUsage();
      const gcTime = endTime - startTime;

      this.metricsTracker.updateMetrics(memoryBefore, memoryAfter, gcTime);
      this.metricsTracker.logGCResult(reason, memoryBefore - memoryAfter, gcTime);
      
      return true;
    } catch (error) {
      console.error('Error during garbage collection:', error);
      return false;
    }
  }

  getGCMetrics(): GCMetrics {
    return this.metricsTracker.getMetrics();
  }

  getMemoryStats() {
    return this.memoryMonitor.getMemoryStats();
  }

  updateConfig(newConfig: Partial<GCConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring with new config
    this.stopMonitoring();
    this.memoryMonitor = new MemoryMonitor(this.config);
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
