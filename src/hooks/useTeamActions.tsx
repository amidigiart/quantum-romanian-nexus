
import { useToast } from '@/hooks/use-toast';
import { teamService } from '@/services/teamService';
import { teamMembershipService } from '@/services/teamMembershipService';

export const useTeamActions = () => {
  const { toast } = useToast();

  const createTeam = async (name: string, description: string | undefined, userId: string) => {
    try {
      const data = await teamService.createTeam(name, description || null, userId);
      
      toast({
        title: "Succes",
        description: "Echipa a fost creată cu succes",
      });

      return data;
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea echipa",
        variant: "destructive",
      });
      return null;
    }
  };

  const addTeamMember = async (teamId: string, userId: string, role: string = 'member') => {
    try {
      await teamMembershipService.addTeamMember(teamId, userId, role);

      toast({
        title: "Succes",
        description: "Membrul a fost adăugat în echipă",
      });

      return true;
    } catch (error) {
      console.error('Error adding team member:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut adăuga membrul în echipă",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeTeamMember = async (teamId: string, userId: string) => {
    try {
      await teamMembershipService.removeTeamMember(teamId, userId);

      toast({
        title: "Succes",
        description: "Membrul a fost eliminat din echipă",
      });

      return true;
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut elimina membrul din echipă",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    createTeam,
    addTeamMember,
    removeTeamMember
  };
};
