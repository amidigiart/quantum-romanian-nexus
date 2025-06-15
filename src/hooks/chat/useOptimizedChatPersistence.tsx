
import { useCoreMessagePersistence } from './persistence/useCoreMessagePersistence';
import { useMessageQueue } from './persistence/useMessageQueue';
import { useSearchUtilities } from './persistence/useSearchUtilities';
import { useCleanupUtilities } from './persistence/useCleanupUtilities';
import { useBatchOperations } from './persistence/useBatchOperations';

export const useOptimizedChatPersistence = () => {
  const { batchSaveMessages, loadMessagesOptimized, loading: coreLoading } = useCoreMessagePersistence();
  const { 
    queueMessage, 
    queueHighPriorityMessage,
    flushQueue, 
    loading: queueLoading, 
    queueSize,
    stats: queueStats 
  } = useMessageQueue();
  const { searchConversations, searchMessages } = useSearchUtilities();
  const { cleanupOldData } = useCleanupUtilities();
  
  // Direct access to batch operations for advanced use cases
  const {
    addOperation,
    flushBatch: flushBatchOperations,
    clearBatch,
    isProcessing: isBatchProcessing,
    stats: batchStats
  } = useBatchOperations();

  const loading = coreLoading || queueLoading || isBatchProcessing;

  return {
    // Message queue operations
    queueMessage,
    queueHighPriorityMessage,
    flushQueue,
    
    // Batch operations
    batchSaveMessages,
    loadMessagesOptimized,
    
    // Advanced batch operations
    addBatchOperation: addOperation,
    flushBatchOperations,
    clearBatch,
    
    // Search and cleanup
    searchConversations,
    searchMessages,
    cleanupOldData,
    
    // Status and metrics
    loading,
    queueSize,
    queueStats,
    batchStats,
    isBatchProcessing
  };
};
