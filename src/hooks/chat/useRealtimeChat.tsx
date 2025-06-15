
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage, ChatConversation } from '@/hooks/useChat';
import { RealtimeService, UserPresence } from '@/services/realtimeService';

export const useRealtimeChat = (currentConversation: ChatConversation | null) => {
  const { user } = useAuth();
  const [realtimeService, setRealtimeService] = useState<RealtimeService | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(false);

  // Callback for handling new messages
  const handleMessageReceived = useCallback((message: ChatMessage) => {
    console.log('Real-time message received:', message);
    // This will be handled by the parent component
  }, []);

  // Callback for handling conversation updates
  const handleConversationUpdated = useCallback((conversation: ChatConversation) => {
    console.log('Real-time conversation updated:', conversation);
    // This will be handled by the parent component
  }, []);

  // Callback for handling presence changes
  const handlePresenceChange = useCallback((presences: UserPresence[]) => {
    setOnlineUsers(presences);
    console.log('Presence updated:', presences);
  }, []);

  // Callback for handling typing indicators
  const handleTypingIndicator = useCallback((userId: string, isTyping: boolean) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      if (isTyping) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  // Initialize realtime service
  useEffect(() => {
    if (!user) return;

    const service = new RealtimeService({
      onMessageReceived: handleMessageReceived,
      onConversationUpdated: handleConversationUpdated,
      onUserPresenceChange: handlePresenceChange,
      onTypingIndicator: handleTypingIndicator
    });

    setRealtimeService(service);
    setIsConnected(true);

    return () => {
      service.unsubscribeAll();
      setIsConnected(false);
    };
  }, [user, handleMessageReceived, handleConversationUpdated, handlePresenceChange, handleTypingIndicator]);

  // Subscribe to conversation when it changes
  useEffect(() => {
    if (!realtimeService || !currentConversation || !user) return;

    // Subscribe to conversation messages
    realtimeService.subscribeToConversation(currentConversation.id);

    // Subscribe to presence in this conversation
    const userPresence: UserPresence = {
      user_id: user.id,
      username: user.user_metadata?.full_name || 'Anonymous',
      avatar_url: user.user_metadata?.avatar_url,
      online_at: new Date().toISOString(),
      status: 'online'
    };

    realtimeService.subscribeToPresence(currentConversation.id, userPresence);

    return () => {
      // Cleanup subscriptions when conversation changes
      realtimeService.unsubscribe(`conversation:${currentConversation.id}`);
      realtimeService.unsubscribe(`presence:${currentConversation.id}`);
      realtimeService.unsubscribe(`typing:${currentConversation.id}`);
    };
  }, [realtimeService, currentConversation, user]);

  // Function to send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (realtimeService && currentConversation) {
      realtimeService.sendTypingIndicator(currentConversation.id, isTyping);
    }
  }, [realtimeService, currentConversation]);

  // Function to update presence status
  const updatePresenceStatus = useCallback((status: 'online' | 'typing' | 'away') => {
    if (realtimeService && currentConversation) {
      realtimeService.updatePresenceStatus(currentConversation.id, status);
    }
  }, [realtimeService, currentConversation]);

  return {
    isConnected,
    onlineUsers,
    typingUsers: Array.from(typingUsers),
    sendTypingIndicator,
    updatePresenceStatus
  };
};
