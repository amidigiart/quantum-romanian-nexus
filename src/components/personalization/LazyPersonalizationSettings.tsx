
import React, { Suspense } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain } from 'lucide-react';

const PersonalizationSettings = React.lazy(() => 
  import('./PersonalizationSettings').then(module => ({ default: module.PersonalizationSettings }))
);

export const LazyPersonalizationSettings: React.FC = () => {
  return (
    <Suspense fallback={
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-6 h-6 text-cyan-400" />
          <Skeleton className="h-6 w-48 bg-white/20" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-32 bg-white/20" />
              <Skeleton className="h-10 w-full bg-white/20" />
            </div>
          ))}
        </div>
      </Card>
    }>
      <PersonalizationSettings />
    </Suspense>
  );
};
