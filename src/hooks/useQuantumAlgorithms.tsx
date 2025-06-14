
import { useState } from 'react';
import { algorithms } from '@/components/quantum-algorithms/algorithmData';
import { Algorithm, AlgorithmResult } from '@/components/quantum-algorithms/types';

export const useQuantumAlgorithms = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm | null>(null);
  const [results, setResults] = useState<AlgorithmResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlgorithms = algorithms.filter(algorithm =>
    algorithm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    algorithm.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    algorithm.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runAlgorithm = async (algorithm: Algorithm) => {
    setIsRunning(true);
    setSelectedAlgorithm(algorithm);

    // Simulate algorithm execution
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const result: AlgorithmResult = {
      id: Date.now().toString(),
      algorithmName: algorithm.name,
      timestamp: new Date(),
      executionTime: Math.random() * 5000 + 1000,
      accuracy: Math.random() * 0.3 + 0.7,
      quantumAdvantage: Math.random() * 0.5 + 0.1,
      parameters: {
        qubits: algorithm.qubits,
        depth: Math.floor(Math.random() * 20) + 5,
        fidelity: Math.random() * 0.2 + 0.8
      }
    };

    setResults(prev => [result, ...prev.slice(0, 9)]);
    setIsRunning(false);
  };

  return {
    algorithms,
    selectedAlgorithm,
    setSelectedAlgorithm,
    results,
    isRunning,
    runAlgorithm,
    searchQuery,
    setSearchQuery,
    filteredAlgorithms
  };
};
