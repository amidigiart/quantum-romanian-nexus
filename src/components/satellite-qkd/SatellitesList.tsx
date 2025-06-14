
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Satellite, Globe } from 'lucide-react';
import { SatelliteNode, OrbitData } from './types';

interface SatellitesListProps {
  satellites: SatelliteNode[];
  selectedSatellite: string;
  orbitData: Record<string, OrbitData>;
  onSatelliteSelect: (satelliteId: string) => void;
}

export const SatellitesList: React.FC<SatellitesListProps> = ({
  satellites,
  selectedSatellite,
  orbitData,
  onSatelliteSelect
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {satellites.map((sat) => (
        <div 
          key={sat.id} 
          className={`bg-white/5 border rounded-lg p-4 cursor-pointer transition-all ${
            selectedSatellite === sat.id 
              ? 'border-yellow-400 bg-yellow-400/10' 
              : 'border-white/20 hover:bg-white/10'
          }`}
          onClick={() => onSatelliteSelect(sat.id === selectedSatellite ? '' : sat.id)}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {sat.type === 'satellite' ? 
                <Satellite className="w-5 h-5 text-blue-400" /> : 
                <Globe className="w-5 h-5 text-green-400" />
              }
              <span className="text-white font-medium">{sat.name}</span>
            </div>
            <Badge 
              variant="outline" 
              className={`text-xs ${
                sat.status === 'active' ? 'border-green-500/30 text-green-400' :
                sat.status === 'transmitting' ? 'border-purple-500/30 text-purple-400' :
                'border-gray-500/30 text-gray-400'
              }`}
            >
              {sat.status}
            </Badge>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Tip:</span>
              <span className="text-gray-300">{sat.type === 'satellite' ? 'Satelit' : 'Stație Sol'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Capacitate QKD:</span>
              <span className="text-cyan-400 font-mono">{sat.qkd_capacity} bps</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Raza Acoperire:</span>
              <span className="text-blue-400 font-mono">{sat.coverage_radius} km</span>
            </div>
            {sat.type === 'satellite' && (
              <div className="flex justify-between">
                <span className="text-gray-400">Perioadă Orbitală:</span>
                <span className="text-purple-400 font-mono">{sat.orbital_period} min</span>
              </div>
            )}
            {orbitData[sat.id] && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vizibilitate:</span>
                  <Badge variant="outline" className={`text-xs ${
                    orbitData[sat.id].visibility 
                      ? 'border-green-500/30 text-green-400'
                      : 'border-red-500/30 text-red-400'
                  }`}>
                    {orbitData[sat.id].visibility ? 'Vizibil' : 'Ascuns'}
                  </Badge>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-400">Putere Semnal:</span>
                  <span className="text-yellow-400 font-mono">
                    {orbitData[sat.id].signal_strength.toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
