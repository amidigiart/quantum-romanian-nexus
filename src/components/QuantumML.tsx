
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, GitBranch } from 'lucide-react';
import { useQuantumML } from '@/hooks/useQuantumML';
import { ModelSelection } from '@/components/ModelSelection';
import { TrainingControls } from '@/components/TrainingControls';
import { TrainingProgress } from '@/components/TrainingProgress';
import { HybridStrategy } from '@/components/HybridStrategy';
import { QuantumCircuitPanel } from '@/components/QuantumCircuitPanel';
import { TrainingAnalytics } from '@/components/TrainingAnalytics';

export const QuantumML = () => {
  const {
    activeModel,
    setActiveModel,
    trainingProgress,
    isTraining,
    hybridMode,
    setHybridMode,
    models,
    trainingHistory,
    quantumCircuit,
    startHybridTraining,
    stopTraining,
    resetModel
  } = useQuantumML();

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
          <ModelSelection
            models={models}
            activeModel={activeModel}
            setActiveModel={setActiveModel}
            isTraining={isTraining}
          />
          
          <TrainingControls
            isTraining={isTraining}
            startHybridTraining={startHybridTraining}
            stopTraining={stopTraining}
            resetModel={resetModel}
          />
          
          <TrainingProgress
            isTraining={isTraining}
            trainingProgress={trainingProgress}
            currentModel={currentModel}
          />
        </TabsContent>

        <TabsContent value="hybrid" className="mt-6">
          <HybridStrategy
            hybridMode={hybridMode}
            setHybridMode={setHybridMode}
            isTraining={isTraining}
            currentModel={currentModel}
          />
        </TabsContent>

        <TabsContent value="quantum-circuit" className="mt-6">
          <QuantumCircuitPanel quantumCircuit={quantumCircuit} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <TrainingAnalytics trainingHistory={trainingHistory} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
