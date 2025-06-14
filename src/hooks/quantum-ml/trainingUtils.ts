
import { TrainingMetrics, QuantumCircuitData } from './types';

export const generateTrainingMetrics = (progress: number): {
  metrics: TrainingMetrics;
  quantumCircuit: QuantumCircuitData;
} => {
  const currentEpoch = Math.floor(progress);
  const currentLoss = 1.0 - (progress / 100) * 0.95 + Math.random() * 0.05;
  const currentAccuracy = (progress / 100) * 0.9 + Math.random() * 0.08;
  const quantumAdvantage = Math.random() * 0.4 + 0.1;
  const classicalComponent = 0.3 + Math.random() * 0.4;
  const quantumComponent = 0.3 + Math.random() * 0.4;
  const hybridScore = (quantumComponent + classicalComponent) * (1 + quantumAdvantage * 0.5);

  const metrics: TrainingMetrics = {
    epoch: currentEpoch,
    loss: currentLoss,
    accuracy: currentAccuracy,
    quantumAdvantage: quantumAdvantage,
    classicalComponent: classicalComponent,
    quantumComponent: quantumComponent,
    hybridScore: Math.min(1, hybridScore)
  };

  const quantumCircuit: QuantumCircuitData = {
    gates: ['H', 'CNOT', 'RY', 'RZ'],
    depth: Math.floor(10 + Math.random() * 8),
    entanglement: Math.random() * 0.3 + 0.7,
    coherenceTime: Math.floor(80 + Math.random() * 40)
  };

  return { metrics, quantumCircuit };
};

export const generateFinalModelStats = () => {
  const quantumAdvantage = Math.random() * 0.25 + 0.15; // 15-40% quantum advantage
  const finalAccuracy = Math.random() * 0.10 + 0.88; // 88-98%
  const quantumAccuracy = finalAccuracy + quantumAdvantage * 0.3;
  const classicalAccuracy = finalAccuracy - quantumAdvantage * 0.2;
  const hybridEfficiency = Math.random() * 0.2 + 0.75; // 75-95%
  const finalLoss = Math.random() * 0.05 + 0.01; // 0.01-0.06

  return {
    accuracy: finalAccuracy,
    quantumAccuracy: Math.max(0, Math.min(1, quantumAccuracy)),
    classicalAccuracy: Math.max(0, Math.min(1, classicalAccuracy)),
    loss: finalLoss,
    epochs: 100,
    hybridEfficiency: hybridEfficiency
  };
};
