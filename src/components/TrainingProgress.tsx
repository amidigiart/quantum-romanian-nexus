
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { MLModel } from '@/types/quantumML';

interface TrainingProgressProps {
  isTraining: boolean;
  trainingProgress: number;
  currentModel: MLModel;
}

export const TrainingProgress: React.FC<TrainingProgressProps> = ({
  isTraining,
  trainingProgress,
  currentModel
}) => {
  if (!isTraining && trainingProgress === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-medium">Progres Antrenare Hibridă:</span>
        <span className="text-cyan-400">{trainingProgress.toFixed(1)}%</span>
      </div>
      <Progress value={trainingProgress} className="w-full mb-3" />
      
      {currentModel.epochs > 0 && (
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-400">Epoci</div>
            <div className="text-white font-bold">{currentModel.epochs}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Acuratețe</div>
            <div className="text-green-400 font-bold">{(currentModel.accuracy * 100).toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Loss</div>
            <div className="text-yellow-400 font-bold">{currentModel.loss.toFixed(4)}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Eficiență Hibridă</div>
            <div className="text-purple-400 font-bold">{(currentModel.hybridEfficiency * 100).toFixed(1)}%</div>
          </div>
        </div>
      )}
    </div>
  );
};
