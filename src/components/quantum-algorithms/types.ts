
export interface Algorithm {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  complexity: string;
  color: string;
}

export interface AlgorithmResult {
  name: string;
  result: string;
  complexity: string;
  status: 'running' | 'completed' | 'error';
}
