
import { CircuitBreaker } from './circuitBreaker';
import { CircuitBreakerConfig, CircuitBreakerEventHandlers, CircuitBreakerMetrics, CircuitBreakerStats } from './types';

export class CircuitBreakerManager {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private globalEventHandlers: CircuitBreakerEventHandlers;

  constructor(eventHandlers?: CircuitBreakerEventHandlers) {
    this.globalEventHandlers = {
      onStateChange: (name, oldState, newState) => {
        console.log(`Global: Circuit breaker '${name}' changed from ${oldState} to ${newState}`);
        eventHandlers?.onStateChange?.(name, oldState, newState);
      },
      onCircuitOpen: (name, stats) => {
        console.log(`Global: Circuit breaker '${name}' opened`, stats);
        eventHandlers?.onCircuitOpen?.(name, stats);
      },
      onCircuitClose: (name, stats) => {
        console.log(`Global: Circuit breaker '${name}' closed`, stats);
        eventHandlers?.onCircuitClose?.(name, stats);
      },
      ...eventHandlers
    };
  }

  getOrCreateCircuitBreaker(
    name: string,
    config?: Partial<CircuitBreakerConfig>,
    eventHandlers?: CircuitBreakerEventHandlers
  ): CircuitBreaker {
    if (!this.circuitBreakers.has(name)) {
      const mergedHandlers = { ...this.globalEventHandlers, ...eventHandlers };
      const circuitBreaker = new CircuitBreaker(name, config, mergedHandlers);
      this.circuitBreakers.set(name, circuitBreaker);
      console.log(`Created circuit breaker: ${name}`);
    }
    return this.circuitBreakers.get(name)!;
  }

  async executeWithCircuitBreaker<T>(
    name: string,
    operation: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>
  ): Promise<T> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(name, config);
    return circuitBreaker.execute(operation);
  }

  getCircuitBreakerStats(name: string): CircuitBreakerStats | null {
    const circuitBreaker = this.circuitBreakers.get(name);
    return circuitBreaker ? circuitBreaker.getStats() : null;
  }

  getAllStats(): CircuitBreakerMetrics {
    const stats: Record<string, CircuitBreakerStats> = {};
    let openCircuits = 0;
    let halfOpenCircuits = 0;
    let closedCircuits = 0;
    let totalRequests = 0;
    let totalFailures = 0;

    this.circuitBreakers.forEach((circuitBreaker, name) => {
      const circuitStats = circuitBreaker.getStats();
      stats[name] = circuitStats;

      switch (circuitStats.state) {
        case 'OPEN':
          openCircuits++;
          break;
        case 'HALF_OPEN':
          halfOpenCircuits++;
          break;
        case 'CLOSED':
          closedCircuits++;
          break;
      }

      totalRequests += circuitStats.totalRequests;
      totalFailures += circuitStats.failureCount;
    });

    return {
      circuitBreakerStats: stats,
      totalCircuitBreakers: this.circuitBreakers.size,
      openCircuits,
      halfOpenCircuits,
      closedCircuits,
      globalFailureRate: totalRequests > 0 ? totalFailures / totalRequests : 0
    };
  }

  removeCircuitBreaker(name: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (circuitBreaker) {
      circuitBreaker.destroy();
      this.circuitBreakers.delete(name);
      console.log(`Removed circuit breaker: ${name}`);
      return true;
    }
    return false;
  }

  updateCircuitBreakerConfig(name: string, config: Partial<CircuitBreakerConfig>): boolean {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (circuitBreaker) {
      circuitBreaker.updateConfig(config);
      return true;
    }
    return false;
  }

  getCircuitBreakerNames(): string[] {
    return Array.from(this.circuitBreakers.keys());
  }

  clearAllCircuitBreakers(): void {
    this.circuitBreakers.forEach((circuitBreaker) => {
      circuitBreaker.destroy();
    });
    this.circuitBreakers.clear();
    console.log('Cleared all circuit breakers');
  }

  isCircuitOpen(name: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(name);
    return circuitBreaker ? circuitBreaker.getState() === 'OPEN' : false;
  }
}

export const circuitBreakerManager = new CircuitBreakerManager();
