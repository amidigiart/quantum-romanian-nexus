
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Users, Crown, Settings } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  created_at: string;
}

export const AdminPanel = () => {
  const { isAdmin, assignRole } = useRoles();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'moderator' | 'user'>('user');

  const loadUsers = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user emails from auth metadata (this is a simplified approach)
      const usersWithRoles = await Promise.all(
        (data || []).map(async (profile) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);

          return {
            id: profile.id,
            email: `user-${profile.id.substring(0, 8)}@example.com`, // Placeholder
            created_at: profile.created_at,
            roles: rolesData || []
          };
        })
      );

      setUsers(usersWithRoles as User[]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca utilizatorii",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRole) return;

    const success = await assignRole(selectedUser, selectedRole);
    if (success) {
      setSelectedUser('');
      setSelectedRole('user');
      await loadUsers();
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Acces restricționat</h3>
          <p className="text-gray-300">Nu aveți permisiuni de administrator pentru a accesa acest panou.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">Panou Administrator</h2>
        <Badge variant="outline" className="border-yellow-400 text-yellow-400">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Role Management Section */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestionare Roluri
          </h3>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Atribuie Rol
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 text-white border-gray-700">
              <DialogHeader>
                <DialogTitle>Atribuire Rol Utilizator</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Utilizator</label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue placeholder="Selectează utilizatorul" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Rol</label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as 'admin' | 'moderator' | 'user')}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="user">Utilizator</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssignRole} className="w-full bg-green-600 hover:bg-green-700">
                  Atribuie Rol
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users List */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Utilizatori</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {loading ? (
              <p className="text-gray-400">Se încarcă utilizatorii...</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{user.email}</p>
                    <p className="text-gray-400 text-sm">ID: {user.id.substring(0, 8)}...</p>
                  </div>
                  <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                    Utilizator
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
