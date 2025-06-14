
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { TrendingUp, Settings, Zap, Target } from 'lucide-react';

interface OptimizerSettings {
  learningRate: number;
  batchSize: number;
  quantumDepth: number;
  classicalDepth: number;
  hybridCoupling: number;
  regularization: number;
}

interface AdvancedTrainingOptimizerProps {
  isTraining: boolean;
  onSettingsChange: (settings: OptimizerSettings) => void;
}

export const AdvancedTrainingOptimizer: React.FC<AdvancedTrainingOptimizerProps> = ({
  isTraining,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<OptimizerSettings>({
    learningRate: 0.001,
    batchSize: 32,
    quantumDepth: 8,
    classicalDepth: 4,
    hybridCoupling: 0.5,
    regularization: 0.01
  });

  const [optimizerType, setOptimizerType] = useState<'adam' | 'sgd' | 'quantum-natural'>('adam');
  const [schedulerType, setSchedulerType] = useState<'cosine' | 'exponential' | 'adaptive'>('adaptive');

  const updateSetting = (key: keyof OptimizerSettings, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const optimizers = {
    adam: { name: 'Adam Optimizer', description: 'Adaptive moment estimation cu bias correction' },
    sgd: { name: 'Quantum SGD', description: 'Gradient descent cu momentum cuantic' },
    'quantum-natural': { name: 'Natural Gradient', description: 'Gradient natural pentru circuite cuantice' }
  };

  const schedulers = {
    cosine: { name: 'Cosine Annealing', description: 'Scădere cosinusoidală a learning rate' },
    exponential: { name: 'Exponential Decay', description: 'Decay exponențial cu warmup' },
    adaptive: { name: 'Adaptive Scheduler', description: 'Ajustare automată bazată pe progres' }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-400/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Optimizator Antrenare Avansat</h3>
        <Badge variant="outline" className="border-blue-400 text-blue-400 ml-auto">
          <TrendingUp className="w-3 h-3 mr-1" />
          Hibrid AI
        </Badge>
      </div>

      <Tabs defaultValue="optimizer" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border-white/20">
          <TabsTrigger value="optimizer">Optimizator</TabsTrigger>
          <TabsTrigger value="hyperparams">Hiperparametri</TabsTrigger>
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
        </TabsList>

        <TabsContent value="optimizer" className="mt-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Selectare Optimizator:</h4>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(optimizers).map(([key, optimizer]) => (
                <Button
                  key={key}
                  variant={optimizerType === key ? "default" : "outline"}
                  onClick={() => setOptimizerType(key as typeof optimizerType)}
                  disabled={isTraining}
                  className={`flex flex-col items-start gap-2 p-4 h-auto ${
                    optimizerType === key 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                      : 'border-white/30 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="font-medium">{optimizer.name}</span>
                  <span className="text-sm text-gray-300">{optimizer.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hyperparams" className="mt-6">
          <div className="space-y-6">
            <div>
              <label className="text-white font-medium mb-2 block">
                Learning Rate: {settings.learningRate}
              </label>
              <Slider
                value={[settings.learningRate * 1000]}
                onValueChange={([value]) => updateSetting('learningRate', value / 1000)}
                max={10}
                min={0.1}
                step={0.1}
                disabled={isTraining}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Batch Size: {settings.batchSize}
              </label>
              <Slider
                value={[settings.batchSize]}
                onValueChange={([value]) => updateSetting('batchSize', value)}
                max={128}
                min={8}
                step={8}
                disabled={isTraining}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Quantum Depth: {settings.quantumDepth}
              </label>
              <Slider
                value={[settings.quantumDepth]}
                onValueChange={([value]) => updateSetting('quantumDepth', value)}
                max={20}
                min={2}
                step={1}
                disabled={isTraining}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Classical Depth: {settings.classicalDepth}
              </label>
              <Slider
                value={[settings.classicalDepth]}
                onValueChange={([value]) => updateSetting('classicalDepth', value)}
                max={16}
                min={1}
                step={1}
                disabled={isTraining}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Hybrid Coupling: {settings.hybridCoupling.toFixed(2)}
              </label>
              <Slider
                value={[settings.hybridCoupling * 100]}
                onValueChange={([value]) => updateSetting('hybridCoupling', value / 100)}
                max={100}
                min={0}
                step={5}
                disabled={isTraining}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">
                Regularization: {settings.regularization}
              </label>
              <Slider
                value={[settings.regularization * 100]}
                onValueChange={([value]) => updateSetting('regularization', value / 100)}
                max={10}
                min={0}
                step={0.1}
                disabled={isTraining}
                className="w-full"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scheduler" className="mt-6">
          <div className="space-y-4">
            <h4 className="text-white font-medium">Learning Rate Scheduler:</h4>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(schedulers).map(([key, scheduler]) => (
                <Button
                  key={key}
                  variant={schedulerType === key ? "default" : "outline"}
                  onClick={() => setSchedulerType(key as typeof schedulerType)}
                  disabled={isTraining}
                  className={`flex flex-col items-start gap-2 p-4 h-auto ${
                    schedulerType === key 
                      ? 'bg-gradient-to-r from-green-500 to-teal-500' 
                      : 'border-white/30 text-white hover:bg-white/20'
                  }`}
                >
                  <span className="font-medium">{scheduler.name}</span>
                  <span className="text-sm text-gray-300">{scheduler.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Status Indicator */}
      <div className="mt-6 flex items-center gap-2">
        <Target className="w-4 h-4 text-emerald-400" />
        <span className="text-emerald-300 text-sm">
          Configurație: {optimizers[optimizerType].name} + {schedulers[schedulerType].name}
        </span>
        {isTraining && (
          <Badge variant="outline" className="border-yellow-400 text-yellow-400 ml-auto">
            <Zap className="w-3 h-3 mr-1" />
            Activ
          </Badge>
        )}
      </div>
    </Card>
  );
};
