
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap, Target, TrendingDown, Atom, Play, Pause, RotateCcw } from 'lucide-react';

interface VQEState {
  energy: number;
  gradient: number[];
  parameters: number[];
  convergenceHistory: number[];
  iteration: number;
  isOptimizing: boolean;
  hasConverged: boolean;
}

interface OptimizerConfig {
  method: 'SPSA' | 'COBYLA' | 'BFGS' | 'ADAM' | 'AdaGrad';
  learningRate: number;
  tolerance: number;
  maxIterations: number;
  adaptiveLearning: boolean;
  momentumDecay: number;
}

export const VQEOptimizer: React.FC = () => {
  const [vqeState, setVQEState] = useState<VQEState>({
    energy: -1.137,
    gradient: [0.1, -0.05, 0.08, -0.02],
    parameters: [0.5, 1.2, -0.3, 0.8],
    convergenceHistory: [],
    iteration: 0,
    isOptimizing: false,
    hasConverged: false
  });

  const [config, setConfig] = useState<OptimizerConfig>({
    method: 'ADAM',
    learningRate: 0.01,
    tolerance: 1e-6,
    maxIterations: 1000,
    adaptiveLearning: true,
    momentumDecay: 0.9
  });

  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const startOptimization = () => {
    setVQEState(prev => ({ ...prev, isOptimizing: true, hasConverged: false }));
    setOptimizationProgress(0);
  };

  const stopOptimization = () => {
    setVQEState(prev => ({ ...prev, isOptimizing: false }));
  };

  const resetOptimization = () => {
    setVQEState({
      energy: -1.137,
      gradient: [0.1, -0.05, 0.08, -0.02],
      parameters: [0.5, 1.2, -0.3, 0.8],
      convergenceHistory: [],
      iteration: 0,
      isOptimizing: false,
      hasConverged: false
    });
    setOptimizationProgress(0);
  };

  // Sophisticated optimization simulation
  useEffect(() => {
    if (!vqeState.isOptimizing) return;

    const optimizationInterval = setInterval(() => {
      setVQEState(prev => {
        if (prev.iteration >= config.maxIterations || prev.hasConverged) {
          return { ...prev, isOptimizing: false };
        }

        // Sophisticated convergence simulation
        const iteration = prev.iteration + 1;
        const decay = Math.exp(-iteration * 0.001);
        
        // Adaptive learning rate
        const adaptiveRate = config.adaptiveLearning 
          ? config.learningRate * Math.max(0.1, decay)
          : config.learningRate;

        // Simulate gradient-based optimization
        const newGradient = prev.gradient.map((g, i) => 
          g * (0.95 + Math.random() * 0.1) * decay
        );

        // Update parameters with momentum
        const newParameters = prev.parameters.map((p, i) => 
          p - adaptiveRate * newGradient[i] + config.momentumDecay * Math.random() * 0.01
        );

        // Energy convergence toward ground state
        const energyImprovement = Math.abs(newGradient.reduce((sum, g) => sum + g * g, 0)) * adaptiveRate;
        const newEnergy = prev.energy - energyImprovement * (1 + Math.random() * 0.1);

        const convergenceHistory = [...prev.convergenceHistory.slice(-99), newEnergy];
        
        // Check convergence criteria
        const gradientNorm = Math.sqrt(newGradient.reduce((sum, g) => sum + g * g, 0));
        const hasConverged = gradientNorm < config.tolerance || 
                           (convergenceHistory.length > 10 && 
                            Math.abs(convergenceHistory[convergenceHistory.length - 1] - 
                                   convergenceHistory[convergenceHistory.length - 10]) < config.tolerance);

        return {
          ...prev,
          energy: newEnergy,
          gradient: newGradient,
          parameters: newParameters,
          convergenceHistory,
          iteration,
          hasConverged
        };
      });

      setOptimizationProgress(prev => Math.min(100, prev + 0.5));
    }, 100);

    return () => clearInterval(optimizationInterval);
  }, [vqeState.isOptimizing, config]);

  const gradientNorm = Math.sqrt(vqeState.gradient.reduce((sum, g) => sum + g * g, 0));

  return (
    <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-lg border-blue-400/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Atom className="w-6 h-6 text-blue-400" />
        <h4 className="text-xl font-semibold text-white">VQE Convergence Optimizer</h4>
        <Badge variant="outline" className={`border-${vqeState.hasConverged ? 'green' : 'blue'}-400 text-${vqeState.hasConverged ? 'green' : 'blue'}-400`}>
          <Target className="w-3 h-3 mr-1" />
          {vqeState.hasConverged ? 'Converged' : 'Optimizing'}
        </Badge>
      </div>

      {/* Optimizer Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Optimization Method:</label>
            <Select value={config.method} onValueChange={(value: OptimizerConfig['method']) => 
              setConfig(prev => ({ ...prev, method: value }))
            }>
              <SelectTrigger className="bg-black/30 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADAM">ADAM (Adaptive Moment)</SelectItem>
                <SelectItem value="BFGS">BFGS (Quasi-Newton)</SelectItem>
                <SelectItem value="SPSA">SPSA (Simultaneous)</SelectItem>
                <SelectItem value="COBYLA">COBYLA (Constrained)</SelectItem>
                <SelectItem value="AdaGrad">AdaGrad (Adaptive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Learning Rate: {config.learningRate.toFixed(4)}
            </label>
            <Slider
              value={[config.learningRate]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, learningRate: value }))}
              min={0.001}
              max={0.1}
              step={0.001}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Tolerance: {config.tolerance.toExponential(2)}
            </label>
            <Slider
              value={[Math.log10(config.tolerance)]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, tolerance: Math.pow(10, value) }))}
              min={-8}
              max={-3}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Max Iterations: {config.maxIterations}
            </label>
            <Slider
              value={[config.maxIterations]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, maxIterations: value }))}
              min={100}
              max={2000}
              step={50}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={startOptimization}
          disabled={vqeState.isOptimizing}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          <Play className="w-4 h-4 mr-2" />
          Start VQE
        </Button>
        {vqeState.isOptimizing && (
          <Button
            onClick={stopOptimization}
            variant="outline"
            className="border-red-400 text-red-400 hover:bg-red-400/20"
          >
            <Pause className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
        <Button
          onClick={resetOptimization}
          variant="outline"
          disabled={vqeState.isOptimizing}
          className="border-white/30 text-white hover:bg-white/20"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Optimization Progress */}
      {vqeState.isOptimizing && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Optimization Progress:</span>
            <span className="text-cyan-400">{optimizationProgress.toFixed(1)}%</span>
          </div>
          <Progress value={optimizationProgress} className="w-full" />
        </div>
      )}

      {/* Current State Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <Zap className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <div className="text-gray-400 text-sm">Ground State Energy</div>
          <div className="text-blue-300 font-bold text-lg">{vqeState.energy.toFixed(6)}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <TrendingDown className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <div className="text-gray-400 text-sm">Gradient Norm</div>
          <div className="text-purple-300 font-bold text-lg">{gradientNorm.toExponential(3)}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <Target className="w-5 h-5 text-green-400 mx-auto mb-2" />
          <div className="text-gray-400 text-sm">Iteration</div>
          <div className="text-green-300 font-bold text-lg">{vqeState.iteration}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-4 text-center">
          <Atom className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
          <div className="text-gray-400 text-sm">Parameters</div>
          <div className="text-yellow-300 font-bold text-lg">{vqeState.parameters.length}</div>
        </div>
      </div>

      {/* Convergence Analysis */}
      {vqeState.convergenceHistory.length > 0 && (
        <div className="bg-black/30 rounded-lg p-4">
          <h5 className="text-white font-medium mb-3">Convergence Analysis:</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {vqeState.convergenceHistory.slice(-5).reverse().map((energy, index) => (
              <div key={index} className="flex justify-between items-center py-1 px-2 bg-white/10 rounded text-sm">
                <span className="text-gray-400">Step {vqeState.iteration - index}</span>
                <span className="text-blue-300 font-mono">{energy.toFixed(6)}</span>
              </div>
            ))}
          </div>
          
          {vqeState.hasConverged && (
            <div className="mt-3 p-2 bg-green-500/20 rounded border border-green-400/30">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">
                  Convergence achieved! Ground state energy: {vqeState.energy.toFixed(6)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
