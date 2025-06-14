
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Cpu } from 'lucide-react';
import { MLModel } from '@/types/quantumML';

interface ModelSelectionProps {
  models: Record<string, MLModel>;
  activeModel: string;
  setActiveModel: (model: string) => void;
  isTraining: boolean;
}

export const ModelSelection: React.FC<ModelSelectionProps> = ({
  models,
  activeModel,
  setActiveModel,
  isTraining
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {Object.entries(models).map(([key, model]) => (
        <Button
          key={key}
          variant={activeModel === key ? "default" : "outline"}
          onClick={() => !isTraining && setActiveModel(key)}
          disabled={isTraining}
          className={`flex flex-col items-start gap-3 p-4 h-auto ${
            activeModel === key 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
              : 'border-white/30 text-white hover:bg-white/20'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium">{model.name}</span>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                model.status === 'trained' ? 'border-green-400 text-green-400' :
                model.status === 'training' ? 'border-yellow-400 text-yellow-400' :
                'border-gray-400 text-gray-400'
              }`}
            >
              {model.status === 'trained' ? 'Antrenat' :
               model.status === 'training' ? 'Antrenare' : 'Gata'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full text-xs">
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-400" />
              <span>Q: {model.quantumLayers}</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-blue-400" />
              <span>C: {model.classicalLayers}</span>
            </div>
          </div>
          
          {model.epochs > 0 && (
            <div className="grid grid-cols-3 gap-2 w-full text-xs">
              <div className="text-center">
                <div className="text-gray-400">Acc Total</div>
                <div className="text-white font-bold">{(model.accuracy * 100).toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Quantum</div>
                <div className="text-purple-400 font-bold">{(model.quantumAccuracy * 100).toFixed(1)}%</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">Clasic</div>
                <div className="text-blue-400 font-bold">{(model.classicalAccuracy * 100).toFixed(1)}%</div>
              </div>
            </div>
          )}
        </Button>
      ))}
    </div>
  );
};
