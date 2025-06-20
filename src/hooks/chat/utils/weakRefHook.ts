
import { useEffect, useRef } from 'react';
import { weakReferenceManager } from '@/services/cache/gc/weakReferenceManager';

// Custom hook for managing component lifecycle with WeakMaps
export const useWeakReference = (componentName: string) => {
  const componentRef = useRef<object>({});
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const component = componentRef.current;
    
    // Register the component with weak reference manager
    weakReferenceManager.registerComponent(component, componentName);
    
    // Create cleanup function
    cleanupRef.current = () => {
      weakReferenceManager.cleanupComponent(component);
    };

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [componentName]);

  // Helper functions for registering resources
  const registerTimeout = (timeoutId: number) => {
    weakReferenceManager.registerTimeout(componentRef.current, timeoutId);
  };

  const registerInterval = (intervalId: number) => {
    weakReferenceManager.registerInterval(componentRef.current, intervalId);
  };

  const registerEventListener = (type: string, handler: EventListener) => {
    weakReferenceManager.registerEventListener(componentRef.current, type, handler);
  };

  const registerObserver = (observer: MutationObserver | ResizeObserver | IntersectionObserver) => {
    weakReferenceManager.registerObserver(componentRef.current, observer);
  };

  const registerAbortController = (controller: AbortController) => {
    weakReferenceManager.registerAbortController(componentRef.current, controller);
  };

  return {
    componentRef: componentRef.current,
    registerTimeout,
    registerInterval,
    registerEventListener,
    registerObserver,
    registerAbortController,
    cleanup: cleanupRef.current
  };
};

// Hook for creating weak references to objects
export const useWeakMap = <K extends object, V>() => {
  const weakMapRef = useRef(new WeakMap<K, V>());

  const set = (key: K, value: V) => {
    weakMapRef.current.set(key, value);
  };

  const get = (key: K): V | undefined => {
    return weakMapRef.current.get(key);
  };

  const has = (key: K): boolean => {
    return weakMapRef.current.has(key);
  };

  const remove = (key: K): boolean => {
    return weakMapRef.current.delete(key);
  };

  return { set, get, has, remove };
};

// Hook for creating weak sets
export const useWeakSet = <T extends object>() => {
  const weakSetRef = useRef(new WeakSet<T>());

  const add = (value: T) => {
    weakSetRef.current.add(value);
  };

  const has = (value: T): boolean => {
    return weakSetRef.current.has(value);
  };

  const remove = (value: T): boolean => {
    return weakSetRef.current.delete(value);
  };

  return { add, has, remove };
};
