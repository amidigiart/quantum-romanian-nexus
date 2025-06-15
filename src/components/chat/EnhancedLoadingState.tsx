
import React from 'react';
import { Card } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export const EnhancedLoadingState = React.memo(() => {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
          <p className="text-white">Se încarcă sistemul AI avansat...</p>
        </div>
      </div>
    </Card>
  );
});

EnhancedLoadingState.displayName = 'EnhancedLoadingState';
