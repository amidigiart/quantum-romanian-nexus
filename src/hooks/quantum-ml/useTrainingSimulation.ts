
import { useState, useCallback } from 'react';
import { MLModel, TrainingMetrics, QuantumCircuitData } from './types';
import { generateTrainingMetrics, generateFinalModelStats } from './trainingUtils';

export const useTrainingSimulation = (
  activeModel: string,
  setModels: React.Dispatch<React.SetStateAction<Record<string, MLModel>>>,
  setTrainingHistory: React.Dispatch<React.SetStateAction<TrainingMetrics[]>>,
  setQuantumCircuit: React.Dispatch<React.SetStateAction<QuantumCircuitData>>
) => {
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);

  const startHybridTraining = useCallback(() => {
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
          
          const finalStats = generateFinalModelStats();
          
          setModels(prevModels => ({
            ...prevModels,
            [activeModel]: {
              ...prevModels[activeModel],
              status: 'trained',
              ...finalStats
            }
          }));
          
          return 100;
        }

        const { metrics, quantumCircuit } = generateTrainingMetrics(newProgress);

        setTrainingHistory(prev => [...prev.slice(-9), metrics]);
        setQuantumCircuit(quantumCircuit);

        setModels(prev => ({
          ...prev,
          [activeModel]: {
            ...prev[activeModel],
            accuracy: metrics.accuracy,
            quantumAccuracy: metrics.accuracy + metrics.quantumAdvantage * 0.1,
            classicalAccuracy: metrics.accuracy - metrics.quantumAdvantage * 0.05,
            loss: metrics.loss,
            epochs: metrics.epoch,
            hybridEfficiency: metrics.hybridScore
          }
        }));

        return newProgress;
      });
    }, 250);
  }, [isTraining, activeModel, setModels, setTrainingHistory, setQuantumCircuit]);

  const stopTraining = useCallback(() => {
    setIsTraining(false);
    setModels(prev => ({
      ...prev,
      [activeModel]: { ...prev[activeModel], status: 'idle' }
    }));
  }, [activeModel, setModels]);

  const resetModel = useCallback(() => {
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
  }, [activeModel, setModels, setTrainingHistory]);

  return {
    trainingProgress,
    isTraining,
    startHybridTraining,
    stopTraining,
    resetModel
  };
};
