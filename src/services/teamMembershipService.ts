
import { supabase } from '@/integrations/supabase/client';
import { TeamMembership } from '@/types/team';

export const teamMembershipService = {
  async loadTeamMemberships(teamId: string): Promise<TeamMembership[]> {
    const { data, error } = await supabase
      .from('team_memberships')
      .select('*')
      .eq('team_id', teamId);

    if (error) throw error;
    return data || [];
  },

  async addTeamMember(teamId: string, userId: string, role: string = 'member'): Promise<void> {
    const { error } = await supabase
      .from('team_memberships')
      .insert({
        team_id: teamId,
        user_id: userId,
        role: role
      });

    if (error) throw error;
  },

  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_memberships')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
