
import { ComponentMemoryThreshold } from './types';

export interface ComponentMemoryUsage {
  componentName: string;
  currentMemoryMB: number;
  lastUpdated: number;
  isOverThreshold: boolean;
  isOverWarning: boolean;
}

export class ComponentMemoryTracker {
  private componentUsage = new Map<string, ComponentMemoryUsage>();
  private thresholds = new Map<string, ComponentMemoryThreshold>();

  updateThresholds(thresholds: ComponentMemoryThreshold[]): void {
    this.thresholds.clear();
    thresholds.forEach(threshold => {
      this.thresholds.set(threshold.componentName, threshold);
    });
  }

  updateComponentMemory(componentName: string, memoryMB: number): ComponentMemoryUsage {
    const threshold = this.thresholds.get(componentName);
    
    const usage: ComponentMemoryUsage = {
      componentName,
      currentMemoryMB: memoryMB,
      lastUpdated: Date.now(),
      isOverThreshold: threshold ? memoryMB > threshold.maxMemoryMB : false,
      isOverWarning: threshold ? memoryMB > threshold.warningThresholdMB : false
    };

    this.componentUsage.set(componentName, usage);
    return usage;
  }

  getComponentUsage(componentName: string): ComponentMemoryUsage | null {
    return this.componentUsage.get(componentName) || null;
  }

  getAllComponentUsage(): ComponentMemoryUsage[] {
    return Array.from(this.componentUsage.values());
  }

  getComponentsOverThreshold(): ComponentMemoryUsage[] {
    return this.getAllComponentUsage().filter(usage => usage.isOverThreshold);
  }

  getComponentsOverWarning(): ComponentMemoryUsage[] {
    return this.getAllComponentUsage().filter(usage => usage.isOverWarning);
  }

  checkComponentThresholds(): {
    overThreshold: ComponentMemoryUsage[];
    overWarning: ComponentMemoryUsage[];
    needsGC: boolean;
  } {
    const overThreshold = this.getComponentsOverThreshold();
    const overWarning = this.getComponentsOverWarning();
    
    return {
      overThreshold,
      overWarning,
      needsGC: overThreshold.length > 0
    };
  }

  getTotalComponentMemory(): number {
    return this.getAllComponentUsage().reduce((total, usage) => total + usage.currentMemoryMB, 0);
  }

  getThresholds(): ComponentMemoryThreshold[] {
    return Array.from(this.thresholds.values());
  }

  logComponentStatus(): void {
    const status = this.checkComponentThresholds();
    
    if (status.overThreshold.length > 0) {
      console.warn('Components over memory threshold:', status.overThreshold.map(u => 
        `${u.componentName}: ${u.currentMemoryMB.toFixed(1)}MB`
      ).join(', '));
    }
    
    if (status.overWarning.length > 0) {
      console.log('Components over warning threshold:', status.overWarning.map(u => 
        `${u.componentName}: ${u.currentMemoryMB.toFixed(1)}MB`
      ).join(', '));
    }
  }
}
