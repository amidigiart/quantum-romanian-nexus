
export interface QuantumNode {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'source' | 'intermediate' | 'destination';
  entanglementCount: number;
  fidelity: number;
  active: boolean;
}

export interface QuantumLink {
  id: string;
  from: string;
  to: string;
  distance: number;
  fidelity: number;
  active: boolean;
  entangled: boolean;
}

export interface CommunicationRoute {
  id: string;
  path: string[];
  totalDistance: number;
  expectedFidelity: number;
  hops: number;
  status: 'idle' | 'establishing' | 'active' | 'completed' | 'failed';
}

export interface NetworkMetrics {
  totalNodes: number;
  activeConnections: number;
  averageFidelity: number;
  successfulTransmissions: number;
  swappingOperations: number;
}
