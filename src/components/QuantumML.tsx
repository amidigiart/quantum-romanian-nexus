
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Cpu, Target, TrendingUp, Zap, Play, Pause, RotateCcw, Activity, GitBranch, Layers } from 'lucide-react';

interface MLModel {
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'optimization';
  accuracy: number;
  quantumAccuracy: number;
  classicalAccuracy: number;
  loss: number;
  epochs: number;
  status: 'training' | 'trained' | 'idle';
  quantumLayers: number;
  classicalLayers: number;
  hybridEfficiency: number;
}

interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  quantumAdvantage: number;
  classicalComponent: number;
  quantumComponent: number;
  hybridScore: number;
}

interface QuantumCircuitData {
  gates: string[];
  depth: number;
  entanglement: number;
  coherenceTime: number;
}

export const QuantumML = () => {
  const [activeModel, setActiveModel] = useState<string>('hvqc');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [hybridMode, setHybridMode] = useState<'quantum-first' | 'classical-first' | 'parallel'>('parallel');
  
  const [models, setModels] = useState<Record<string, MLModel>>({
    hvqc: {
      name: 'Hybrid Variational Quantum Classifier',
      type: 'classification',
      accuracy: 0,
      quantumAccuracy: 0,
      classicalAccuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle',
      quantumLayers: 4,
      classicalLayers: 3,
      hybridEfficiency: 0
    },
    qcnn: {
      name: 'Quantum Convolutional Neural Network',
      type: 'classification',
      accuracy: 0,
      quantumAccuracy: 0,
      classicalAccuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle',
      quantumLayers: 6,
      classicalLayers: 2,
      hybridEfficiency: 0
    },
    qrnn: {
      name: 'Quantum Recurrent Neural Network',
      type: 'regression',
      accuracy: 0,
      quantumAccuracy: 0,
      classicalAccuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle',
      quantumLayers: 5,
      classicalLayers: 4,
      hybridEfficiency: 0
    },
    qtransformer: {
      name: 'Quantum Transformer',
      type: 'optimization',
      accuracy: 0,
      quantumAccuracy: 0,
      classicalAccuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle',
      quantumLayers: 8,
      classicalLayers: 6,
      hybridEfficiency: 0
    }
  });

  const [trainingHistory, setTrainingHistory] = useState<TrainingMetrics[]>([]);
  const [quantumCircuit, setQuantumCircuit] = useState<QuantumCircuitData>({
    gates: ['H', 'CNOT', 'RY', 'RZ'],
    depth: 12,
    entanglement: 0.85,
    coherenceTime: 100
  });

  const hybridStrategies = {
    'quantum-first': 'Procesare cuantică urmată de post-procesare clasică',
    'classical-first': 'Pre-procesare clasică urmată de procesare cuantică',
    'parallel': 'Procesare paralelă cu fuziune adaptivă'
  };

  const startHybridTraining = () => {
    if (isTraining) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    setModels(prev => ({
      ...prev,
      [activeModel]: { ...prev[activeModel], status: 'training', epochs: 0 }
    }));

    const trainingInterval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + Math.random() * 3 + 1;
        
        if (newProgress >= 100) {
          clearInterval(trainingInterval);
          setIsTraining(false);
          
          // Enhanced final model update with hybrid metrics
          const quantumAdvantage = Math.random() * 0.25 + 0.15; // 15-40% quantum advantage
          const finalAccuracy = Math.random() * 0.10 + 0.88; // 88-98%
          const quantumAccuracy = finalAccuracy + quantumAdvantage * 0.3;
          const classicalAccuracy = finalAccuracy - quantumAdvantage * 0.2;
          const hybridEfficiency = Math.random() * 0.2 + 0.75; // 75-95%
          const finalLoss = Math.random() * 0.05 + 0.01; // 0.01-0.06
          
          setModels(prev => ({
            ...prev,
            [activeModel]: {
              ...prev[activeModel],
              status: 'trained',
              accuracy: finalAccuracy,
              quantumAccuracy: Math.max(0, Math.min(1, quantumAccuracy)),
              classicalAccuracy: Math.max(0, Math.min(1, classicalAccuracy)),
              loss: finalLoss,
              epochs: 100,
              hybridEfficiency: hybridEfficiency
            }
          }));
          
          return 100;
        }

        // Enhanced training metrics with hybrid components
        const currentEpoch = Math.floor(newProgress);
        const currentLoss = 1.0 - (newProgress / 100) * 0.95 + Math.random() * 0.05;
        const currentAccuracy = (newProgress / 100) * 0.9 + Math.random() * 0.08;
        const quantumAdvantage = Math.random() * 0.4 + 0.1;
        const classicalComponent = 0.3 + Math.random() * 0.4;
        const quantumComponent = 0.3 + Math.random() * 0.4;
        const hybridScore = (quantumComponent + classicalComponent) * (1 + quantumAdvantage * 0.5);

        setTrainingHistory(prev => [...prev.slice(-9), {
          epoch: currentEpoch,
          loss: currentLoss,
          accuracy: currentAccuracy,
          quantumAdvantage: quantumAdvantage,
          classicalComponent: classicalComponent,
          quantumComponent: quantumComponent,
          hybridScore: Math.min(1, hybridScore)
        }]);

        // Update quantum circuit parameters
        setQuantumCircuit(prev => ({
          ...prev,
          depth: Math.floor(10 + Math.random() * 8),
          entanglement: Math.random() * 0.3 + 0.7,
          coherenceTime: Math.floor(80 + Math.random() * 40)
        }));

        setModels(prev => ({
          ...prev,
          [activeModel]: {
            ...prev[activeModel],
            accuracy: currentAccuracy,
            quantumAccuracy: currentAccuracy + quantumAdvantage * 0.1,
            classicalAccuracy: currentAccuracy - quantumAdvantage * 0.05,
            loss: currentLoss,
            epochs: currentEpoch,
            hybridEfficiency: hybridScore
          }
        }));

        return newProgress;
      });
    }, 250);
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
        quantumAccuracy: 0,
        classicalAccuracy: 0,
        loss: 1.0,
        epochs: 0,
        status: 'idle',
        hybridEfficiency: 0
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
        <h3 className="text-2xl font-bold text-white">Hybrid Quantum-Classical ML</h3>
        <Badge variant="outline" className="border-purple-400 text-purple-400 ml-auto">
          <GitBranch className="w-3 h-3 mr-1" />
          Hibrid Avansat
        </Badge>
      </div>

      <Tabs defaultValue="models" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg border-white/20">
          <TabsTrigger value="models">Modele</TabsTrigger>
          <TabsTrigger value="hybrid">Integrare Hibridă</TabsTrigger>
          <TabsTrigger value="quantum-circuit">Circuit Cuantic</TabsTrigger>
          <TabsTrigger value="analytics">Analiză</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="mt-6">
          {/* Model Selection */}
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

          {/* Training Controls */}
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

          {/* Training Progress */}
          {(isTraining || trainingProgress > 0) && (
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
          )}
        </TabsContent>

        <TabsContent value="hybrid" className="mt-6">
          <div className="space-y-6">
            {/* Hybrid Strategy Selection */}
            <div>
              <h4 className="text-white font-semibold mb-3">Strategie de Integrare:</h4>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(hybridStrategies).map(([key, description]) => (
                  <Button
                    key={key}
                    variant={hybridMode === key ? "default" : "outline"}
                    onClick={() => setHybridMode(key as any)}
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
        </TabsContent>

        <TabsContent value="quantum-circuit" className="mt-6">
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Parametrii Circuit Cuantic:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-sm">Porți Cuantice</div>
                <div className="text-cyan-400 font-bold text-lg">{quantumCircuit.gates.length}</div>
                <div className="text-xs text-gray-500">{quantumCircuit.gates.join(', ')}</div>
              </div>
              <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-sm">Adâncime Circuit</div>
                <div className="text-green-400 font-bold text-lg">{quantumCircuit.depth}</div>
              </div>
              <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-sm">Entanglement</div>
                <div className="text-purple-400 font-bold text-lg">{(quantumCircuit.entanglement * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center">
                <div className="text-gray-400 text-sm">Timp Coherență</div>
                <div className="text-yellow-400 font-bold text-lg">{quantumCircuit.coherenceTime}μs</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {/* Training History */}
          {trainingHistory.length > 0 && (
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
          )}

          {trainingHistory.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">Începeți antrenarea pentru a vedea analiza detaliată...</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
