import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Crown, Shield, User } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { Team } from '@/types/team';

export const TeamManager = () => {
  const { teams, teamMemberships, loading, createTeam, loadTeamMemberships, setCurrentTeam } = useTeams();
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    const team = await createTeam(newTeamName, newTeamDescription);
    if (team) {
      setNewTeamName('');
      setNewTeamDescription('');
      setShowCreateDialog(false);
    }
  };

  const handleSelectTeam = async (team: Team) => {
    setCurrentTeam(team);
    await loadTeamMemberships(team.id);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3" />;
      case 'admin':
        return <Shield className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'border-yellow-400 text-yellow-400';
      case 'admin':
        return 'border-red-400 text-red-400';
      default:
        return 'border-blue-400 text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Teams List */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Echipe</h2>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Echipă Nouă
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Creează Echipă Nouă</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nume Echipă</label>
                  <Input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Introdu numele echipei"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descriere (opțional)</label>
                  <Textarea
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                    placeholder="Descrierea echipei..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateTeam} className="w-full bg-green-600 hover:bg-green-700">
                  Creează Echipa
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-400">Se încarcă echipele...</p>
          ) : teams.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Nu faci parte din nicio echipă</p>
              <p className="text-gray-500 text-sm">Creează o echipă nouă pentru a începe colaborarea</p>
            </div>
          ) : (
            teams.map((team) => (
              <div
                key={team.id}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => handleSelectTeam(team)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{team.name}</h3>
                    {team.description && (
                      <p className="text-gray-400 text-sm mt-1">{team.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">
                      Creată la: {new Date(team.created_at).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                  <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                    <Users className="w-3 h-3 mr-1" />
                    Echipă
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Team Members */}
      {teamMemberships.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Membrii Echipei
          </h3>
          <div className="space-y-2">
            {teamMemberships.map((membership) => (
              <div key={membership.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">ID: {membership.user_id.substring(0, 8)}...</p>
                  <p className="text-gray-400 text-sm">
                    Membru din: {new Date(membership.joined_at).toLocaleDateString('ro-RO')}
                  </p>
                </div>
                <Badge variant="outline" className={getRoleColor(membership.role)}>
                  {getRoleIcon(membership.role)}
                  <span className="ml-1 capitalize">{membership.role}</span>
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
