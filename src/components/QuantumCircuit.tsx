
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Microchip, Zap, RotateCcw } from 'lucide-react';

export const QuantumCircuit = () => {
  const [qubits, setQubits] = useState(['|0⟩', '|0⟩', '|0⟩', '|+⟩']);
  const [circuitOutput, setCircuitOutput] = useState(`|ψ⟩ = α|0000⟩ + β|0001⟩ + γ|0010⟩ + δ|0011⟩
Probabilități:
|0000⟩: 25.0%
|0001⟩: 25.0%
|0010⟩: 25.0%
|0011⟩: 25.0%`);

  const quantumGates = [
    { name: 'H', description: 'Hadamard' },
    { name: 'X', description: 'Pauli-X' },
    { name: 'Y', description: 'Pauli-Y' },
    { name: 'Z', description: 'Pauli-Z' },
    { name: 'CNOT', description: 'Controlled-NOT' },
    { name: 'T', description: 'T Gate' }
  ];

  const applyGate = (gate: string) => {
    const gateEffects = {
      'H': 'Poarta Hadamard aplicată - qubit în superpoziție',
      'X': 'Poarta Pauli-X aplicată - qubit inversat',
      'Y': 'Poarta Pauli-Y aplicată - rotația Y',
      'Z': 'Poarta Pauli-Z aplicată - schimbare de fază',
      'CNOT': 'Poarta CNOT aplicată - entanglement creat',
      'T': 'Poarta T aplicată - rotația T'
    };

    // Update qubit states randomly for demonstration
    if (gate === 'H') {
      setQubits(prev => prev.map((qubit, i) => 
        i === 0 ? (qubit === '|0⟩' ? '|+⟩' : '|0⟩') : qubit
      ));
    } else if (gate === 'X') {
      setQubits(prev => prev.map((qubit, i) => 
        i === 1 ? (qubit === '|0⟩' ? '|1⟩' : '|0⟩') : qubit
      ));
    }

    const newOutput = `Poarta ${gate} aplicată cu succes!
${gateEffects[gate]}

|ψ⟩ = α|0000⟩ + β|0001⟩ + γ|0010⟩ + δ|0011⟩
Probabilități actualizate:
|0000⟩: ${(Math.random() * 30 + 10).toFixed(1)}%
|0001⟩: ${(Math.random() * 30 + 10).toFixed(1)}%
|0010⟩: ${(Math.random() * 30 + 10).toFixed(1)}%
|0011⟩: ${(Math.random() * 30 + 10).toFixed(1)}%`;

    setCircuitOutput(newOutput);
  };

  const resetCircuit = () => {
    setQubits(['|0⟩', '|0⟩', '|0⟩', '|+⟩']);
    setCircuitOutput(`|ψ⟩ = α|0000⟩ + β|0001⟩ + γ|0010⟩ + δ|0011⟩
Probabilități:
|0000⟩: 25.0%
|0001⟩: 25.0%
|0010⟩: 25.0%
|0011⟩: 25.0%`);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Microchip className="w-6 h-6 text-cyan-400" />
          <h3 className="text-2xl font-bold text-white">Simulator Circuit Cuantic</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetCircuit}
          className="border-white/30 text-white hover:bg-white/20"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Qubits */}
      <div className="mb-6">
        <h4 className="text-lg text-white mb-3">Qubits:</h4>
        <div className="flex flex-wrap gap-2">
          {qubits.map((qubit, index) => (
            <div
              key={index}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-110 transition-transform"
              title={`Qubit ${index}: ${qubit}`}
            >
              {qubit}
            </div>
          ))}
        </div>
      </div>

      {/* Quantum Gates */}
      <div className="mb-6">
        <h4 className="text-lg text-white mb-3">Porți Cuantice:</h4>
        <div className="grid grid-cols-3 gap-2">
          {quantumGates.map((gate, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => applyGate(gate.name)}
              className="border-white/30 text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:border-transparent transition-all hover:scale-105"
              title={gate.description}
            >
              <Zap className="w-3 h-3 mr-1" />
              {gate.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Circuit Output */}
      <div className="bg-black/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-white font-semibold">Rezultat Circuit:</h4>
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            Activ
          </Badge>
        </div>
        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap leading-relaxed">
          {circuitOutput}
        </pre>
      </div>
    </Card>
  );
};
