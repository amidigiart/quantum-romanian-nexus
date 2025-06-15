
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/hooks/useChat';

interface BatchOperation {
  id: string;
  type: 'message' | 'conversation_update' | 'user_preference';
  data: any;
  conversationId?: string;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
  retryCount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

interface BatchConfig {
  maxBatchSize: number;
  flushIntervalMs: number;
  maxRetries: number;
  priorityThresholds: {
    high: number;
    normal: number;
    low: number;
  };
}

const DEFAULT_CONFIG: BatchConfig = {
  maxBatchSize: 25,
  flushIntervalMs: 2000,
  maxRetries: 3,
  priorityThresholds: {
    high: 5,    // Flush when 5 high priority items
    normal: 15, // Flush when 15 normal priority items
    low: 25     // Flush when 25 low priority items
  }
};

export const useBatchOperations = (config: Partial<BatchConfig> = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    queued: 0,
    processed: 0,
    failed: 0,
    retries: 0
  });

  const batchConfig = { ...DEFAULT_CONFIG, ...config };
  const operationsQueue = useRef<BatchOperation[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

  // Update stats
  const updateStats = useCallback(() => {
    setStats({
      queued: operationsQueue.current.length,
      processed: stats.processed,
      failed: stats.failed,
      retries: stats.retries
    });
  }, [stats.processed, stats.failed, stats.retries]);

  // Process batch operations by type
  const processBatch = useCallback(async (operations: BatchOperation[]) => {
    if (!user || operations.length === 0) return;

    try {
      setIsProcessing(true);
      processingRef.current = true;

      // Group operations by type
      const operationGroups = operations.reduce((groups, op) => {
        if (!groups[op.type]) groups[op.type] = [];
        groups[op.type].push(op);
        return groups;
      }, {} as Record<string, BatchOperation[]>);

      const results = await Promise.allSettled([
        ...Object.entries(operationGroups).map(([type, ops]) => 
          processBatchByType(type as any, ops)
        )
      ]);

      // Handle results
      let successCount = 0;
      let failureCount = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount += result.value.success;
          failureCount += result.value.failed;
        } else {
          failureCount += Object.values(operationGroups)[index].length;
        }
      });

      setStats(prev => ({
        ...prev,
        processed: prev.processed + successCount,
        failed: prev.failed + failureCount
      }));

      console.log(`Batch processed: ${successCount} success, ${failureCount} failed`);

    } catch (error) {
      console.error('Error in batch processing:', error);
      toast({
        title: "Batch Processing Error",
        description: "Some operations could not be completed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [user, toast]);

  // Process operations by specific type
  const processBatchByType = async (type: string, operations: BatchOperation[]) => {
    let successCount = 0;
    let failedCount = 0;

    try {
      switch (type) {
        case 'message':
          const messageResults = await batchInsertMessages(operations);
          successCount += messageResults.success;
          failedCount += messageResults.failed;
          break;

        case 'conversation_update':
          const convResults = await batchUpdateConversations(operations);
          successCount += convResults.success;
          failedCount += convResults.failed;
          break;

        case 'user_preference':
          const prefResults = await batchUpdatePreferences(operations);
          successCount += prefResults.success;
          failedCount += prefResults.failed;
          break;

        default:
          console.warn(`Unknown operation type: ${type}`);
          failedCount += operations.length;
      }
    } catch (error) {
      console.error(`Error processing ${type} operations:`, error);
      failedCount += operations.length;
      
      // Call error callbacks
      operations.forEach(op => op.onError?.(error));
    }

    return { success: successCount, failed: failedCount };
  };

  // Batch insert messages
  const batchInsertMessages = async (operations: BatchOperation[]) => {
    if (!user) return { success: 0, failed: operations.length };

    try {
      const messageData = operations.map(op => ({
        conversation_id: op.conversationId,
        user_id: user.id,
        content: op.data.text,
        message_type: op.data.isBot ? 'assistant' : 'user',
        quantum_data: op.data.quantum_data || null
      }));

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData);

      if (error) throw error;

      // Call success callbacks
      operations.forEach(op => op.onSuccess?.());
      
      return { success: operations.length, failed: 0 };
    } catch (error) {
      operations.forEach(op => op.onError?.(error));
      return { success: 0, failed: operations.length };
    }
  };

  // Batch update conversations
  const batchUpdateConversations = async (operations: BatchOperation[]) => {
    if (!user) return { success: 0, failed: operations.length };

    try {
      const updates = await Promise.allSettled(
        operations.map(async (op) => {
          const { error } = await supabase
            .from('chat_conversations')
            .update({
              updated_at: new Date().toISOString(),
              ...op.data
            })
            .eq('id', op.conversationId)
            .eq('user_id', user.id);

          if (error) throw error;
          op.onSuccess?.();
          return true;
        })
      );

      const successCount = updates.filter(r => r.status === 'fulfilled').length;
      const failedCount = updates.filter(r => r.status === 'rejected').length;

      return { success: successCount, failed: failedCount };
    } catch (error) {
      operations.forEach(op => op.onError?.(error));
      return { success: 0, failed: operations.length };
    }
  };

  // Batch update user preferences
  const batchUpdatePreferences = async (operations: BatchOperation[]) => {
    if (!user) return { success: 0, failed: operations.length };

    try {
      // Merge all preference updates
      const mergedPrefs = operations.reduce((acc, op) => ({ ...acc, ...op.data }), {});

      const { error } = await supabase
        .from('user_preferences')
        .update({
          ...mergedPrefs,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      operations.forEach(op => op.onSuccess?.());
      return { success: operations.length, failed: 0 };
    } catch (error) {
      operations.forEach(op => op.onError?.(error));
      return { success: 0, failed: operations.length };
    }
  };

  // Check if should flush based on priority and counts
  const shouldFlushBatch = useCallback(() => {
    const operations = operationsQueue.current;
    if (operations.length === 0) return false;

    const priorityCounts = operations.reduce((counts, op) => {
      counts[op.priority]++;
      return counts;
    }, { high: 0, normal: 0, low: 0 });

    return (
      priorityCounts.high >= batchConfig.priorityThresholds.high ||
      priorityCounts.normal >= batchConfig.priorityThresholds.normal ||
      priorityCounts.low >= batchConfig.priorityThresholds.low ||
      operations.length >= batchConfig.maxBatchSize
    );
  }, [batchConfig]);

  // Schedule flush
  const scheduleFlush = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
    }

    if (shouldFlushBatch()) {
      // Flush immediately for high priority or when thresholds are met
      flushBatch();
    } else {
      // Schedule delayed flush
      flushTimeoutRef.current = setTimeout(() => {
        flushBatch();
      }, batchConfig.flushIntervalMs);
    }
  }, [shouldFlushBatch, batchConfig.flushIntervalMs]);

  // Add operation to batch
  const addOperation = useCallback((
    type: BatchOperation['type'],
    data: any,
    options: {
      conversationId?: string;
      priority?: 'high' | 'normal' | 'low';
      onSuccess?: () => void;
      onError?: (error: any) => void;
    } = {}
  ) => {
    const operation: BatchOperation = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      conversationId: options.conversationId,
      priority: options.priority || 'normal',
      timestamp: Date.now(),
      retryCount: 0,
      onSuccess: options.onSuccess,
      onError: options.onError
    };

    operationsQueue.current.push(operation);
    updateStats();
    scheduleFlush();
  }, [updateStats, scheduleFlush]);

  // Flush batch manually
  const flushBatch = useCallback(async () => {
    if (processingRef.current || operationsQueue.current.length === 0) return;

    const operations = operationsQueue.current.splice(0, batchConfig.maxBatchSize);
    
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }

    await processBatch(operations);
    updateStats();

    // Continue processing if more operations are queued
    if (operationsQueue.current.length > 0) {
      scheduleFlush();
    }
  }, [processBatch, updateStats, scheduleFlush, batchConfig.maxBatchSize]);

  // Clear all operations
  const clearBatch = useCallback(() => {
    operationsQueue.current = [];
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
    updateStats();
  }, [updateStats]);

  // Auto-flush on unmount or page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (operationsQueue.current.length > 0) {
        // Attempt synchronous flush for critical data
        flushBatch();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && operationsQueue.current.length > 0) {
        flushBatch();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      
      // Final flush attempt
      if (operationsQueue.current.length > 0) {
        flushBatch();
      }
    };
  }, [flushBatch]);

  return {
    addOperation,
    flushBatch,
    clearBatch,
    isProcessing,
    stats,
    queueSize: operationsQueue.current.length
  };
};
