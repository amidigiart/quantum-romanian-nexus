
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useOptimizedChatPersistence } from './useOptimizedChatPersistence';
import { useToast } from '@/hooks/use-toast';
import { garbageCollectionService } from '@/services/cache/gc/garbageCollectionService';
import { ComponentMemoryThreshold } from '@/services/cache/gc/types';

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
    systemMemory: garbageCollectionService.getMemoryStats(),
    componentStatus: garbageCollectionService.getComponentMemoryStatus()
  });

  // Monitor memory usage with GC and component tracking
  const updateMemoryUsage = useCallback(() => {
    const systemMemory = garbageCollectionService.getMemoryStats();
    const gcMetrics = garbageCollectionService.getGCMetrics();
    const componentStatus = garbageCollectionService.getComponentMemoryStatus();
    
    // Update component memory usage based on current state
    garbageCollectionService.updateComponentMemory('chat-messages', memoryUsage.messagesInMemory * 0.1); // Estimate 0.1MB per message
    garbageCollectionService.updateComponentMemory('conversation-history', memoryUsage.conversationsInMemory * 1.5); // Estimate 1.5MB per conversation
    
    setMemoryUsage(prev => ({
      ...prev,
      totalMemoryMB: systemMemory.used,
      gcMetrics,
      systemMemory,
      componentStatus
    }));
  }, [memoryUsage.messagesInMemory, memoryUsage.conversationsInMemory]);

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

  // Enhanced memory pressure detection with component thresholds
  const checkMemoryPressure = useCallback(() => {
    const systemMemory = garbageCollectionService.getMemoryStats();
    const componentStatus = garbageCollectionService.getComponentMemoryStatus();
    
    const isHighMemoryUsage = systemMemory.used > memoryConfig.gcThresholdMB;
    const isTooManyMessages = memoryUsage.messagesInMemory > memoryConfig.maxMessagesInMemory;
    const isTooManyConversations = memoryUsage.conversationsInMemory > memoryConfig.maxConversationsInMemory;
    const hasComponentPressure = componentStatus.overThreshold.length > 0;

    if (isHighMemoryUsage || isTooManyMessages || isTooManyConversations || hasComponentPressure) {
      console.log('Memory pressure detected, performing cleanup and GC');
      if (hasComponentPressure) {
        console.log('Component pressure detected:', componentStatus.overThreshold.map(c => c.componentName).join(', '));
      }
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

  // Component threshold management
  const updateComponentThreshold = useCallback((threshold: ComponentMemoryThreshold) => {
    garbageCollectionService.updateComponentThreshold(threshold);
    updateMemoryUsage();
    toast({
      title: "Threshold Updated",
      description: `Updated memory threshold for ${threshold.componentName}.`,
    });
  }, [updateMemoryUsage, toast]);

  const removeComponentThreshold = useCallback((componentName: string) => {
    garbageCollectionService.removeComponentThreshold(componentName);
    updateMemoryUsage();
    toast({
      title: "Threshold Removed",
      description: `Removed memory threshold for ${componentName}.`,
    });
  }, [updateMemoryUsage, toast]);

  // Track message and conversation counts
  const updateMessageCount = useCallback((count: number) => {
    setMemoryUsage(prev => ({ ...prev, messagesInMemory: count }));
    // Update component memory for chat messages
    garbageCollectionService.updateComponentMemory('chat-messages', count * 0.1);
  }, []);

  const updateConversationCount = useCallback((count: number) => {
    setMemoryUsage(prev => ({ ...prev, conversationsInMemory: count }));
    // Update component memory for conversation history
    garbageCollectionService.updateComponentMemory('conversation-history', count * 1.5);
  }, []);

  // Enhanced periodic monitoring with component tracking
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
    updateComponentThreshold,
    removeComponentThreshold,
    isMemoryOptimized: memoryUsage.systemMemory.usagePercent < 50 && 
                      memoryUsage.messagesInMemory < memoryConfig.maxMessagesInMemory &&
                      memoryUsage.componentStatus.overThreshold.length === 0
  };
};
