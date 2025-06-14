
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Cpu, Target, TrendingUp, Zap, Play, Pause, RotateCcw } from 'lucide-react';

interface MLModel {
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'optimization';
  accuracy: number;
  loss: number;
  epochs: number;
  status: 'training' | 'trained' | 'idle';
}

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  quantumAdvantage: number;
}

export const QuantumML = () => {
  const [activeModel, setActiveModel] = useState<string>('vqc');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [models, setModels] = useState<Record<string, MLModel>>({
    vqc: {
      name: 'Variational Quantum Classifier',
      type: 'classification',
      accuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle'
    },
    qnn: {
      name: 'Quantum Neural Network',
      type: 'regression',
      accuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle'
    },
    qsvm: {
      name: 'Quantum Support Vector Machine',
      type: 'classification',
      accuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle'
    },
    qgan: {
      name: 'Quantum GAN',
      type: 'optimization',
      accuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle'
    }
  });
  const [trainingHistory, setTrainingHistory] = useState<TrainingMetrics[]>([]);

  const modelDescriptions = {
    vqc: 'Clasificator hibrid cuantic-clasic pentru recunoașterea tiparelor',
    qnn: 'Rețea neuronală cuantică pentru aproximarea funcțiilor',
    qsvm: 'Mașină cu vectori suport cuantici pentru clasificarea datelor',
    qgan: 'Rețea generativă adversarială cuantică pentru generarea datelor'
  };

  const startTraining = () => {
    if (isTraining) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    setModels(prev => ({
      ...prev,
      [activeModel]: { ...prev[activeModel], status: 'training', epochs: 0 }
    }));

    const trainingInterval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + Math.random() * 5 + 2;
        
        if (newProgress >= 100) {
          clearInterval(trainingInterval);
          setIsTraining(false);
          
          // Final model update
          const finalAccuracy = Math.random() * 0.15 + 0.85; // 85-100%
          const finalLoss = Math.random() * 0.1 + 0.01; // 0.01-0.11
          
          setModels(prev => ({
            ...prev,
            [activeModel]: {
              ...prev[activeModel],
              status: 'trained',
              accuracy: finalAccuracy,
              loss: finalLoss,
              epochs: 100
            }
          }));
          
          return 100;
        }

        // Update training metrics
        const currentEpoch = Math.floor(newProgress);
        const currentLoss = 1.0 - (newProgress / 100) * 0.9 + Math.random() * 0.1;
        const currentAccuracy = (newProgress / 100) * 0.9 + Math.random() * 0.1;
        const quantumAdvantage = Math.random() * 0.3 + 0.1; // 10-40% speedup

        setTrainingHistory(prev => [...prev.slice(-9), {
          epoch: currentEpoch,
          loss: currentLoss,
          accuracy: currentAccuracy,
          quantumAdvantage: quantumAdvantage
        }]);

        setModels(prev => ({
          ...prev,
          [activeModel]: {
            ...prev[activeModel],
            accuracy: currentAccuracy,
            loss: currentLoss,
            epochs: currentEpoch
          }
        }));

        return newProgress;
      });
    }, 200);
  };

  const stopTraining = () => {
    setIsTraining(false);
    setModels(prev => ({
      ...prev,
      [activeModel]: { ...prev[activeModel], status: 'idle' }
    }));
  };

  const resetModel = () => {
    setModels(prev => ({
      ...prev,
      [activeModel]: {
        ...prev[activeModel],
        accuracy: 0,
        loss: 1.0,
        epochs: 0,
        status: 'idle'
      }
    }));
    setTrainingProgress(0);
    setTrainingHistory([]);
  };

  const currentModel = models[activeModel];

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-white">Quantum Machine Learning</h3>
        <Badge variant="outline" className="border-purple-400 text-purple-400 ml-auto">
          <Cpu className="w-3 h-3 mr-1" />
          Hibrid
        </Badge>
      </div>

      {/* Model Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(models).map(([key, model]) => (
          <Button
            key={key}
            variant={activeModel === key ? "default" : "outline"}
            onClick={() => !isTraining && setActiveModel(key)}
            disabled={isTraining}
            className={`flex flex-col items-center gap-2 p-4 h-auto ${
              activeModel === key 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : 'border-white/30 text-white hover:bg-white/20'
            }`}
          >
            <div className="flex items-center gap-1">
              {model.type === 'classification' && <Target className="w-4 h-4" />}
              {model.type === 'regression' && <TrendingUp className="w-4 h-4" />}
              {model.type === 'clustering' && <Cpu className="w-4 h-4" />}
              {model.type === 'optimization' && <Zap className="w-4 h-4" />}
              <span className="text-sm font-medium">{model.name}</span>
            </div>
            <div className="flex gap-2 text-xs">
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
            {model.epochs > 0 && (
              <div className="text-xs text-center">
                <div>Acuratețe: {(model.accuracy * 100).toFixed(1)}%</div>
                <div>Loss: {model.loss.toFixed(4)}</div>
              </div>
            )}
          </Button>
        ))}
      </div>

      {/* Model Description */}
      <div className="mb-6 p-4 bg-black/30 rounded-lg">
        <h4 className="text-white font-semibold mb-2">{currentModel.name}</h4>
        <p className="text-gray-300 text-sm mb-3">{modelDescriptions[activeModel]}</p>
        
        {/* Training Controls */}
        <div className="flex gap-2">
          <Button
            onClick={startTraining}
            disabled={isTraining}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <Play className="w-4 h-4 mr-1" />
            Începe Antrenarea
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
      </div>

      {/* Training Progress */}
      {(isTraining || trainingProgress > 0) && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Progres Antrenare:</span>
            <span className="text-cyan-400">{trainingProgress.toFixed(1)}%</span>
          </div>
          <Progress value={trainingProgress} className="w-full" />
          
          {currentModel.epochs > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
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
            </div>
          )}
        </div>
      )}

      {/* Training History */}
      {trainingHistory.length > 0 && (
        <div className="bg-black/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Istoric Antrenare:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {trainingHistory.slice(-5).reverse().map((metric, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white/10 rounded">
                <span className="text-cyan-400 text-sm">Epoca {metric.epoch}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-400">Acc: {(metric.accuracy * 100).toFixed(1)}%</span>
                  <span className="text-yellow-400">Loss: {metric.loss.toFixed(4)}</span>
                  <span className="text-purple-400">QA: +{(metric.quantumAdvantage * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
