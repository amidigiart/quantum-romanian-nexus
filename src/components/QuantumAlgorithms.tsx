
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain } from 'lucide-react';
import { AlgorithmGrid } from './quantum-algorithms/AlgorithmGrid';
import { SearchInterface } from './quantum-algorithms/SearchInterface';
import { ResultsDisplay } from './quantum-algorithms/ResultsDisplay';
import { MultiHopQuantumCommunication } from './MultiHopQuantumCommunication';
import { QuantumNetworkRouting } from './QuantumNetworkRouting';
import { algorithms } from './quantum-algorithms/algorithmData';
import { generateAlgorithmResult } from './quantum-algorithms/utils';
import { AlgorithmResult } from './quantum-algorithms/types';

export const QuantumAlgorithms = () => {
  const [activeAlgorithm, setActiveAlgorithm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AlgorithmResult[]>([]);

  const executeAlgorithm = (algorithmId: string) => {
    setActiveAlgorithm(algorithmId);
    const algorithm = algorithms.find(a => a.id === algorithmId);
    
    if (!algorithm) return;

    // Simulate algorithm execution
    const newResult: AlgorithmResult = {
      name: algorithm.name,
      result: 'Executare în progres...',
      complexity: algorithm.complexity,
      status: 'running'
    };
    
    setResults(prev => [newResult, ...prev.slice(0, 4)]);

    setTimeout(() => {
      const completedResult = generateAlgorithmResult(algorithmId);
      setResults(prev => prev.map((r, i) => 
        i === 0 ? { ...r, ...completedResult, status: 'completed' } : r
      ));
      setActiveAlgorithm(null);
    }, 2000 + Math.random() * 3000);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-cyan-400" />
        <h3 className="text-2xl font-bold text-white">Algoritmi Cuantici Hibrizi</h3>
        <Badge variant="outline" className="border-cyan-400 text-cyan-400 ml-auto">
          10 Funcții
        </Badge>
      </div>

      <Tabs defaultValue="algorithms" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border-white/20">
          <TabsTrigger value="algorithms">Algoritmi</TabsTrigger>
          <TabsTrigger value="multi-hop">Multi-Hop</TabsTrigger>
          <TabsTrigger value="routing">Rutare</TabsTrigger>
        </TabsList>

        <TabsContent value="algorithms" className="mt-6">
          <AlgorithmGrid
            algorithms={algorithms}
            activeAlgorithm={activeAlgorithm}
            onExecuteAlgorithm={executeAlgorithm}
          />

          <SearchInterface
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onExecuteSearch={() => executeAlgorithm('grover')}
          />

          <ResultsDisplay results={results} />
        </TabsContent>

        <TabsContent value="multi-hop" className="mt-6">
          <MultiHopQuantumCommunication />
        </TabsContent>

        <TabsContent value="routing" className="mt-6">
          <QuantumNetworkRouting />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
