import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beaker, Atom, Zap, BarChart3, Play, Pause, RotateCcw } from 'lucide-react';

interface Experiment {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  description: string;
  results?: any;
}

const initialExperiments: Experiment[] = [
  {
    id: 'exp-001',
    name: 'Sinteza Cuantică a Medicamentului X',
    status: 'idle',
    progress: 0,
    description: 'Simularea sintezei unui nou medicament folosind tehnici cuantice.'
  },
  {
    id: 'exp-002',
    name: 'Optimizarea Catalizatorului Y',
    status: 'idle',
    progress: 0,
    description: 'Optimizarea unui catalizator pentru reacții chimice complexe.'
  },
  {
    id: 'exp-003',
    name: 'Analiza Spectroscopică Avansată',
    status: 'idle',
    progress: 0,
    description: 'Analiza spectroscopică a unui compus folosind algoritmi cuantici.'
  }
];

export const QuantumChemistryLab: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments);
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (activeExperiment) {
      intervalId = setInterval(() => {
        setExperiments(prevExperiments =>
          prevExperiments.map(exp =>
            exp.id === activeExperiment && exp.status === 'running'
              ? {
                  ...exp,
                  progress: Math.min(exp.progress + Math.random() * 15, 100),
                  status: exp.progress >= 100 ? 'completed' : 'running'
                }
              : exp
          )
        );
      }, 2000);
    }

    return () => clearInterval(intervalId);
  }, [activeExperiment]);

  const startExperiment = (id: string) => {
    setActiveExperiment(id);
    setExperiments(prevExperiments =>
      prevExperiments.map(exp =>
        exp.id === id ? { ...exp, status: 'running', progress: 10 } : exp
      )
    );
  };

  const stopExperiment = (id: string) => {
    setActiveExperiment(null);
    setExperiments(prevExperiments =>
      prevExperiments.map(exp => (exp.id === id ? { ...exp, status: 'idle' } : exp))
    );
  };

  const resetExperiment = (id: string) => {
    setExperiments(prevExperiments =>
      prevExperiments.map(exp =>
        exp.id === id ? { ...exp, status: 'idle', progress: 0 } : exp
      )
    );
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Beaker className="w-6 h-6 text-yellow-400" />
        <h3 className="text-2xl font-bold text-white">Laborator de Chimie Cuantică</h3>
        <Badge variant="outline" className="border-yellow-400 text-yellow-400 ml-auto">
          <Atom className="w-3 h-3 mr-1" />
          Simulări Avansate
        </Badge>
      </div>

      <Tabs defaultValue="experiments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border-white/20">
          <TabsTrigger value="experiments">Experimente</TabsTrigger>
          <TabsTrigger value="results">Rezultate</TabsTrigger>
          <TabsTrigger value="analytics">Analiză</TabsTrigger>
        </TabsList>

        <TabsContent value="experiments" className="mt-6">
          <ul className="space-y-4">
            {experiments.map(experiment => (
              <li key={experiment.id} className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-white">{experiment.name}</h4>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      experiment.status === 'idle'
                        ? 'border-gray-400 text-gray-400'
                        : experiment.status === 'running'
                        ? 'border-yellow-400 text-yellow-400'
                        : 'border-green-400 text-green-400'
                    }`}
                  >
                    {experiment.status === 'idle'
                      ? 'Inactiv'
                      : experiment.status === 'running'
                      ? 'În curs...'
                      : 'Complet'}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm mb-4">{experiment.description}</p>
                <div className="flex items-center justify-between">
                  <div className="text-cyan-400 text-sm">Progres: {experiment.progress.toFixed(1)}%</div>
                  <div>
                    {experiment.status === 'idle' ? (
                      <Button onClick={() => startExperiment(experiment.id)} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    ) : experiment.status === 'running' ? (
                      <Button onClick={() => stopExperiment(experiment.id)} variant="outline" className="border-red-400 text-red-400 hover:bg-red-400/20">
                        <Pause className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    ) : (
                      <Button onClick={() => resetExperiment(experiment.id)} variant="outline" className="border-white/30 text-white hover:bg-white/20">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">Așteaptă finalizarea unui experiment pentru a vedea rezultatele...</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-400">Începe un experiment pentru a genera date analitice detaliate...</p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
