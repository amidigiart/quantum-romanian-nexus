
import { useState } from 'react';
import { MLModel, TrainingMetrics, QuantumCircuitData, HybridMode } from './quantum-ml/types';
import { createInitialModels } from './quantum-ml/initialModels';
import { useTrainingSimulation } from './quantum-ml/useTrainingSimulation';

export const useQuantumML = () => {
  const [activeModel, setActiveModel] = useState<string>('hvqc');
  const [hybridMode, setHybridMode] = useState<HybridMode>('parallel');
  const [models, setModels] = useState<Record<string, MLModel>>(createInitialModels());
  const [trainingHistory, setTrainingHistory] = useState<TrainingMetrics[]>([]);
  const [quantumCircuit, setQuantumCircuit] = useState<QuantumCircuitData>({
    gates: ['H', 'CNOT', 'RY', 'RZ'],
    depth: 12,
    entanglement: 0.85,
    coherenceTime: 100
  });

  const {
    trainingProgress,
    isTraining,
    startHybridTraining,
    stopTraining,
    resetModel
  } = useTrainingSimulation(activeModel, setModels, setTrainingHistory, setQuantumCircuit);

  return {
    activeModel,
    setActiveModel,
    trainingProgress,
    isTraining,
    hybridMode,
    setHybridMode,
    models,
    trainingHistory,
    quantumCircuit,
    startHybridTraining,
    stopTraining,
    resetModel
  };
};
