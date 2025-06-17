
import { MemoryCacheManager } from './memoryCacheManager';
import { SessionCacheManager } from './sessionCacheManager';

export class CacheMaintenanceService {
  private maintenanceInterval: number | null = null;

  constructor(
    private memoryCache: MemoryCacheManager,
    private sessionCache: SessionCacheManager
  ) {}

  startPeriodicMaintenance(): void {
    this.maintenanceInterval = window.setInterval(() => {
      this.memoryCache.cleanupExpired();
      this.sessionCache.cleanupExpired();
    }, 60000); // Every minute
  }

  stopPeriodicMaintenance(): void {
    if (this.maintenanceInterval) {
      clearInterval(this.maintenanceInterval);
      this.maintenanceInterval = null;
    }
  }
}
