
import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const EnhancedChatInterface = React.lazy(() => 
  import('./EnhancedChatInterface').then(module => ({ default: module.EnhancedChatInterface }))
);

export const LazyEnhancedChatInterface: React.FC = () => {
  return (
    <Suspense fallback={
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
        <div className="space-y-4">
          <Skeleton className="h-6 w-64 bg-white/20" />
          <Skeleton className="h-16 w-full bg-white/20" />
          <Skeleton className="h-64 w-full bg-white/20" />
          <Skeleton className="h-12 w-full bg-white/20" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 bg-white/20" />
            ))}
          </div>
        </div>
      </Card>
    }>
      <EnhancedChatInterface />
    </Suspense>
  );
};
