
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Signal, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { QKDSession, SatelliteNode } from './types';

interface QKDSessionsListProps {
  sessions: QKDSession[];
  satellites: SatelliteNode[];
}

export const QKDSessionsList: React.FC<QKDSessionsListProps> = ({
  sessions,
  satellites
}) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Nu sunt sesiuni QKD active</p>
        <p className="text-sm">Apăsați butonul QKD pentru a începe</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium">
                {satellites.find(s => s.id === session.from)?.name} → 
                {satellites.find(s => s.id === session.to)?.name}
              </span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                session.status === 'active' ? 'border-green-500/30 text-green-400' :
                session.status === 'establishing' ? 'border-yellow-500/30 text-yellow-400' :
                session.status === 'completed' ? 'border-blue-500/30 text-blue-400' :
                'border-red-500/30 text-red-400'
              }`}
            >
              {session.status === 'establishing' && <Loader className="w-3 h-3 mr-1 animate-spin" />}
              {session.status === 'active' && <Signal className="w-3 h-3 mr-1" />}
              {session.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
              {session.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {session.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Key Rate:</span>
              <div className="text-cyan-400 font-mono">{session.keyRate} bps</div>
            </div>
            <div>
              <span className="text-gray-400">Securitate:</span>
              <div className="text-green-400 font-mono">{(session.security_level * 100).toFixed(2)}%</div>
            </div>
            <div>
              <span className="text-gray-400">Pierderi:</span>
              <div className="text-orange-400 font-mono">{(session.atmospheric_loss * 100).toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-gray-400">Durată:</span>
              <div className="text-blue-400 font-mono">{session.duration}s</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
