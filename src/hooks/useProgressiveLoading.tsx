
import { useState, useEffect, useCallback } from 'react';

interface LoadingStage {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  loaded: boolean;
  loading: boolean;
}

interface UseProgressiveLoadingOptions {
  stages: Array<{
    id: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    loadFn: () => Promise<void>;
  }>;
  batchSize?: number;
  delayBetweenBatches?: number;
}

export const useProgressiveLoading = ({
  stages,
  batchSize = 2,
  delayBetweenBatches = 100
}: UseProgressiveLoadingOptions) => {
  const [loadingStages, setLoadingStages] = useState<LoadingStage[]>(
    stages.map(stage => ({
      id: stage.id,
      priority: stage.priority,
      loaded: false,
      loading: false
    }))
  );

  const [currentBatch, setCurrentBatch] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadStage = useCallback(async (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    setLoadingStages(prev => 
      prev.map(s => 
        s.id === stageId ? { ...s, loading: true } : s
      )
    );

    try {
      await stage.loadFn();
      setLoadingStages(prev => 
        prev.map(s => 
          s.id === stageId ? { ...s, loaded: true, loading: false } : s
        )
      );
    } catch (error) {
      console.error(`Failed to load stage ${stageId}:`, error);
      setLoadingStages(prev => 
        prev.map(s => 
          s.id === stageId ? { ...s, loading: false } : s
        )
      );
    }
  }, [stages]);

  useEffect(() => {
    // Sort stages by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const sortedStages = [...stages].sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    // Load stages in batches
    const loadNextBatch = async () => {
      const startIndex = currentBatch * batchSize;
      const endIndex = Math.min(startIndex + batchSize, sortedStages.length);
      
      if (startIndex >= sortedStages.length) {
        setIsComplete(true);
        return;
      }

      const currentBatchStages = sortedStages.slice(startIndex, endIndex);
      
      // Load current batch in parallel
      await Promise.all(
        currentBatchStages.map(stage => loadStage(stage.id))
      );

      // Delay before next batch
      setTimeout(() => {
        setCurrentBatch(prev => prev + 1);
      }, delayBetweenBatches);
    };

    loadNextBatch();
  }, [currentBatch, batchSize, delayBetweenBatches, loadStage, stages]);

  const getStageStatus = (stageId: string) => {
    return loadingStages.find(s => s.id === stageId);
  };

  const getOverallProgress = () => {
    const loaded = loadingStages.filter(s => s.loaded).length;
    return (loaded / loadingStages.length) * 100;
  };

  return {
    loadingStages,
    isComplete,
    getStageStatus,
    getOverallProgress,
    loadStage
  };
};
