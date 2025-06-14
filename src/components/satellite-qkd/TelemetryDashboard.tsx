
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Signal, Shield, Zap, Globe, CheckCircle, AlertTriangle } from 'lucide-react';
import { SatelliteNode, QKDSession } from './types';

interface TelemetryDashboardProps {
  satellites: SatelliteNode[];
  qkdSessions: QKDSession[];
  simulationTime: number;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  satellites,
  qkdSessions,
  simulationTime
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Signal className="w-4 h-4 text-blue-400" />
          <h4 className="text-white font-medium">Sateliți Activi</h4>
        </div>
        <div className="text-2xl text-blue-400 font-bold">
          {satellites.filter(s => s.type === 'satellite' && s.status !== 'inactive').length}
        </div>
        <div className="text-xs text-gray-400">din {satellites.filter(s => s.type === 'satellite').length} total</div>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-green-400" />
          <h4 className="text-white font-medium">Sesiuni QKD</h4>
        </div>
        <div className="text-2xl text-green-400 font-bold">
          {qkdSessions.filter(s => s.status === 'active').length}
        </div>
        <div className="text-xs text-gray-400">active acum</div>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h4 className="text-white font-medium">Timp Simulare</h4>
        </div>
        <div className="text-2xl text-yellow-400 font-bold">
          {Math.floor(simulationTime / 60)}:{(simulationTime % 60).toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-gray-400">minute:secunde</div>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h4 className="text-white font-medium">Acoperire Globală</h4>
        </div>
        <Progress 
          value={Math.min(100, satellites.filter(s => s.status === 'active').length * 25)} 
          className="mb-2" 
        />
        <div className="text-xs text-gray-400">
          {Math.min(100, satellites.filter(s => s.status === 'active').length * 25)}% acoperire
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-purple-400" />
          <h4 className="text-white font-medium">Sesiuni Finalizate</h4>
        </div>
        <div className="text-2xl text-purple-400 font-bold">
          {qkdSessions.filter(s => s.status === 'completed').length}
        </div>
        <div className="text-xs text-gray-400">total completate</div>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <h4 className="text-white font-medium">Rata Succes</h4>
        </div>
        <div className="text-2xl text-orange-400 font-bold">
          {qkdSessions.length > 0 
            ? Math.round((qkdSessions.filter(s => s.status === 'completed').length / qkdSessions.length) * 100)
            : 0}%
        </div>
        <div className="text-xs text-gray-400">comunicații reușite</div>
      </div>
    </div>
  );
};
