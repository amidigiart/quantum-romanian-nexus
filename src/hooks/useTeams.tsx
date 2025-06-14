
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMembership {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export const useTeams = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teamMemberships, setTeamMemberships] = useState<TeamMembership[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTeams = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
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

    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          description: description || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as team owner
      await supabase
        .from('team_memberships')
        .insert({
          team_id: data.id,
          user_id: user.id,
          role: 'owner'
        });

      toast({
        title: "Succes",
        description: "Echipa a fost creată cu succes",
      });

      await loadTeams();
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

  const loadTeamMemberships = async (teamId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_memberships')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;
      setTeamMemberships(data || []);
    } catch (error) {
      console.error('Error loading team memberships:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca membrii echipei",
        variant: "destructive",
      });
    }
  };

  const addTeamMember = async (teamId: string, userId: string, role: 'admin' | 'member' = 'member') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('team_memberships')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: role
        });

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Membrul a fost adăugat în echipă",
      });

      await loadTeamMemberships(teamId);
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
    if (!user) return;

    try {
      const { error } = await supabase
        .from('team_memberships')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Membrul a fost eliminat din echipă",
      });

      await loadTeamMemberships(teamId);
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
