
import React from 'react';
import { Card } from '@/components/ui/card';
import { Atom } from 'lucide-react';

interface QuantumStatusProps {
  metrics: {
    activeQubits: number;
    coherence: number;
    entanglement: number;
  };
}

export const QuantumStatus = ({ metrics }: QuantumStatusProps) => {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Atom className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Status Cuantic</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Qubits Activi:</span>
          <span className="text-green-400 font-bold">{metrics.activeQubits}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Coerență:</span>
          <span className="text-blue-400 font-bold">{metrics.coherence}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Entanglement:</span>
          <span className="text-purple-400 font-bold">{metrics.entanglement}%</span>
        </div>
      </div>
    </Card>
  );
};
