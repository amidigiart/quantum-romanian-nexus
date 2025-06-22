
import { circuitBreakerManager } from '../../circuitBreaker';
import { CircuitBreakerOpenError } from '../../circuitBreaker/types';

export class CircuitBreakerIntegration {
  generateCircuitBreakerName(context?: any): string {
    if (context?.provider && context?.model) {
      return `${context.provider}-${context.model}`;
    }
    if (context?.provider) {
      return context.provider;
    }
    return 'default-circuit';
  }

  async executeWithCircuitBreaker<T>(
    circuitBreakerName: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    return circuitBreakerManager.executeWithCircuitBreaker(circuitBreakerName, requestFn);
  }

  isCircuitOpen(name: string): boolean {
    return circuitBreakerManager.isCircuitOpen(name);
  }

  getCircuitBreakerStats(name?: string) {
    if (name) {
      return circuitBreakerManager.getCircuitBreakerStats(name);
    }
    return circuitBreakerManager.getAllStats();
  }

  updateCircuitBreakerConfig(name: string, config: any): boolean {
    return circuitBreakerManager.updateCircuitBreakerConfig(name, config);
  }

  handleCircuitBreakerError(error: Error): Error {
    if (error instanceof CircuitBreakerOpenError) {
      const friendlyError = new Error(
        'Service is temporarily unavailable due to too many failures. Please try again later.'
      );
      friendlyError.name = 'ServiceUnavailableError';
      return friendlyError;
    }
    return error;
  }
}

export const circuitBreakerIntegration = new CircuitBreakerIntegration();
