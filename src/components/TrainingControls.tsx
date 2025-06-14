
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TrainingControlsProps {
  isTraining: boolean;
  startHybridTraining: () => void;
  stopTraining: () => void;
  resetModel: () => void;
}

export const TrainingControls: React.FC<TrainingControlsProps> = ({
  isTraining,
  startHybridTraining,
  stopTraining,
  resetModel
}) => {
  return (
    <div className="flex gap-2 mb-6">
      <Button
        onClick={startHybridTraining}
        disabled={isTraining}
        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
      >
        <Play className="w-4 h-4 mr-1" />
        Antrenare Hibridă
      </Button>
      {isTraining && (
        <Button
          onClick={stopTraining}
          variant="outline"
          className="border-red-400 text-red-400 hover:bg-red-400/20"
        >
          <Pause className="w-4 h-4 mr-1" />
          Oprește
        </Button>
      )}
      <Button
        onClick={resetModel}
        variant="outline"
        disabled={isTraining}
        className="border-white/30 text-white hover:bg-white/20"
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Resetează
      </Button>
    </div>
  );
};
