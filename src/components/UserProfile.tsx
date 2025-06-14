
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const UserProfile = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-cyan-500 text-white">
              {getInitials(user.email || '')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-medium">
              {user.user_metadata?.full_name || user.email}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Autentificat
              </Badge>
            </div>
          </div>
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Ieșire
        </Button>
      </div>
    </Card>
  );
};
