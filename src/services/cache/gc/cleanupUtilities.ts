
import { weakReferenceManager } from './weakReferenceManager';

export class CleanupUtilities {
  private orphanedElements = new WeakSet<Element>();
  private temporaryObjects = new WeakMap<object, { created: number; type: string }>();

  performManualCleanup(): void {
    // Clear any temporary objects or references
    if (typeof window !== 'undefined') {
      // Clear cached DOM queries using WeakMap approach
      this.cleanupOrphanedDOMElements();
      
      // Clear any temporary event listeners or intervals
      this.cleanupTemporaryResources();
      
      // Force cleanup of weak references
      weakReferenceManager.forceCleanup();
    }
  }

  private cleanupOrphanedDOMElements(): void {
    // Find elements that are no longer connected to the DOM
    const cachedElements = document.querySelectorAll('[data-cache-cleanup]');
    cachedElements.forEach(el => {
      if (!el.isConnected) {
        this.orphanedElements.add(el);
        el.removeAttribute('data-cache-cleanup');
      }
    });
  }

  private cleanupTemporaryResources(): void {
    // Clear any orphaned intervals or timeouts
    // This is a basic implementation - in a real app, you'd track these with WeakMaps
    const highestTimeoutId = window.setTimeout(() => {}, 0);
    const timeoutIdNumber = Number(highestTimeoutId);
    
    for (let i = 0; i < Math.min(timeoutIdNumber, 1000); i++) {
      const element = document.querySelector(`[data-timeout-id="${i}"]`);
      if (element && !element.isConnected) {
        clearTimeout(i);
      }
    }
  }

  // Register a temporary object for tracking
  registerTemporaryObject(obj: object, type: string): void {
    this.temporaryObjects.set(obj, {
      created: Date.now(),
      type
    });
  }

  // Check if an object is registered as temporary
  isTemporaryObject(obj: object): boolean {
    return this.temporaryObjects.has(obj);
  }

  // Get temporary object info
  getTemporaryObjectInfo(obj: object) {
    return this.temporaryObjects.get(obj);
  }

  // Create a cleanup function that can be safely stored in a WeakMap
  createCleanupFunction(component: object): () => void {
    return () => {
      weakReferenceManager.cleanupComponent(component);
      this.temporaryObjects.delete(component);
    };
  }

  isGCAvailable(): boolean {
    return process.env.NODE_ENV === 'development' && 
           typeof window !== 'undefined' && 
           'gc' in window;
  }

  triggerBrowserGC(): boolean {
    try {
      if (this.isGCAvailable()) {
        (window as any).gc();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error triggering browser GC:', error);
      return false;
    }
  }

  // Get cleanup statistics
  getCleanupStats() {
    return {
      weakReferenceStats: weakReferenceManager.getStats(),
      hasOrphanedElements: this.orphanedElements instanceof WeakSet,
      hasTemporaryObjects: this.temporaryObjects instanceof WeakMap
    };
  }
}
