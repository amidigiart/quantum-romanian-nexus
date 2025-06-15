
import React, { Suspense } from 'react';
import { ProgressiveLoader } from './ProgressiveLoader';
import { Skeleton } from '@/components/ui/skeleton';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  priority?: 'high' | 'medium' | 'low';
  delay?: number;
  className?: string;
}

export const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  priority = 'medium',
  delay = 0,
  className = ''
}) => {
  const defaultFallback = (
    <div className={`space-y-3 ${className}`}>
      <Skeleton className="h-4 w-3/4 bg-white/10" />
      <Skeleton className="h-4 w-1/2 bg-white/10" />
      <Skeleton className="h-32 w-full bg-white/10" />
    </div>
  );

  return (
    <ProgressiveLoader
      priority={priority}
      delay={delay}
      fallback={fallback || defaultFallback}
    >
      <Suspense fallback={fallback || defaultFallback}>
        <div className={className}>
          {children}
        </div>
      </Suspense>
    </ProgressiveLoader>
  );
};
