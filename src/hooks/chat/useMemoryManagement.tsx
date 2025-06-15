
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedChatPersistence } from './useOptimizedChatPersistence';
import { useToast } from '@/hooks/use-toast';

interface MemoryConfig {
  maxMessagesInMemory: number;
  maxConversationsInMemory: number;
  cleanupThresholdDays: number;
  virtualizationBufferSize: number;
}

const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
  maxMessagesInMemory: 200,
  maxConversationsInMemory: 50,
  cleanupThresholdDays: 30,
  virtualizationBufferSize: 10
};

export const useMemoryManagement = (config: Partial<MemoryConfig> = {}) => {
  const { user } = useAuth();
  const { cleanupOldData } = useOptimizedChatPersistence();
  const { toast } = useToast();
  
  const [memoryConfig] = useState<MemoryConfig>({ ...DEFAULT_MEMORY_CONFIG, ...config });
  const [memoryUsage, setMemoryUsage] = useState({
    messagesInMemory: 0,
    conversationsInMemory: 0,
    lastCleanup: null as Date | null,
    totalMemoryMB: 0
  });

  // Monitor memory usage
  const updateMemoryUsage = useCallback(() => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      setMemoryUsage(prev => ({
        ...prev,
        totalMemoryMB: Math.round(memory.usedJSHeapSize / (1024 * 1024))
      }));
    }
  }, []);

  // Cleanup old conversations based on threshold
  const performCleanup = useCallback(async (forceCleanup = false) => {
    if (!user) return 0;

    try {
      const daysSinceLastCleanup = memoryUsage.lastCleanup 
        ? Math.floor((Date.now() - memoryUsage.lastCleanup.getTime()) / (1000 * 60 * 60 * 24))
        : memoryConfig.cleanupThresholdDays + 1;

      if (forceCleanup || daysSinceLastCleanup >= memoryConfig.cleanupThresholdDays) {
        const deletedCount = await cleanupOldData(memoryConfig.cleanupThresholdDays);
        
        setMemoryUsage(prev => ({
          ...prev,
          lastCleanup: new Date(),
          conversationsInMemory: Math.max(0, prev.conversationsInMemory - deletedCount)
        }));

        if (deletedCount > 0) {
          toast({
            title: "Cleanup Complete",
            description: `Cleaned up ${deletedCount} old conversations to optimize memory usage.`,
          });
        }

        return deletedCount;
      }
      
      return 0;
    } catch (error) {
      console.error('Error during memory cleanup:', error);
      toast({
        title: "Cleanup Error",
        description: "Failed to cleanup old data. Please try again later.",
        variant: "destructive",
      });
      return 0;
    }
  }, [user, memoryUsage.lastCleanup, memoryConfig.cleanupThresholdDays, cleanupOldData, toast]);

  // Virtualization helper for message lists
  const getVirtualizedRange = useCallback((
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number
  ) => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - memoryConfig.virtualizationBufferSize);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + (memoryConfig.virtualizationBufferSize * 2);
    const endIndex = Math.min(totalItems, startIndex + visibleCount);

    return {
      startIndex,
      endIndex,
      visibleCount: endIndex - startIndex,
      totalHeight: totalItems * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [memoryConfig.virtualizationBufferSize]);

  // Memory pressure detection and automatic cleanup
  const checkMemoryPressure = useCallback(() => {
    const isHighMemoryUsage = memoryUsage.totalMemoryMB > 100; // 100MB threshold
    const isTooManyMessages = memoryUsage.messagesInMemory > memoryConfig.maxMessagesInMemory;
    const isTooManyConversations = memoryUsage.conversationsInMemory > memoryConfig.maxConversationsInMemory;

    if (isHighMemoryUsage || isTooManyMessages || isTooManyConversations) {
      performCleanup(true);
      
      // Force garbage collection if available (development only)
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && 'gc' in window) {
        (window as any).gc();
      }
    }
  }, [memoryUsage, memoryConfig, performCleanup]);

  // Track message and conversation counts
  const updateMessageCount = useCallback((count: number) => {
    setMemoryUsage(prev => ({ ...prev, messagesInMemory: count }));
  }, []);

  const updateConversationCount = useCallback((count: number) => {
    setMemoryUsage(prev => ({ ...prev, conversationsInMemory: count }));
  }, []);

  // Periodic memory monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      updateMemoryUsage();
      checkMemoryPressure();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [updateMemoryUsage, checkMemoryPressure]);

  // Initial cleanup on mount
  useEffect(() => {
    if (user && !memoryUsage.lastCleanup) {
      performCleanup();
    }
  }, [user, memoryUsage.lastCleanup, performCleanup]);

  return {
    memoryConfig,
    memoryUsage,
    performCleanup,
    getVirtualizedRange,
    updateMessageCount,
    updateConversationCount,
    checkMemoryPressure,
    isMemoryOptimized: memoryUsage.totalMemoryMB < 50 && memoryUsage.messagesInMemory < memoryConfig.maxMessagesInMemory
  };
};
