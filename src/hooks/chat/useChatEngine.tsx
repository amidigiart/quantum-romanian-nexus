
import { useChatEngineCore } from './core/useChatEngineCore';

export const useChatEngine = () => {
  const { state, actions, integrations } = useChatEngineCore();

  return {
    // State
    ...state,
    loading: integrations.chatLoading || state.isLoading,
    user: integrations.user,
    
    // Real-time
    isConnected: integrations.isConnected,
    onlineUsers: integrations.onlineUsers,
    typingUsers: integrations.typingUsers,
    sendTypingIndicator: integrations.sendTypingIndicator,
    
    // Cache stats
    cacheStats: integrations.cacheStats,
    lastUpdated: integrations.lastUpdated,
    newsContext: integrations.newsContext,
    
    // Analytics
    componentRef: integrations.componentRef,
    
    // Actions
    ...actions
  };
};
