
import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  threshold?: number;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({
  children,
  fallback,
  priority = 'medium',
  delay = 0,
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority === 'high');
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority === 'high') {
      // High priority items load immediately
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }

    // Use Intersection Observer for lower priority items
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          const timer = setTimeout(() => setIsVisible(true), delay);
          return () => clearTimeout(timer);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [priority, delay, threshold]);

  if (!shouldLoad) {
    return (
      <div ref={elementRef} className="progressive-placeholder">
        {fallback || <Skeleton className="h-32 w-full bg-white/10" />}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={`progressive-content transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
};
