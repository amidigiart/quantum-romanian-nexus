
import { MemoryInfo, GCConfig } from './types';

export class MemoryMonitor {
  constructor(private config: GCConfig) {}

  getMemoryInfo(): MemoryInfo | null {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      return (window.performance as any).memory as MemoryInfo;
    }
    return null;
  }

  getCurrentMemoryUsage(): number {
    const memoryInfo = this.getMemoryInfo();
    return memoryInfo ? memoryInfo.usedJSHeapSize / (1024 * 1024) : 0;
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

  checkMemoryPressure(): boolean {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return false;

    const memoryUsageMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
    const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;

    return memoryUsageMB > this.config.memoryThresholdMB || 
           memoryUsagePercent > this.config.maxMemoryUsagePercent;
  }

  logMemoryPressure(): void {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return;

    const memoryUsageMB = memoryInfo.usedJSHeapSize / (1024 * 1024);
    const memoryUsagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;

    console.log(`Memory pressure detected: ${memoryUsageMB.toFixed(1)}MB (${memoryUsagePercent.toFixed(1)}%)`);
  }
}
