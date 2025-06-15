
import { useState, useEffect } from 'react';

export const useVirtualizationMetrics = (totalMessages: number) => {
  const [metrics, setMetrics] = useState({
    totalMessages: 0,
    renderedMessages: 0,
    renderTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Simulate render time measurement
    const measureRenderTime = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        totalMessages,
        renderTime: Math.round(renderTime * 100) / 100
      }));
    };

    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(measureRenderTime);
  }, [totalMessages]);

  const updateRenderedCount = (count: number) => {
    setMetrics(prev => ({
      ...prev,
      renderedMessages: count
    }));
  };

  const getPerformanceRatio = () => {
    if (metrics.totalMessages === 0) return 0;
    return (metrics.renderedMessages / metrics.totalMessages) * 100;
  };

  return {
    metrics,
    updateRenderedCount,
    getPerformanceRatio
  };
};
