
import React from 'react';
import { Button } from '@/components/ui/button';
import { Activity, Layers, Cpu } from 'lucide-react';
import { HybridMode, MLModel } from '@/types/quantumML';
import { hybridStrategies } from '@/utils/quantumMLUtils';

interface HybridStrategyProps {
  hybridMode: HybridMode;
  setHybridMode: (mode: HybridMode) => void;
  isTraining: boolean;
  currentModel: MLModel;
}

export const HybridStrategy: React.FC<HybridStrategyProps> = ({
  hybridMode,
  setHybridMode,
  isTraining,
  currentModel
}) => {
  return (
    <div className="space-y-6">
      {/* Hybrid Strategy Selection */}
      <div>
        <h4 className="text-white font-semibold mb-3">Strategie de Integrare:</h4>
        <div className="grid grid-cols-1 gap-3">
          {Object.entries(hybridStrategies).map(([key, description]) => (
            <Button
              key={key}
              variant={hybridMode === key ? "default" : "outline"}
              onClick={() => setHybridMode(key as HybridMode)}
              disabled={isTraining}
              className={`flex flex-col items-start gap-2 p-4 h-auto ${
                hybridMode === key 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500' 
                  : 'border-white/30 text-white hover:bg-white/20'
              }`}
            >
              <span className="font-medium capitalize">{key.replace('-', ' ')}</span>
              <span className="text-sm text-gray-300">{description}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Hybrid Architecture Visualization */}
      <div className="bg-black/30 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Arhitectură Hibridă - {currentModel.name}
        </h4>
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-2">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <div className="text-xs text-purple-400">{currentModel.quantumLayers} Straturi Cuantice</div>
          </div>
          <div className="flex-1 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded"></div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-2">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div className="text-xs text-blue-400">{currentModel.classicalLayers} Straturi Clasice</div>
          </div>
        </div>
      </div>
    </div>
  );
};
