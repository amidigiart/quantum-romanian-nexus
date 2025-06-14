
import { HybridMode } from '@/types/quantumML';

export const hybridStrategies: Record<HybridMode, string> = {
  'quantum-first': 'Procesare cuantică urmată de post-procesare clasică',
  'classical-first': 'Pre-procesare clasică urmată de procesare cuantică',
  'parallel': 'Procesare paralelă cu fuziune adaptivă'
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatLoss = (value: number): string => {
  return value.toFixed(4);
};
