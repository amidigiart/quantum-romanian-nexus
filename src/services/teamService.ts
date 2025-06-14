
import { supabase } from '@/integrations/supabase/client';
import { Team } from '@/types/team';

export const teamService = {
  async loadTeams(): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTeam(name: string, description: string | null, userId: string): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        description,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as team owner
    await supabase
      .from('team_memberships')
      .insert({
        team_id: data.id,
        user_id: userId,
        role: 'owner'
      });

    return data;
  }
};
