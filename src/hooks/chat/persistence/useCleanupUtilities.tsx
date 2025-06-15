
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { OptimizedChatService } from '@/services/optimizedChatService';

export const useCleanupUtilities = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const cleanupOldData = async (daysOld: number = 90) => {
    if (!user) return 0;

    try {
      const deletedCount = await OptimizedChatService.cleanupOldConversations(user.id, daysOld);
      
      toast({
        title: "Succes",
        description: `Au fost șterse ${deletedCount} conversații vechi`,
      });
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut șterge datele vechi",
        variant: "destructive",
      });
      return 0;
    }
  };

  return {
    cleanupOldData
  };
};
