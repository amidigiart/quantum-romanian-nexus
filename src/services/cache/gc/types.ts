
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

export interface ComponentMemoryThreshold {
  componentName: string;
  maxMemoryMB: number;
  warningThresholdMB: number;
  enabled: boolean;
}

export interface GCConfig {
  memoryThresholdMB: number;
  forceGCInterval: number;
  maxMemoryUsagePercent: number;
  enableAutoGC: boolean;
  componentThresholds: ComponentMemoryThreshold[];
}

export type GCReason = 'manual' | 'pressure' | 'scheduled' | 'cleanup' | 'component-threshold';
