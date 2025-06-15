
/**
 * Creates a debounced version of a function that delays invoking func until after wait milliseconds have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      func(...args);
    }
  };
}

/**
 * Creates a debounced version that also cancels previous calls
 */
export function debouncedCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number
): {
  execute: (...args: Parameters<T>) => Promise<ReturnType<T>>;
  cancel: () => void;
} {
  let timeoutId: NodeJS.Timeout | null = null;
  let resolvePromise: ((value: any) => void) | null = null;
  let rejectPromise: ((reason: any) => void) | null = null;

  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (rejectPromise) {
      rejectPromise(new Error('Debounced call cancelled'));
      resolvePromise = null;
      rejectPromise = null;
    }
  };

  const execute = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    cancel();

    return new Promise((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await callback(...args);
          if (resolvePromise) {
            resolvePromise(result);
          }
        } catch (error) {
          if (rejectPromise) {
            rejectPromise(error);
          }
        } finally {
          timeoutId = null;
          resolvePromise = null;
          rejectPromise = null;
        }
      }, delay);
    });
  };

  return { execute, cancel };
}
