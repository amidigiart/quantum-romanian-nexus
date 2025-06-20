
import { GCMetrics, GCConfig, GCReason, ComponentMemoryThreshold } from './types';
import { MemoryMonitor } from './memoryMonitor';
import { CleanupUtilities } from './cleanupUtilities';
import { MetricsTracker } from './metricsTracker';
import { ComponentMemoryTracker, ComponentMemoryUsage } from './componentMemoryTracker';

const DEFAULT_COMPONENT_THRESHOLDS: ComponentMemoryThreshold[] = [
  { componentName: 'chat-messages', maxMemoryMB: 50, warningThresholdMB: 35, enabled: true },
  { componentName: 'cache-memory', maxMemoryMB: 100, warningThresholdMB: 80, enabled: true },
  { componentName: 'websocket-pool', maxMemoryMB: 20, warningThresholdMB: 15, enabled: true },
  { componentName: 'conversation-history', maxMemoryMB: 75, warningThresholdMB: 60, enabled: true },
  { componentName: 'personalization-data', maxMemoryMB: 25, warningThresholdMB: 20, enabled: true }
];

export class GarbageCollectionService {
  private config: GCConfig;
  private gcInterval?: number;
  private memoryCheckInterval?: number;
  private componentCheckInterval?: number;
  private memoryMonitor: MemoryMonitor;
  private cleanupUtilities: CleanupUtilities;
  private metricsTracker: MetricsTracker;
  private componentTracker: ComponentMemoryTracker;

  constructor(config: Partial<GCConfig> = {}) {
    this.config = {
      memoryThresholdMB: 100,
      forceGCInterval: 5 * 60 * 1000, // 5 minutes
      maxMemoryUsagePercent: 80,
      enableAutoGC: true,
      componentThresholds: DEFAULT_COMPONENT_THRESHOLDS,
      ...config
    };

    this.memoryMonitor = new MemoryMonitor(this.config);
    this.cleanupUtilities = new CleanupUtilities();
    this.metricsTracker = new MetricsTracker();
    this.componentTracker = new ComponentMemoryTracker();

    this.componentTracker.updateThresholds(this.config.componentThresholds);
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring(): void {
    if (!this.config.enableAutoGC) return;

    // Check system memory usage every 30 seconds
    this.memoryCheckInterval = window.setInterval(() => {
      this.checkMemoryPressure();
    }, 30000);

    // Check component memory usage every 15 seconds
    this.componentCheckInterval = window.setInterval(() => {
      this.checkComponentMemoryPressure();
    }, 15000);

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

  private checkComponentMemoryPressure(): void {
    const status = this.componentTracker.checkComponentThresholds();
    
    if (status.needsGC) {
      console.log('Component memory threshold exceeded, triggering GC');
      this.componentTracker.logComponentStatus();
      this.forceGarbageCollection('component-threshold');
    }
  }

  // Public method to update component memory usage
  updateComponentMemory(componentName: string, memoryMB: number): ComponentMemoryUsage {
    return this.componentTracker.updateComponentMemory(componentName, memoryMB);
  }

  // Get component memory status
  getComponentMemoryStatus() {
    return {
      components: this.componentTracker.getAllComponentUsage(),
      overThreshold: this.componentTracker.getComponentsOverThreshold(),
      overWarning: this.componentTracker.getComponentsOverWarning(),
      totalComponentMemory: this.componentTracker.getTotalComponentMemory(),
      thresholds: this.componentTracker.getThresholds()
    };
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
    
    // Update component thresholds if provided
    if (newConfig.componentThresholds) {
      this.componentTracker.updateThresholds(newConfig.componentThresholds);
    }
    
    // Restart monitoring with new config
    this.stopMonitoring();
    this.memoryMonitor = new MemoryMonitor(this.config);
    this.startMemoryMonitoring();
  }

  // Add or update a component threshold
  updateComponentThreshold(threshold: ComponentMemoryThreshold): void {
    const existingIndex = this.config.componentThresholds.findIndex(
      t => t.componentName === threshold.componentName
    );
    
    if (existingIndex >= 0) {
      this.config.componentThresholds[existingIndex] = threshold;
    } else {
      this.config.componentThresholds.push(threshold);
    }
    
    this.componentTracker.updateThresholds(this.config.componentThresholds);
  }

  // Remove a component threshold
  removeComponentThreshold(componentName: string): void {
    this.config.componentThresholds = this.config.componentThresholds.filter(
      t => t.componentName !== componentName
    );
    this.componentTracker.updateThresholds(this.config.componentThresholds);
  }

  stopMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
      this.memoryCheckInterval = undefined;
    }
    if (this.componentCheckInterval) {
      clearInterval(this.componentCheckInterval);
      this.componentCheckInterval = undefined;
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

// Export singleton instance with component thresholds
export const garbageCollectionService = new GarbageCollectionService();
