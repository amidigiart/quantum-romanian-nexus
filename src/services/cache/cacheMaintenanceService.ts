
import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';
import { garbageCollectionService } from './gc/garbageCollectionService';

export class CacheMaintenanceService {
  private maintenanceInterval: number | null = null;
  private lastMaintenanceTime = 0;

  constructor(
    private memoryCache: MemoryCacheManager,
    private sessionCache: SessionCacheManager
  ) {}

  startPeriodicMaintenance(): void {
    this.maintenanceInterval = window.setInterval(async () => {
      await this.performMaintenance();
    }, 60000); // Every minute
  }

  private async performMaintenance(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Clean up expired entries
      const memoryCleanedCount = await this.memoryCache.cleanupExpired();
      const sessionCleanedCount = await this.sessionCache.cleanupExpired();
      const totalCleaned = memoryCleanedCount + sessionCleanedCount;

      // Check if we need to trigger GC
      const shouldTriggerGC = this.shouldTriggerGC(totalCleaned);
      
      if (shouldTriggerGC) {
        garbageCollectionService.forceGarbageCollection('cleanup');
      }

      this.lastMaintenanceTime = startTime;

      if (totalCleaned > 0) {
        console.log(`Cache maintenance: cleaned ${totalCleaned} expired entries${shouldTriggerGC ? ' (GC triggered)' : ''}`);
      }
    } catch (error) {
      console.error('Error during cache maintenance:', error);
    }
  }

  private shouldTriggerGC(cleanedCount: number): boolean {
    const memoryStats = garbageCollectionService.getMemoryStats();
    const timeSinceLastMaintenance = Date.now() - this.lastMaintenanceTime;
    
    // Trigger GC if:
    // 1. We cleaned a significant number of entries
    // 2. Memory usage is high
    // 3. It's been a while since last maintenance
    return cleanedCount > 10 || 
           memoryStats.usagePercent > 70 || 
           timeSinceLastMaintenance > 5 * 60 * 1000; // 5 minutes
  }

  async forceCleanup(): Promise<void> {
    await this.performMaintenance();
    garbageCollectionService.forceGarbageCollection('manual');
  }

  stopPeriodicMaintenance(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }
  }

  getMaintenanceStats() {
    return {
      lastMaintenanceTime: this.lastMaintenanceTime,
      isRunning: this.maintenanceInterval !== null,
      gcMetrics: garbageCollectionService.getGCMetrics(),
      memoryStats: garbageCollectionService.getMemoryStats()
    };
  }
}
