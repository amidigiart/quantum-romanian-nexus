
import { GCMetrics } from './types';

export class MetricsTracker {
  private metrics: GCMetrics = {
    lastGCTime: 0,
    gcCount: 0,
    memoryBeforeGC: 0,
    memoryAfterGC: 0,
    memoryFreed: 0,
    averageGCTime: 0
  };

  updateMetrics(memoryBefore: number, memoryAfter: number, gcTime: number): void {
    const memoryFreed = Math.max(0, memoryBefore - memoryAfter);
    
    this.metrics.lastGCTime = Date.now();
    this.metrics.gcCount++;
    this.metrics.memoryBeforeGC = memoryBefore;
    this.metrics.memoryAfterGC = memoryAfter;
    this.metrics.memoryFreed = memoryFreed;
    
    // Calculate rolling average GC time
    this.metrics.averageGCTime = 
      (this.metrics.averageGCTime * (this.metrics.gcCount - 1) + gcTime) / this.metrics.gcCount;
  }

  getMetrics(): GCMetrics {
    return { ...this.metrics };
  }

  logGCResult(reason: string, memoryFreed: number, gcTime: number): void {
    console.log(`GC triggered (${reason}): ${memoryFreed.toFixed(1)}MB freed in ${gcTime.toFixed(1)}ms`);
  }
}
