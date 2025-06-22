
import { CircuitBreakerState, CircuitBreakerConfig, CircuitBreakerStats, CircuitBreakerEventHandlers, CircuitBreakerOpenError, DEFAULT_CIRCUIT_BREAKER_CONFIG } from './types';

export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private totalRequests = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private stateChangedAt: number;
  private requestTimestamps: number[] = [];
  private config: CircuitBreakerConfig;
  private eventHandlers: CircuitBreakerEventHandlers;
  private monitoringTimer?: NodeJS.Timeout;

  constructor(
    private name: string,
    config?: Partial<CircuitBreakerConfig>,
    eventHandlers?: CircuitBreakerEventHandlers
  ) {
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
    this.eventHandlers = eventHandlers || {};
    this.stateChangedAt = Date.now();
    this.startMonitoring();
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.transitionToHalfOpen();
      } else {
        throw new CircuitBreakerOpenError(this.name);
      }
    }

    this.totalRequests++;
    this.addRequestTimestamp();

    try {
      const result = await operation();
      this.onSuccess(result);
      return result;
    } catch (error) {
      this.onFailure(error as Error);
      throw error;
    }
  }

  private onSuccess(result: any): void {
    this.successCount++;
    this.lastSuccessTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      if (this.successCount >= this.config.successThreshold) {
        this.transitionToState('CLOSED');
        this.resetCounters();
      }
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success in closed state
      this.failureCount = 0;
    }

    this.eventHandlers.onSuccess?.(this.name, result);
  }

  private onFailure(error: Error): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.transitionToState('OPEN');
    } else if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
      this.transitionToState('OPEN');
    }

    this.eventHandlers.onFailure?.(this.name, error);
  }

  private shouldAttemptReset(): boolean {
    const now = Date.now();
    const timeSinceLastFailure = this.lastFailureTime ? now - this.lastFailureTime : 0;
    return timeSinceLastFailure >= this.config.recoveryTimeout;
  }

  private transitionToHalfOpen(): void {
    this.transitionToState('HALF_OPEN');
    this.successCount = 0;
    this.eventHandlers.onHalfOpen?.(this.name, this.getStats());
  }

  private transitionToState(newState: CircuitBreakerState): void {
    const oldState = this.state;
    this.state = newState;
    this.stateChangedAt = Date.now();

    console.log(`Circuit breaker '${this.name}' transitioned from ${oldState} to ${newState}`);

    if (newState === 'OPEN') {
      this.eventHandlers.onCircuitOpen?.(this.name, this.getStats());
    } else if (newState === 'CLOSED') {
      this.eventHandlers.onCircuitClose?.(this.name, this.getStats());
    }

    this.eventHandlers.onStateChange?.(this.name, oldState, newState);
  }

  private resetCounters(): void {
    this.failureCount = 0;
    this.successCount = 0;
  }

  private addRequestTimestamp(): void {
    const now = Date.now();
    this.requestTimestamps.push(now);
    
    // Remove timestamps outside the time window
    const cutoff = now - this.config.timeWindow;
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > cutoff);
  }

  private startMonitoring(): void {
    this.monitoringTimer = setInterval(() => {
      this.cleanupOldTimestamps();
    }, this.config.monitoringInterval);
  }

  private cleanupOldTimestamps(): void {
    const now = Date.now();
    const cutoff = now - this.config.timeWindow;
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > cutoff);
  }

  getStats(): CircuitBreakerStats {
    const now = Date.now();
    const requestsInWindow = this.requestTimestamps.length;
    const failuresInWindow = this.requestTimestamps.filter(ts => {
      return this.lastFailureTime && ts >= this.lastFailureTime - this.config.timeWindow;
    }).length;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalRequests: this.totalRequests,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      timeInCurrentState: now - this.stateChangedAt,
      failureRate: requestsInWindow > 0 ? failuresInWindow / requestsInWindow : 0,
      requestsInTimeWindow: requestsInWindow
    };
  }

  getName(): string {
    return this.name;
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  updateConfig(config: Partial<CircuitBreakerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): CircuitBreakerConfig {
    return { ...this.config };
  }

  destroy(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }
  }
}
