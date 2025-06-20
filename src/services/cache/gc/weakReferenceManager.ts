
export class WeakReferenceManager {
  private componentRefs = new WeakMap<object, string>();
  private eventListeners = new WeakMap<object, Array<{ type: string; handler: EventListener }>>();
  private timeouts = new WeakMap<object, number[]>();
  private intervals = new WeakMap<object, number[]>();
  private observers = new WeakMap<object, Array<MutationObserver | ResizeObserver | IntersectionObserver>>();
  private abortControllers = new WeakMap<object, AbortController[]>();
  
  // Component reference management
  registerComponent(component: object, name: string): void {
    this.componentRefs.set(component, name);
  }

  getComponentName(component: object): string | undefined {
    return this.componentRefs.get(component);
  }

  // Event listener management
  registerEventListener(component: object, type: string, handler: EventListener): void {
    const listeners = this.eventListeners.get(component) || [];
    listeners.push({ type, handler });
    this.eventListeners.set(component, listeners);
  }

  cleanupEventListeners(component: object): void {
    const listeners = this.eventListeners.get(component);
    if (listeners && typeof window !== 'undefined') {
      listeners.forEach(({ type, handler }) => {
        window.removeEventListener(type, handler);
        document.removeEventListener(type, handler);
      });
      this.eventListeners.delete(component);
    }
  }

  // Timeout management
  registerTimeout(component: object, timeoutId: number): void {
    const timeouts = this.timeouts.get(component) || [];
    timeouts.push(timeoutId);
    this.timeouts.set(component, timeouts);
  }

  cleanupTimeouts(component: object): void {
    const timeouts = this.timeouts.get(component);
    if (timeouts) {
      timeouts.forEach(clearTimeout);
      this.timeouts.delete(component);
    }
  }

  // Interval management
  registerInterval(component: object, intervalId: number): void {
    const intervals = this.intervals.get(component) || [];
    intervals.push(intervalId);
    this.intervals.set(component, intervals);
  }

  cleanupIntervals(component: object): void {
    const intervals = this.intervals.get(component);
    if (intervals) {
      intervals.forEach(clearInterval);
      this.intervals.delete(component);
    }
  }

  // Observer management
  registerObserver(component: object, observer: MutationObserver | ResizeObserver | IntersectionObserver): void {
    const observers = this.observers.get(component) || [];
    observers.push(observer);
    this.observers.set(component, observers);
  }

  cleanupObservers(component: object): void {
    const observers = this.observers.get(component);
    if (observers) {
      observers.forEach(observer => observer.disconnect());
      this.observers.delete(component);
    }
  }

  // AbortController management
  registerAbortController(component: object, controller: AbortController): void {
    const controllers = this.abortControllers.get(component) || [];
    controllers.push(controller);
    this.abortControllers.set(component, controllers);
  }

  cleanupAbortControllers(component: object): void {
    const controllers = this.abortControllers.get(component);
    if (controllers) {
      controllers.forEach(controller => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      });
      this.abortControllers.delete(component);
    }
  }

  // Complete cleanup for a component
  cleanupComponent(component: object): void {
    this.cleanupEventListeners(component);
    this.cleanupTimeouts(component);
    this.cleanupIntervals(component);
    this.cleanupObservers(component);
    this.cleanupAbortControllers(component);
    this.componentRefs.delete(component);
  }

  // Get statistics about managed references
  getStats() {
    // Note: WeakMaps don't have a size property, so we can't get exact counts
    // This is by design - WeakMaps don't prevent garbage collection
    return {
      hasComponentRefs: this.componentRefs instanceof WeakMap,
      hasEventListeners: this.eventListeners instanceof WeakMap,
      hasTimeouts: this.timeouts instanceof WeakMap,
      hasIntervals: this.intervals instanceof WeakMap,
      hasObservers: this.observers instanceof WeakMap,
      hasAbortControllers: this.abortControllers instanceof WeakMap
    };
  }

  // Force cleanup of all orphaned references
  forceCleanup(): void {
    // WeakMaps automatically clean up when objects are garbage collected
    // We can't force this, but we can trigger a GC if available
    if (typeof window !== 'undefined' && 'gc' in window && process.env.NODE_ENV === 'development') {
      try {
        (window as any).gc();
      } catch (error) {
        console.debug('Manual GC not available:', error);
      }
    }
  }
}

export const weakReferenceManager = new WeakReferenceManager();
