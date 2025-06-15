
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AIProviderSelector = React.lazy(() => 
  import('./AIProviderSelector').then(module => ({ default: module.AIProviderSelector }))
);

interface LazyAIProviderSelectorProps {
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (providerId: string) => void;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export const LazyAIProviderSelector: React.FC<LazyAIProviderSelectorProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-3 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
        <Skeleton className="h-4 w-24 bg-white/20" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Skeleton className="h-10 bg-white/20" />
          <Skeleton className="h-10 bg-white/20" />
        </div>
      </div>
    }>
      <AIProviderSelector {...props} />
    </Suspense>
  );
};
