
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  recoveryTimeout: number; // Time in ms before attempting recovery
  successThreshold: number; // Number of successes needed to close circuit in half-open state
  timeWindow: number; // Time window in ms for failure counting
  monitoringInterval: number; // Interval for state monitoring
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 60000, // 1 minute
  successThreshold: 3,
  timeWindow: 60000, // 1 minute
  monitoringInterval: 5000 // 5 seconds
};

export interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  totalRequests: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  stateChangedAt: number;
  timeInCurrentState: number;
  failureRate: number;
  requestsInTimeWindow: number;
}

export interface CircuitBreakerMetrics {
  circuitBreakerStats: Record<string, CircuitBreakerStats>;
  totalCircuitBreakers: number;
  openCircuits: number;
  halfOpenCircuits: number;
  closedCircuits: number;
  globalFailureRate: number;
}

export interface CircuitBreakerEventHandlers {
  onStateChange?: (name: string, oldState: CircuitBreakerState, newState: CircuitBreakerState) => void;
  onFailure?: (name: string, error: Error) => void;
  onSuccess?: (name: string, result: any) => void;
  onCircuitOpen?: (name: string, stats: CircuitBreakerStats) => void;
  onCircuitClose?: (name: string, stats: CircuitBreakerStats) => void;
  onHalfOpen?: (name: string, stats: CircuitBreakerStats) => void;
}

export class CircuitBreakerOpenError extends Error {
  constructor(circuitName: string) {
    super(`Circuit breaker '${circuitName}' is open`);
    this.name = 'CircuitBreakerOpenError';
  }
}
