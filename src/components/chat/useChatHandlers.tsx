
import { useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useRealtimeChat } from '@/hooks/chat/useRealtimeChat';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useChatState } from '@/hooks/chat/useChatState';
import { useMessageHandlers } from '@/hooks/chat/useMessageHandlers';
import { useChatInitialization } from '@/hooks/chat/useChatInitialization';

export const useChatHandlers = () => {
  const { user } = useAuth();
  const { 
    currentConversation,
    loading 
  } = useChat();
  const { getCacheStats, lastUpdated } = useBotResponses();
  const { 
    messages, 
    pendingMessages 
  } = useChatMessages();
  
  const { 
    inputValue,
    setInputValue,
    useEnhancedMode,
    setUseEnhancedMode
  } = useChatState();

  const { componentRef } = useAnalytics({
    component: 'ChatInterface',
    trackClicks: true,
    trackPageViews: true,
    trackErrors: true
  });

  const {
    isConnected,
    onlineUsers,
    typingUsers,
    sendTypingIndicator,
    updatePresenceStatus
  } = useRealtimeChat(currentConversation);

  const {
    sendMessage,
    handleQuickAction
  } = useMessageHandlers({
    useEnhancedMode,
    inputValue,
    setInputValue,
    sendTypingIndicator
  });

  // Initialize chat with welcome message
  useChatInitialization({ useEnhancedMode });

  // Handle presence status changes
  useEffect(() => {
    if (inputValue.trim()) {
      updatePresenceStatus('typing');
    } else {
      updatePresenceStatus('online');
    }
  }, [inputValue, updatePresenceStatus]);

  const cacheStats = getCacheStats();

  return {
    // State
    inputValue,
    setInputValue,
    useEnhancedMode,
    setUseEnhancedMode,
    messages,
    pendingMessages,
    loading,
    user,
    
    // Real-time
    isConnected,
    onlineUsers,
    typingUsers,
    sendTypingIndicator,
    
    // Cache stats
    cacheStats,
    lastUpdated,
    
    // Handlers
    sendMessage,
    handleQuickAction,
    
    // Refs
    componentRef
  };
};
