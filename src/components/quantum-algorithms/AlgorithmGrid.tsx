
import React from 'react';
import { Button } from '@/components/ui/button';
import { Algorithm } from './types';

interface AlgorithmGridProps {
  algorithms: Algorithm[];
  selectedAlgorithm: Algorithm | null;
  setSelectedAlgorithm: (algorithm: Algorithm | null) => void;
  onRunAlgorithm: (algorithm: Algorithm) => Promise<void>;
  isRunning: boolean;
}

export const AlgorithmGrid: React.FC<AlgorithmGridProps> = ({
  algorithms,
  selectedAlgorithm,
  setSelectedAlgorithm,
  onRunAlgorithm,
  isRunning
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {algorithms.map((algorithm) => (
        <Button
          key={algorithm.id}
          variant="outline"
          onClick={() => {
            setSelectedAlgorithm(algorithm);
            onRunAlgorithm(algorithm);
          }}
          disabled={isRunning && selectedAlgorithm?.id === algorithm.id}
          className={`flex flex-col items-center gap-2 p-4 h-auto border-white/30 text-white hover:bg-white/20 transition-all hover:scale-105 ${
            isRunning && selectedAlgorithm?.id === algorithm.id ? 'bg-white/20 animate-pulse' : ''
          }`}
          title={algorithm.description}
        >
          <algorithm.icon className={`w-5 h-5 ${algorithm.color}`} />
          <span className="text-xs text-center">{algorithm.name}</span>
          <span className="text-xs text-gray-400">{algorithm.complexity}</span>
        </Button>
      ))}
    </div>
  );
};
