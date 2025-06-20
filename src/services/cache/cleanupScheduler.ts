
export interface CleanupScheduleConfig {
  enabled: boolean;
  interval: number; // in milliseconds
  maxAge: number; // in days
  triggerMemoryThreshold: number; // percentage
  triggerMessageCount: number;
  triggerConversationCount: number;
  enableGCAfterCleanup: boolean;
}

export interface CleanupJob {
  id: string;
  name: string;
  config: CleanupScheduleConfig;
  lastRun: Date | null;
  nextRun: Date | null;
  isRunning: boolean;
}

const DEFAULT_SCHEDULE_CONFIG: CleanupScheduleConfig = {
  enabled: true,
  interval: 24 * 60 * 60 * 1000, // 24 hours
  maxAge: 30, // 30 days
  triggerMemoryThreshold: 80, // 80%
  triggerMessageCount: 1000,
  triggerConversationCount: 100,
  enableGCAfterCleanup: true
};

export class CleanupScheduler {
  private jobs = new Map<string, CleanupJob>();
  private intervals = new Map<string, number>();

  createSchedule(
    id: string,
    name: string,
    config: Partial<CleanupScheduleConfig> = {},
    cleanupCallback: () => Promise<number>
  ): CleanupJob {
    const scheduleConfig = { ...DEFAULT_SCHEDULE_CONFIG, ...config };
    
    const job: CleanupJob = {
      id,
      name,
      config: scheduleConfig,
      lastRun: null,
      nextRun: scheduleConfig.enabled ? new Date(Date.now() + scheduleConfig.interval) : null,
      isRunning: false
    };

    this.jobs.set(id, job);

    if (scheduleConfig.enabled) {
      this.startSchedule(id, cleanupCallback);
    }

    return job;
  }

  private startSchedule(id: string, cleanupCallback: () => Promise<number>): void {
    const job = this.jobs.get(id);
    if (!job || !job.config.enabled) return;

    const intervalId = window.setInterval(async () => {
      await this.executeCleanup(id, cleanupCallback);
    }, job.config.interval);

    this.intervals.set(id, intervalId);
  }

  private async executeCleanup(id: string, cleanupCallback: () => Promise<number>): Promise<void> {
    const job = this.jobs.get(id);
    if (!job || job.isRunning) return;

    try {
      job.isRunning = true;
      job.lastRun = new Date();
      job.nextRun = new Date(Date.now() + job.config.interval);

      console.log(`Executing scheduled cleanup: ${job.name}`);
      const cleanedCount = await cleanupCallback();
      
      console.log(`Scheduled cleanup completed: ${job.name} - cleaned ${cleanedCount} items`);
    } catch (error) {
      console.error(`Error in scheduled cleanup ${job.name}:`, error);
    } finally {
      job.isRunning = false;
    }
  }

  updateSchedule(id: string, config: Partial<CleanupScheduleConfig>): boolean {
    const job = this.jobs.get(id);
    if (!job) return false;

    job.config = { ...job.config, ...config };
    
    // Restart schedule if interval changed or enabled/disabled
    this.stopSchedule(id);
    if (job.config.enabled) {
      // We need the callback, so this will be handled by the caller
      job.nextRun = new Date(Date.now() + job.config.interval);
    } else {
      job.nextRun = null;
    }

    return true;
  }

  stopSchedule(id: string): void {
    const intervalId = this.intervals.get(id);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(id);
    }

    const job = this.jobs.get(id);
    if (job) {
      job.nextRun = null;
    }
  }

  deleteSchedule(id: string): boolean {
    this.stopSchedule(id);
    return this.jobs.delete(id);
  }

  getSchedule(id: string): CleanupJob | undefined {
    return this.jobs.get(id);
  }

  getAllSchedules(): CleanupJob[] {
    return Array.from(this.jobs.values());
  }

  getActiveSchedules(): CleanupJob[] {
    return this.getAllSchedules().filter(job => job.config.enabled);
  }

  destroy(): void {
    for (const id of this.jobs.keys()) {
      this.stopSchedule(id);
    }
    this.jobs.clear();
  }
}

export const cleanupScheduler = new CleanupScheduler();
