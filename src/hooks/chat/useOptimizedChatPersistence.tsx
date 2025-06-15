
import { useCoreMessagePersistence } from './persistence/useCoreMessagePersistence';
import { useMessageQueue } from './persistence/useMessageQueue';
import { useSearchUtilities } from './persistence/useSearchUtilities';
import { useCleanupUtilities } from './persistence/useCleanupUtilities';

export const useOptimizedChatPersistence = () => {
  const { batchSaveMessages, loadMessagesOptimized, loading: coreLoading } = useCoreMessagePersistence();
  const { queueMessage, flushQueue, loading: queueLoading, queueSize } = useMessageQueue();
  const { searchConversations, searchMessages } = useSearchUtilities();
  const { cleanupOldData } = useCleanupUtilities();

  const loading = coreLoading || queueLoading;

  return {
    queueMessage,
    flushQueue,
    batchSaveMessages,
    loadMessagesOptimized,
    searchConversations,
    searchMessages,
    cleanupOldData,
    loading,
    queueSize
  };
};
