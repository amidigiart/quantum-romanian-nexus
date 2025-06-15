
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeChatUpdates } from './useRealtimeChatUpdates';
import { useOptimizedChatPersistence } from './useOptimizedChatPersistence';
import { ChatConversation } from '@/hooks/useChat';
import { OptimizedChatService } from '@/services/optimizedChatService';

export const useOptimizedConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { searchConversations } = useOptimizedChatPersistence();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConversationUpdate = (updatedConversation: ChatConversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    );
    
    if (currentConversation?.id === updatedConversation.id) {
      setCurrentConversation(updatedConversation);
    }
  };

  const handleConversationDeleted = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
  };

  // Set up real-time updates
  useRealtimeChatUpdates({
    onConversationUpdate: handleConversationUpdate,
    onConversationDeleted: handleConversationDeleted,
    currentConversationId: currentConversation?.id
  });

  const loadConversationsOptimized = async (searchTerm: string = '') => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await searchConversations(searchTerm, 50, 0);
      
      // Transform the optimized search results to ChatConversation format
      const transformedConversations: ChatConversation[] = data.map(conv => ({
        id: conv.id,
        title: conv.title || `Conversație ${new Date(conv.created_at).toLocaleDateString('ro-RO')}`,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      }));
      
      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error loading optimized conversations:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca conversațiile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConversationWithStats = async (conversationId: string) => {
    if (!user) return null;

    try {
      return await OptimizedChatService.getConversationWithStats(user.id, conversationId);
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      loadConversationsOptimized();
    }
  }, [user]);

  return {
    conversations,
    currentConversation,
    loading,
    setCurrentConversation,
    loadConversationsOptimized,
    getConversationWithStats,
    // Re-export existing conversation management functions
    // These will be handled by the existing useConversations hook
  };
};
