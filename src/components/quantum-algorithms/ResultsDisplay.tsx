
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlgorithmResult } from './types';

interface ResultsDisplayProps {
  results: AlgorithmResult[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  return (
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
  );
};
