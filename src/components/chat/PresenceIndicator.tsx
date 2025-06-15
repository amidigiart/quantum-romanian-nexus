
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { UserPresence } from '@/services/realtimeService';

interface PresenceIndicatorProps {
  onlineUsers: UserPresence[];
  typingUsers: string[];
  isConnected: boolean;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  onlineUsers,
  typingUsers,
  isConnected
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'typing': return 'bg-yellow-400';
      case 'away': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-400" />
        )}
        <Badge variant="outline" className="border-gray-400 text-gray-300">
          {isConnected ? 'Live' : 'Offline'}
        </Badge>
      </div>

      {onlineUsers.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <div className="flex -space-x-2">
            {onlineUsers.slice(0, 3).map((user) => (
              <div key={user.user_id} className="relative">
                <Avatar className="w-6 h-6 border-2 border-gray-800">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-cyan-500 to-blue-500">
                    {getInitials(user.username || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(user.status)}`}
                  title={`${user.username || 'User'} - ${user.status}`}
                />
              </div>
            ))}
            {onlineUsers.length > 3 && (
              <Badge variant="outline" className="ml-2 text-xs border-cyan-400 text-cyan-400">
                +{onlineUsers.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {typingUsers.length > 0 && (
        <Badge variant="outline" className="border-yellow-400 text-yellow-400 animate-pulse">
          {typingUsers.length === 1 ? '1 person typing...' : `${typingUsers.length} people typing...`}
        </Badge>
      )}
    </div>
  );
};
