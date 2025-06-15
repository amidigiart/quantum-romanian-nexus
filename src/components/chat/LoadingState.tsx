
import React from 'react';
import { Card } from '@/components/ui/card';
import { Atom } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Atom className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-white">Se încarcă conversația...</p>
        </div>
      </div>
    </Card>
  );
};
