
import { DeduplicationStats } from './types';

export class StatsManager {
  private stats: DeduplicationStats;

  constructor() {
    this.resetStats();
  }

  private resetStats(): void {
    this.stats = {
      totalRequests: 0,
      duplicatedRequests: 0,
      uniqueRequests: 0,
      cacheHitRate: 0,
      averageResponseTime: 0,
      semanticMatches: 0,
      exactMatches: 0
    };
  }

  incrementTotalRequests(): void {
    this.stats.totalRequests++;
  }

  incrementDuplicatedRequests(): void {
    this.stats.duplicatedRequests++;
  }

  incrementExactMatches(): void {
    this.stats.exactMatches++;
  }

  incrementSemanticMatches(): void {
    this.stats.semanticMatches++;
  }

  updateAverageResponseTime(responseTime: number): void {
    const uniqueRequests = this.stats.uniqueRequests + 1;
    this.stats.averageResponseTime = 
      (this.stats.averageResponseTime * (uniqueRequests - 1) + responseTime) / uniqueRequests;
  }

  updateStats(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.cacheHitRate = this.stats.duplicatedRequests / this.stats.totalRequests;
      this.stats.uniqueRequests = this.stats.totalRequests - this.stats.duplicatedRequests;
    }
  }

  getStats(): DeduplicationStats {
    this.updateStats();
    return { ...this.stats };
  }

  reset(): void {
    this.resetStats();
  }
}
