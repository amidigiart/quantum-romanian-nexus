
export interface MLModel {
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'optimization';
  accuracy: number;
  quantumAccuracy: number;
  classicalAccuracy: number;
  loss: number;
  epochs: number;
  status: 'training' | 'trained' | 'idle';
  quantumLayers: number;
  classicalLayers: number;
  hybridEfficiency: number;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  quantumAdvantage: number;
  classicalComponent: number;
  quantumComponent: number;
  hybridScore: number;
}

export interface QuantumCircuitData {
  gates: string[];
  depth: number;
  entanglement: number;
  coherenceTime: number;
}

export type HybridMode = 'quantum-first' | 'classical-first' | 'parallel';
