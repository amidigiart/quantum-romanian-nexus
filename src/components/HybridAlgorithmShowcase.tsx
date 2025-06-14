
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, Sparkles, Zap, Info, Play, TrendingUp } from 'lucide-react';
import { algorithms } from '@/components/quantum-algorithms/algorithmData';

export const HybridAlgorithmShowcase: React.FC = () => {
  const [selectedHybrid, setSelectedHybrid] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Filter hybrid algorithms
  const hybridAlgorithms = algorithms.filter(alg => 
    alg.category.toLowerCase().includes('hybrid') || 
    alg.id.includes('hybrid') ||
    alg.category.toLowerCase().includes('enhanced') ||
    alg.category.toLowerCase().includes('adaptive')
  );

  const runHybridAlgorithm = async (algorithmId: string) => {
    setIsRunning(true);
    setSelectedHybrid(algorithmId);
    
    // Simulate hybrid execution with longer time due to complexity
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
    
    setIsRunning(false);
    setSelectedHybrid(null);
  };

  const getAlgorithmDetails = (algorithm: any) => {
    const details: Record<string, any> = {
      'hybrid-qaoa-vqe': {
        hybridApproach: 'Sequential + Parallel Processing',
        classicalComponent: 'Parameter optimization și constraint handling',
        quantumComponent: 'State preparation și energy estimation',
        advantages: ['Convergență îmbunătățită', 'Robustețe crescută', 'Scalabilitate hibridă'],
        applications: ['Optimizare moleculară', 'Probleme combinatoriale', 'Machine learning'],
        performance: { quantum: 85, classical: 70, hybrid: 95 }
      },
      'quantum-annealing-hybrid': {
        hybridApproach: 'Adaptive Annealing Schedule',
        classicalComponent: 'Schedule optimization și post-processing',
        quantumComponent: 'Quantum annealing și tunneling',
        advantages: ['Evitarea minimelor locale', 'Adaptare dinamică', 'Paralelism quantum'],
        applications: ['Optimizare logistică', 'Scheduling problems', 'Portfolio optimization'],
        performance: { quantum: 80, classical: 60, hybrid: 90 }
      },
      'variational-quantum-eigensolver-plus': {
        hybridApproach: 'Adaptive Learning Integration',
        classicalComponent: 'Machine learning pentru parametri',
        quantumComponent: 'Enhanced VQE cu noise mitigation',
        advantages: ['Învățare adaptivă', 'Noise resilience', 'Convergență rapidă'],
        applications: ['Quantum chemistry', 'Materials science', 'Drug discovery'],
        performance: { quantum: 88, classical: 65, hybrid: 92 }
      },
      'neural-quantum-hybrid': {
        hybridApproach: 'Deep Integration Architecture',
        classicalComponent: 'Neural network layers și backpropagation',
        quantumComponent: 'Quantum feature maps și entanglement',
        advantages: ['Expresivitate crescută', 'Feature extraction superior', 'Gradient advantages'],
        applications: ['Computer vision', 'NLP tasks', 'Pattern recognition'],
        performance: { quantum: 82, classical: 75, hybrid: 94 }
      }
    };

    return details[algorithm.id] || {
      hybridApproach: 'Classical-Quantum Integration',
      classicalComponent: 'Pre/post-processing și optimization',
      quantumComponent: 'Core quantum computation',
      advantages: ['Flexibilitate', 'Performanță îmbunătățită', 'Scalabilitate'],
      applications: ['Various optimization problems'],
      performance: { quantum: 75, classical: 65, hybrid: 85 }
    };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-400/20">
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="w-6 h-6 text-purple-400" />
          <h4 className="text-xl font-semibold text-white">Variante Algoritmi Hibrizi</h4>
          <Badge variant="outline" className="border-cyan-400 text-cyan-400 ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            {hybridAlgorithms.length} Variante
          </Badge>
        </div>

        <p className="text-gray-300 mb-6">
          Algoritmi hibrizi care combină puterea computației cuantice cu flexibilitatea metodelor clasice
          pentru performanțe superioare în probleme complexe.
        </p>

        <Tabs defaultValue="algorithms" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="algorithms">Algoritmi Hibrizi</TabsTrigger>
            <TabsTrigger value="comparison">Comparație Performanță</TabsTrigger>
          </TabsList>

          <TabsContent value="algorithms" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hybridAlgorithms.map((algorithm) => {
                const details = getAlgorithmDetails(algorithm);
                const isActive = selectedHybrid === algorithm.id && isRunning;

                return (
                  <Card key={algorithm.id} className={`bg-white/5 border-white/20 p-4 transition-all hover:bg-white/10 ${
                    isActive ? 'border-purple-400/50 bg-purple-900/20' : ''
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <algorithm.icon className={`w-5 h-5 ${algorithm.color}`} />
                        <h5 className="font-semibold text-white">{algorithm.name}</h5>
                      </div>
                      <Badge variant="outline" className="text-xs border-gray-400 text-gray-400">
                        {algorithm.qubits}Q
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-300 mb-3">{algorithm.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-xs">
                        <span className="text-gray-400">Abordare: </span>
                        <span className="text-cyan-300">{details.hybridApproach}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-400">Complexitate: </span>
                        <span className="text-yellow-300">{algorithm.complexity}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`text-xs ${algorithm.color.replace('text-', 'border-').replace('text-', 'text-')}`}>
                        {algorithm.category}
                      </Badge>
                      
                      <Button
                        size="sm"
                        onClick={() => runHybridAlgorithm(algorithm.id)}
                        disabled={isRunning}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      >
                        {isActive ? (
                          <>
                            <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full mr-1" />
                            Running
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Test
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="mt-6">
            <div className="space-y-4">
              {hybridAlgorithms.slice(0, 4).map((algorithm) => {
                const details = getAlgorithmDetails(algorithm);
                
                return (
                  <Card key={algorithm.id} className="bg-white/5 border-white/20 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <algorithm.icon className={`w-4 h-4 ${algorithm.color}`} />
                      <h6 className="font-medium text-white">{algorithm.name}</h6>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-400 mb-1">Quantum</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${details.performance.quantum}%` }}
                          />
                        </div>
                        <div className="text-xs text-purple-300">{details.performance.quantum}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-gray-400 mb-1">Classical</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${details.performance.classical}%` }}
                          />
                        </div>
                        <div className="text-xs text-blue-300">{details.performance.classical}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xs text-gray-400 mb-1">Hybrid</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                            style={{ width: `${details.performance.hybrid}%` }}
                          />
                        </div>
                        <div className="text-xs text-emerald-300">{details.performance.hybrid}%</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
