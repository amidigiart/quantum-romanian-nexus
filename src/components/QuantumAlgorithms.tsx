
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Atom, Zap, GitBranch, Satellite } from 'lucide-react';
import { AlgorithmGrid } from '@/components/quantum-algorithms/AlgorithmGrid';
import { SearchInterface } from '@/components/quantum-algorithms/SearchInterface';
import { ResultsDisplay } from '@/components/quantum-algorithms/ResultsDisplay';
import { VQEOptimizer } from '@/components/VQEOptimizer';
import { QAOAPreprocessor } from '@/components/QAOAPreprocessor';
import { HybridAlgorithmShowcase } from '@/components/HybridAlgorithmShowcase';
import { SatelliteQKDSimulator } from '@/components/SatelliteQKDSimulator';
import { useQuantumAlgorithms } from '@/hooks/useQuantumAlgorithms';

export const QuantumAlgorithms = () => {
  const {
    algorithms,
    selectedAlgorithm,
    setSelectedAlgorithm,
    results,
    isRunning,
    runAlgorithm,
    searchQuery,
    setSearchQuery,
    filteredAlgorithms
  } = useQuantumAlgorithms();

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Atom className="w-6 h-6 text-blue-400" />
        <h3 className="text-2xl font-bold text-white">Algoritmi Cuantici Avansați</h3>
        <Badge variant="outline" className="border-blue-400 text-blue-400 ml-auto">
          <GitBranch className="w-3 h-3 mr-1" />
          Optimizați
        </Badge>
      </div>

      <Tabs defaultValue="algorithms" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-white/10 backdrop-blur-lg border-white/20">
          <TabsTrigger value="algorithms">Algoritmi</TabsTrigger>
          <TabsTrigger value="hybrid">Hibrizi</TabsTrigger>
          <TabsTrigger value="vqe">VQE Optimizer</TabsTrigger>
          <TabsTrigger value="qaoa">QAOA Preprocessor</TabsTrigger>
          <TabsTrigger value="satellite">Satelit QKD</TabsTrigger>
          <TabsTrigger value="results">Rezultate</TabsTrigger>
        </TabsList>

        <TabsContent value="algorithms" className="mt-6">
          <SearchInterface 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          
          <AlgorithmGrid
            algorithms={filteredAlgorithms}
            selectedAlgorithm={selectedAlgorithm}
            setSelectedAlgorithm={setSelectedAlgorithm}
            onRunAlgorithm={runAlgorithm}
            isRunning={isRunning}
          />
        </TabsContent>

        <TabsContent value="hybrid" className="mt-6">
          <HybridAlgorithmShowcase />
        </TabsContent>

        <TabsContent value="vqe" className="mt-6">
          <VQEOptimizer />
        </TabsContent>

        <TabsContent value="qaoa" className="mt-6">
          <QAOAPreprocessor />
        </TabsContent>

        <TabsContent value="satellite" className="mt-6">
          <SatelliteQKDSimulator />
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <ResultsDisplay results={results} />
        </TabsContent>
      </Tabs>
    </Card>
  );
};
