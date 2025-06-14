
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Brain, Lock, Search, Zap, Calculator, Shuffle, Target, Cpu, Shield, TrendingUp } from 'lucide-react';

interface AlgorithmResult {
  name: string;
  result: string;
  complexity: string;
  status: 'running' | 'completed' | 'error';
}

export const QuantumAlgorithms = () => {
  const [activeAlgorithm, setActiveAlgorithm] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AlgorithmResult[]>([]);

  const algorithms = [
    {
      id: 'grover',
      name: 'Grover Search',
      icon: Search,
      description: 'Căutare cuantică în baze de date nesortate',
      complexity: 'O(√N)',
      color: 'text-blue-400'
    },
    {
      id: 'shor',
      name: 'Shor Factoring',
      icon: Lock,
      description: 'Factorizarea numerelor întregi mari',
      complexity: 'O((log N)³)',
      color: 'text-red-400'
    },
    {
      id: 'qaoa',
      name: 'QAOA Optimization',
      icon: Target,
      description: 'Algoritm de optimizare cuantică aproximativă',
      complexity: 'O(p·m)',
      color: 'text-green-400'
    },
    {
      id: 'vqe',
      name: 'VQE Energy',
      icon: Zap,
      description: 'Estimarea energiei stării fundamentale',
      complexity: 'O(N⁴)',
      color: 'text-yellow-400'
    },
    {
      id: 'qml',
      name: 'Quantum ML',
      icon: Brain,
      description: 'Învățare automată cuantică hibridă',
      complexity: 'O(log N)',
      color: 'text-purple-400'
    },
    {
      id: 'qrng',
      name: 'Quantum RNG',
      icon: Shuffle,
      description: 'Generator de numere aleatoare cuantice',
      complexity: 'O(1)',
      color: 'text-cyan-400'
    },
    {
      id: 'qft',
      name: 'Quantum FFT',
      icon: Calculator,
      description: 'Transformata Fourier cuantică',
      complexity: 'O((log N)²)',
      color: 'text-orange-400'
    },
    {
      id: 'qec',
      name: 'Error Correction',
      icon: Shield,
      description: 'Corecția erorilor cuantice',
      complexity: 'O(n³)',
      color: 'text-pink-400'
    },
    {
      id: 'qsim',
      name: 'Quantum Simulation',
      icon: Cpu,
      description: 'Simularea sistemelor cuantice complexe',
      complexity: 'O(2ⁿ)',
      color: 'text-indigo-400'
    },
    {
      id: 'qopt',
      name: 'Portfolio Optimization',
      icon: TrendingUp,
      description: 'Optimizarea portofoliului de investiții',
      complexity: 'O(N·M)',
      color: 'text-emerald-400'
    }
  ];

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

  const generateAlgorithmResult = (algorithmId: string) => {
    const resultMap: Record<string, string> = {
      grover: `Element găsit la poziția ${Math.floor(Math.random() * 1000)} din ${Math.floor(Math.random() * 10000)} elemente`,
      shor: `Factorii pentru N=${Math.floor(Math.random() * 1000 + 100)}: ${Math.floor(Math.random() * 50 + 2)} × ${Math.floor(Math.random() * 50 + 2)}`,
      qaoa: `Soluție optimă găsită: Cost = ${(Math.random() * 100).toFixed(2)}, Probabilitate = ${(Math.random() * 0.9 + 0.1).toFixed(3)}`,
      vqe: `Energia stării fundamentale: ${(-Math.random() * 10 - 5).toFixed(4)} Hartree`,
      qml: `Model antrenat cu acuratețea ${(Math.random() * 0.15 + 0.85).toFixed(3)}, Loss: ${(Math.random() * 0.1).toFixed(4)}`,
      qrng: `Secvență generată: ${Array.from({length: 16}, () => Math.floor(Math.random() * 2)).join('')}`,
      qft: `Transformată calculată pentru ${Math.floor(Math.random() * 8 + 4)} qubits, Amplitudine maximă: ${(Math.random()).toFixed(4)}`,
      qec: `Erori detectate și corectate: ${Math.floor(Math.random() * 5)} din ${Math.floor(Math.random() * 20 + 10)} qubits`,
      qsim: `Simulare completă pentru ${Math.floor(Math.random() * 6 + 8)} particule, Timp evolut: ${(Math.random() * 10).toFixed(2)} ns`,
      qopt: `Portofoliu optimizat: Return expected ${(Math.random() * 0.1 + 0.05).toFixed(3)}, Risk ${(Math.random() * 0.05 + 0.01).toFixed(3)}`
    };
    
    return { result: resultMap[algorithmId] || 'Rezultat generat cu succes' };
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

      {/* Algorithm Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {algorithms.map((algorithm) => (
          <Button
            key={algorithm.id}
            variant="outline"
            onClick={() => executeAlgorithm(algorithm.id)}
            disabled={activeAlgorithm === algorithm.id}
            className={`flex flex-col items-center gap-2 p-4 h-auto border-white/30 text-white hover:bg-white/20 transition-all hover:scale-105 ${
              activeAlgorithm === algorithm.id ? 'bg-white/20 animate-pulse' : ''
            }`}
            title={algorithm.description}
          >
            <algorithm.icon className={`w-5 h-5 ${algorithm.color}`} />
            <span className="text-xs text-center">{algorithm.name}</span>
            <span className="text-xs text-gray-400">{algorithm.complexity}</span>
          </Button>
        ))}
      </div>

      {/* Search Interface */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Introduceți parametrii pentru căutarea Grover..."
            className="bg-white/20 border-white/30 text-white placeholder-gray-300"
          />
          <Button
            onClick={() => executeAlgorithm('grover')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Results Display */}
      <div className="bg-black/30 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-3">Rezultate Algoritmi:</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  result.status === 'running' ? 'bg-yellow-600/20' :
                  result.status === 'completed' ? 'bg-green-600/20' :
                  'bg-red-600/20'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-cyan-400 font-medium text-sm">{result.name}</span>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      result.status === 'running' ? 'border-yellow-400 text-yellow-400' :
                      result.status === 'completed' ? 'border-green-400 text-green-400' :
                      'border-red-400 text-red-400'
                    }`}
                  >
                    {result.status === 'running' ? 'Execuție' :
                     result.status === 'completed' ? 'Completat' : 'Eroare'}
                  </Badge>
                </div>
                <p className="text-white text-xs leading-relaxed">{result.result}</p>
                <p className="text-gray-400 text-xs mt-1">Complexitate: {result.complexity}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">
              Selectați un algoritm pentru a începe execuția...
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
