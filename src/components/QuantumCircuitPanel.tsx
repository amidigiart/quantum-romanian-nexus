
import React from 'react';
import { QuantumCircuitData } from '@/types/quantumML';

interface QuantumCircuitPanelProps {
  quantumCircuit: QuantumCircuitData;
}

export const QuantumCircuitPanel: React.FC<QuantumCircuitPanelProps> = ({
  quantumCircuit
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-white font-semibold">Parametrii Circuit Cuantic:</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-sm">Porți Cuantice</div>
          <div className="text-cyan-400 font-bold text-lg">{quantumCircuit.gates.length}</div>
          <div className="text-xs text-gray-500">{quantumCircuit.gates.join(', ')}</div>
        </div>
        <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-sm">Adâncime Circuit</div>
          <div className="text-green-400 font-bold text-lg">{quantumCircuit.depth}</div>
        </div>
        <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-sm">Entanglement</div>
          <div className="text-purple-400 font-bold text-lg">{(quantumCircuit.entanglement * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center">
          <div className="text-gray-400 text-sm">Timp Coherență</div>
          <div className="text-yellow-400 font-bold text-lg">{quantumCircuit.coherenceTime}μs</div>
        </div>
      </div>
    </div>
  );
};
