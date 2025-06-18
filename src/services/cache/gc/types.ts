
// Define MemoryInfo interface since it's not available in all environments
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

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

export type GCReason = 'manual' | 'pressure' | 'scheduled' | 'cleanup';
