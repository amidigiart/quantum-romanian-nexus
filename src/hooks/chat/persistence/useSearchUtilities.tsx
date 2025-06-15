
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { OptimizedChatService } from '@/services/optimizedChatService';

export const useSearchUtilities = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const searchConversations = async (
    searchTerm: string, 
    limit: number = 20, 
    offset: number = 0
  ) => {
    if (!user) return [];

    try {
      return await OptimizedChatService.searchConversationsOptimized(
        user.id, 
        searchTerm, 
        limit, 
        offset
      );
    } catch (error) {
      console.error('Error searching conversations:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut căuta conversațiile",
        variant: "destructive",
      });
      return [];
    }
  };

  const searchMessages = async (searchQuery: string, limit: number = 50) => {
    if (!user) return [];

    try {
      return await OptimizedChatService.searchMessages(user.id, searchQuery, limit);
    } catch (error) {
      console.error('Error searching messages:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut căuta mesajele",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    searchConversations,
    searchMessages
  };
};
