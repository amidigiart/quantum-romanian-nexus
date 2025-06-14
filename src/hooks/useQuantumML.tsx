
import { useState, useEffect } from 'react';
import { MLModel, TrainingMetrics, QuantumCircuitData, HybridMode } from '@/types/quantumML';

export const useQuantumML = () => {
  const [activeModel, setActiveModel] = useState<string>('hvqc');
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [hybridMode, setHybridMode] = useState<HybridMode>('parallel');
  
  const [models, setModels] = useState<Record<string, MLModel>>({
    hvqc: {
      name: 'Hybrid Variational Quantum Classifier',
      type: 'classification',
      accuracy: 0,
      quantumAccuracy: 0,
      classicalAccuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle',
      quantumLayers: 4,
      classicalLayers: 3,
      hybridEfficiency: 0
    },
    qcnn: {
      name: 'Quantum Convolutional Neural Network',
      type: 'classification',
      accuracy: 0,
      quantumAccuracy: 0,
      classicalAccuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle',
      quantumLayers: 6,
      classicalLayers: 2,
      hybridEfficiency: 0
    },
    qrnn: {
      name: 'Quantum Recurrent Neural Network',
      type: 'regression',
      accuracy: 0,
      quantumAccuracy: 0,
      classicalAccuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle',
      quantumLayers: 5,
      classicalLayers: 4,
      hybridEfficiency: 0
    },
    qtransformer: {
      name: 'Quantum Transformer',
      type: 'optimization',
      accuracy: 0,
      quantumAccuracy: 0,
      classicalAccuracy: 0,
      loss: 1.0,
      epochs: 0,
      status: 'idle',
      quantumLayers: 8,
      classicalLayers: 6,
      hybridEfficiency: 0
    }
  });

  const [trainingHistory, setTrainingHistory] = useState<TrainingMetrics[]>([]);
  const [quantumCircuit, setQuantumCircuit] = useState<QuantumCircuitData>({
    gates: ['H', 'CNOT', 'RY', 'RZ'],
    depth: 12,
    entanglement: 0.85,
    coherenceTime: 100
  });

  const startHybridTraining = () => {
    if (isTraining) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    setModels(prev => ({
      ...prev,
      [activeModel]: { ...prev[activeModel], status: 'training', epochs: 0 }
    }));

    const trainingInterval = setInterval(() => {
      setTrainingProgress(prev => {
        const newProgress = prev + Math.random() * 3 + 1;
        
        if (newProgress >= 100) {
          clearInterval(trainingInterval);
          setIsTraining(false);
          
          // Enhanced final model update with hybrid metrics
          const quantumAdvantage = Math.random() * 0.25 + 0.15; // 15-40% quantum advantage
          const finalAccuracy = Math.random() * 0.10 + 0.88; // 88-98%
          const quantumAccuracy = finalAccuracy + quantumAdvantage * 0.3;
          const classicalAccuracy = finalAccuracy - quantumAdvantage * 0.2;
          const hybridEfficiency = Math.random() * 0.2 + 0.75; // 75-95%
          const finalLoss = Math.random() * 0.05 + 0.01; // 0.01-0.06
          
          setModels(prev => ({
            ...prev,
            [activeModel]: {
              ...prev[activeModel],
              status: 'trained',
              accuracy: finalAccuracy,
              quantumAccuracy: Math.max(0, Math.min(1, quantumAccuracy)),
              classicalAccuracy: Math.max(0, Math.min(1, classicalAccuracy)),
              loss: finalLoss,
              epochs: 100,
              hybridEfficiency: hybridEfficiency
            }
          }));
          
          return 100;
        }

        // Enhanced training metrics with hybrid components
        const currentEpoch = Math.floor(newProgress);
        const currentLoss = 1.0 - (newProgress / 100) * 0.95 + Math.random() * 0.05;
        const currentAccuracy = (newProgress / 100) * 0.9 + Math.random() * 0.08;
        const quantumAdvantage = Math.random() * 0.4 + 0.1;
        const classicalComponent = 0.3 + Math.random() * 0.4;
        const quantumComponent = 0.3 + Math.random() * 0.4;
        const hybridScore = (quantumComponent + classicalComponent) * (1 + quantumAdvantage * 0.5);

        setTrainingHistory(prev => [...prev.slice(-9), {
          epoch: currentEpoch,
          loss: currentLoss,
          accuracy: currentAccuracy,
          quantumAdvantage: quantumAdvantage,
          classicalComponent: classicalComponent,
          quantumComponent: quantumComponent,
          hybridScore: Math.min(1, hybridScore)
        }]);

        // Update quantum circuit parameters
        setQuantumCircuit(prev => ({
          ...prev,
          depth: Math.floor(10 + Math.random() * 8),
          entanglement: Math.random() * 0.3 + 0.7,
          coherenceTime: Math.floor(80 + Math.random() * 40)
        }));

        setModels(prev => ({
          ...prev,
          [activeModel]: {
            ...prev[activeModel],
            accuracy: currentAccuracy,
            quantumAccuracy: currentAccuracy + quantumAdvantage * 0.1,
            classicalAccuracy: currentAccuracy - quantumAdvantage * 0.05,
            loss: currentLoss,
            epochs: currentEpoch,
            hybridEfficiency: hybridScore
          }
        }));

        return newProgress;
      });
    }, 250);
  };

  const stopTraining = () => {
    setIsTraining(false);
    setModels(prev => ({
      ...prev,
      [activeModel]: { ...prev[activeModel], status: 'idle' }
    }));
  };

  const resetModel = () => {
    setModels(prev => ({
      ...prev,
      [activeModel]: {
        ...prev[activeModel],
        accuracy: 0,
        quantumAccuracy: 0,
        classicalAccuracy: 0,
        loss: 1.0,
        epochs: 0,
        status: 'idle',
        hybridEfficiency: 0
      }
    }));
    setTrainingProgress(0);
    setTrainingHistory([]);
  };

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
