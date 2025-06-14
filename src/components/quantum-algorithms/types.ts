
export interface Algorithm {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  complexity: string;
  color: string;
  category: string;
  qubits: number;
}

export interface AlgorithmResult {
  id: string;
  name: string;
  result: string;
  complexity: string;
  status: 'running' | 'completed' | 'error';
  algorithmName: string;
  timestamp: Date;
  executionTime: number;
  accuracy: number;
  quantumAdvantage: number;
  parameters: {
    qubits: number;
    depth: number;
    fidelity: number;
  };
}
