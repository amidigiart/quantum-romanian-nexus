import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedChatPersistence } from './useOptimizedChatPersistence';
import { useToast } from '@/hooks/use-toast';
import { garbageCollectionService } from '@/services/cache/gc/garbageCollectionService';

interface MemoryConfig {
  maxMessagesInMemory: number;
  maxConversationsInMemory: number;
  cleanupThresholdDays: number;
  virtualizationBufferSize: number;
  gcThresholdMB: number;
}

const DEFAULT_MEMORY_CONFIG: MemoryConfig = {
  maxMessagesInMemory: 200,
  maxConversationsInMemory: 50,
  cleanupThresholdDays: 30,
  virtualizationBufferSize: 10,
  gcThresholdMB: 100
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
    totalMemoryMB: 0,
    gcMetrics: garbageCollectionService.getGCMetrics(),
    systemMemory: garbageCollectionService.getMemoryStats()
  });

  // Monitor memory usage with GC integration
  const updateMemoryUsage = useCallback(() => {
    const systemMemory = garbageCollectionService.getMemoryStats();
    const gcMetrics = garbageCollectionService.getGCMetrics();
    
    setMemoryUsage(prev => ({
      ...prev,
      totalMemoryMB: systemMemory.used,
      gcMetrics,
      systemMemory
    }));
  }, []);

  // Enhanced cleanup with GC trigger
  const performCleanup = useCallback(async (forceCleanup = false) => {
    if (!user) return 0;

    try {
      const daysSinceLastCleanup = memoryUsage.lastCleanup 
        ? Math.floor((Date.now() - memoryUsage.lastCleanup.getTime()) / (1000 * 60 * 60 * 24))
        : memoryConfig.cleanupThresholdDays + 1;

      if (forceCleanup || daysSinceLastCleanup >= memoryConfig.cleanupThresholdDays) {
        const deletedCount = await cleanupOldData(memoryConfig.cleanupThresholdDays);
        
        // Trigger GC after cleanup
        garbageCollectionService.forceGarbageCollection('cleanup');
        
        setMemoryUsage(prev => ({
          ...prev,
          lastCleanup: new Date(),
          conversationsInMemory: Math.max(0, prev.conversationsInMemory - deletedCount)
        }));

        if (deletedCount > 0) {
          toast({
            title: "Cleanup Complete",
            description: `Cleaned up ${deletedCount} old conversations and freed memory.`,
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

  // Enhanced memory pressure detection with GC integration
  const checkMemoryPressure = useCallback(() => {
    const systemMemory = garbageCollectionService.getMemoryStats();
    const isHighMemoryUsage = systemMemory.used > memoryConfig.gcThresholdMB;
    const isTooManyMessages = memoryUsage.messagesInMemory > memoryConfig.maxMessagesInMemory;
    const isTooManyConversations = memoryUsage.conversationsInMemory > memoryConfig.maxConversationsInMemory;

    if (isHighMemoryUsage || isTooManyMessages || isTooManyConversations) {
      console.log('Memory pressure detected, performing cleanup and GC');
      performCleanup(true);
      garbageCollectionService.forceGarbageCollection('pressure');
    }
  }, [memoryUsage, memoryConfig, performCleanup]);

  // Force garbage collection manually
  const forceGarbageCollection = useCallback(() => {
    const success = garbageCollectionService.forceGarbageCollection('manual');
    if (success) {
      updateMemoryUsage();
      toast({
        title: "Memory Optimized",
        description: "Garbage collection completed successfully.",
      });
    } else {
      toast({
        title: "Optimization Failed",
        description: "Unable to perform garbage collection.",
        variant: "destructive",
      });
    }
    return success;
  }, [updateMemoryUsage, toast]);

  // Track message and conversation counts
  const updateMessageCount = useCallback((count: number) => {
    setMemoryUsage(prev => ({ ...prev, messagesInMemory: count }));
  }, []);

  const updateConversationCount = useCallback((count: number) => {
    setMemoryUsage(prev => ({ ...prev, conversationsInMemory: count }));
  }, []);

  // Enhanced periodic monitoring with GC
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
    forceGarbageCollection,
    isMemoryOptimized: memoryUsage.systemMemory.usagePercent < 50 && 
                      memoryUsage.messagesInMemory < memoryConfig.maxMessagesInMemory
  };
};
