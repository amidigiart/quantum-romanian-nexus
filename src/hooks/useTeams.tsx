
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTeamActions } from '@/hooks/useTeamActions';
import { teamService } from '@/services/teamService';
import { teamMembershipService } from '@/services/teamMembershipService';
import { Team, TeamMembership } from '@/types/team';

export const useTeams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createTeam: createTeamAction, addTeamMember: addTeamMemberAction, removeTeamMember: removeTeamMemberAction } = useTeamActions();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMemberships, setTeamMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTeams = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await teamService.loadTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca echipele",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string, description?: string) => {
    if (!user) return null;

    const team = await createTeamAction(name, description, user.id);
    if (team) {
      await loadTeams();
    }
    return team;
  };

  const loadTeamMemberships = async (teamId: string) => {
    if (!user) return;

    try {
      const data = await teamMembershipService.loadTeamMemberships(teamId);
      setTeamMemberships(data);
    } catch (error) {
      console.error('Error loading team memberships:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca membrii echipei",
        variant: "destructive",
      });
    }
  };

  const addTeamMember = async (teamId: string, userId: string, role: string = 'member') => {
    if (!user) return;

    const success = await addTeamMemberAction(teamId, userId, role);
    if (success) {
      await loadTeamMemberships(teamId);
    }
    return success;
  };

  const removeTeamMember = async (teamId: string, userId: string) => {
    if (!user) return;

    const success = await removeTeamMemberAction(teamId, userId);
    if (success) {
      await loadTeamMemberships(teamId);
    }
    return success;
  };

  useEffect(() => {
    if (user) {
      loadTeams();
    }
  }, [user]);

  return {
    teams,
    currentTeam,
    teamMemberships,
    loading,
    setCurrentTeam,
    loadTeams,
    createTeam,
    loadTeamMemberships,
    addTeamMember,
    removeTeamMember
  };
};
