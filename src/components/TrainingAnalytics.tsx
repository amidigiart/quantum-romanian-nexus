
import React from 'react';
import { Activity } from 'lucide-react';
import { TrainingMetrics } from '@/types/quantumML';

interface TrainingAnalyticsProps {
  trainingHistory: TrainingMetrics[];
}

export const TrainingAnalytics: React.FC<TrainingAnalyticsProps> = ({
  trainingHistory
}) => {
  if (trainingHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-500 mx-auto mb-2" />
        <p className="text-gray-400">Începeți antrenarea pentru a vedea analiza detaliată...</p>
      </div>
    );
  }

  return (
    <div className="bg-black/30 rounded-lg p-4">
      <h4 className="text-white font-semibold mb-3">Analiză Detaliată Antrenare:</h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {trainingHistory.slice(-8).reverse().map((metric, index) => (
          <div key={index} className="p-3 bg-white/10 rounded border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-cyan-400 text-sm font-medium">Epoca {metric.epoch}</span>
              <div className="flex gap-3 text-xs">
                <span className="text-green-400">Acc: {(metric.accuracy * 100).toFixed(1)}%</span>
                <span className="text-yellow-400">Loss: {metric.loss.toFixed(4)}</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-purple-400">
                <span className="text-gray-400">Q-Avantaj:</span> +{(metric.quantumAdvantage * 100).toFixed(1)}%
              </div>
              <div className="text-blue-400">
                <span className="text-gray-400">Clasic:</span> {(metric.classicalComponent * 100).toFixed(1)}%
              </div>
              <div className="text-purple-400">
                <span className="text-gray-400">Cuantic:</span> {(metric.quantumComponent * 100).toFixed(1)}%
              </div>
              <div className="text-emerald-400">
                <span className="text-gray-400">Hibrid:</span> {(metric.hybridScore * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
