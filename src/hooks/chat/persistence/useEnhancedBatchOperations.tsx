
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage } from '@/hooks/useChat';
import { optimizedQueryExecutor } from '@/services/database/optimizedQueryExecutor';

interface BatchOperationMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageExecutionTime: number;
  lastBatchSize: number;
}

export const useEnhancedBatchOperations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<BatchOperationMetrics>({
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    averageExecutionTime: 0,
    lastBatchSize: 0
  });

  const executeBatchMessageInsert = useCallback(async (
    messages: ChatMessage[],
    conversationId: string,
    options: {
      batchSize?: number;
      delayBetweenBatches?: number;
      onProgress?: (processed: number, total: number) => void;
    } = {}
  ): Promise<void> => {
    if (!user || messages.length === 0) return;

    const { batchSize = 25, delayBetweenBatches = 100, onProgress } = options;
    const startTime = performance.now();

    setLoading(true);
    try {
      const formattedMessages = messages.map(message => ({
        conversation_id: conversationId,
        user_id: user.id,
        content: message.text,
        message_type: message.isBot ? 'assistant' : 'user',
        quantum_data: message.quantum_data || null
      }));

      // Execute with progress tracking
      let processed = 0;
      for (let i = 0; i < formattedMessages.length; i += batchSize) {
        const batch = formattedMessages.slice(i, i + batchSize);
        
        await optimizedQueryExecutor.executeBatchInsert(
          'chat_messages',
          batch,
          { batchSize, delayBetweenBatches, failFast: false }
        );

        processed += batch.length;
        onProgress?.(processed, formattedMessages.length);
      }

      const executionTime = performance.now() - startTime;
      
      setMetrics(prev => ({
        totalOperations: prev.totalOperations + 1,
        successfulOperations: prev.successfulOperations + 1,
        failedOperations: prev.failedOperations,
        averageExecutionTime: (prev.averageExecutionTime * prev.totalOperations + executionTime) / (prev.totalOperations + 1),
        lastBatchSize: messages.length
      }));

      // Invalidate related caches
      await optimizedQueryExecutor.invalidateCache([
        `conversation:${conversationId}`,
        `user:${user.id}`,
        'messages'
      ]);

      console.log(`Batch inserted ${messages.length} messages in ${executionTime.toFixed(2)}ms`);

    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      setMetrics(prev => ({
        ...prev,
        totalOperations: prev.totalOperations + 1,
        failedOperations: prev.failedOperations + 1,
        averageExecutionTime: (prev.averageExecutionTime * prev.totalOperations + executionTime) / (prev.totalOperations + 1)
      }));

      console.error('Error in enhanced batch message insert:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut salva toate mesajele",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const executeBatchConversationUpdate = useCallback(async (
    updates: Array<{
      conversationId: string;
      title?: string;
      updated_at?: string;
    }>
  ): Promise<void> => {
    if (!user || updates.length === 0) return;

    const startTime = performance.now();
    setLoading(true);

    try {
      const formattedUpdates = updates.map(({ conversationId, ...data }) => ({
        id: conversationId,
        data: {
          ...data,
          updated_at: data.updated_at || new Date().toISOString()
        }
      }));

      await optimizedQueryExecutor.executeBatchUpdate(
        'chat_conversations',
        formattedUpdates,
        {
          batchSize: 20,
          delayBetweenBatches: 75,
          failFast: false
        }
      );

      const executionTime = performance.now() - startTime;
      
      setMetrics(prev => ({
        totalOperations: prev.totalOperations + 1,
        successfulOperations: prev.successfulOperations + 1,
        failedOperations: prev.failedOperations,
        averageExecutionTime: (prev.averageExecutionTime * prev.totalOperations + executionTime) / (prev.totalOperations + 1),
        lastBatchSize: updates.length
      }));

      // Invalidate conversation caches
      const conversationTags = updates.map(u => `conversation:${u.conversationId}`);
      await optimizedQueryExecutor.invalidateCache([
        `user:${user.id}`,
        'conversations',
        ...conversationTags
      ]);

      console.log(`Batch updated ${updates.length} conversations in ${executionTime.toFixed(2)}ms`);

    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      setMetrics(prev => ({
        ...prev,
        totalOperations: prev.totalOperations + 1,
        failedOperations: prev.failedOperations + 1,
        averageExecutionTime: (prev.averageExecutionTime * prev.totalOperations + executionTime) / (prev.totalOperations + 1)
      }));

      console.error('Error in batch conversation update:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut actualiza toate conversațiile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const optimizeBatchSize = useCallback(async (
    testSizes: number[] = [10, 25, 50, 100],
    testOperations: number = 5
  ): Promise<number> => {
    if (!user) return 25;

    console.log('Starting batch size optimization...');
    
    const results: { size: number; avgTime: number }[] = [];

    for (const size of testSizes) {
      const times: number[] = [];
      
      for (let i = 0; i < testOperations; i++) {
        const startTime = performance.now();
        
        // Create test messages
        const testMessages: ChatMessage[] = Array.from({ length: size }, (_, index) => ({
          id: `test_${Date.now()}_${index}`,
          text: `Test message ${index}`,
          isBot: index % 2 === 0,
          timestamp: new Date()
        }));

        try {
          // Simulate batch operation (without actually inserting)
          await new Promise(resolve => setTimeout(resolve, size * 2)); // Simulate database time
          
          const executionTime = performance.now() - startTime;
          times.push(executionTime);
        } catch (error) {
          console.error(`Error testing batch size ${size}:`, error);
        }
      }

      if (times.length > 0) {
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        results.push({ size, avgTime });
        console.log(`Batch size ${size}: average time ${avgTime.toFixed(2)}ms`);
      }
    }

    // Find optimal batch size (balance between speed and not too large)
    const optimalBatch = results
      .sort((a, b) => a.avgTime - b.avgTime)
      .find(result => result.size <= 50) || results[0];

    console.log(`Optimal batch size determined: ${optimalBatch?.size || 25}`);
    return optimalBatch?.size || 25;
  }, [user]);

  const getDetailedMetrics = useCallback(() => {
    return {
      ...metrics,
      connectionMetrics: optimizedQueryExecutor.getConnectionMetrics(),
      cacheMetrics: optimizedQueryExecutor.getCacheMetrics(),
      successRate: metrics.totalOperations > 0 
        ? (metrics.successfulOperations / metrics.totalOperations) * 100 
        : 0
    };
  }, [metrics]);

  const resetMetrics = useCallback(() => {
    setMetrics({
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      averageExecutionTime: 0,
      lastBatchSize: 0
    });
  }, []);

  return {
    executeBatchMessageInsert,
    executeBatchConversationUpdate,
    optimizeBatchSize,
    getDetailedMetrics,
    resetMetrics,
    loading,
    metrics
  };
};
