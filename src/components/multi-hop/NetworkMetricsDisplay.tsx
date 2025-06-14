
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { NetworkMetrics } from './types';

interface NetworkMetricsDisplayProps {
  metrics: NetworkMetrics;
}

export const NetworkMetricsDisplay: React.FC<NetworkMetricsDisplayProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Noduri Totale</h4>
        <div className="text-2xl text-blue-400 font-bold">{metrics.totalNodes}</div>
        <p className="text-xs text-gray-400">În rețeaua cuantică</p>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Conexiuni Active</h4>
        <div className="text-2xl text-green-400 font-bold">{metrics.activeConnections}</div>
        <p className="text-xs text-gray-400">Link-uri cuantice stabile</p>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Transmisii Reușite</h4>
        <div className="text-2xl text-cyan-400 font-bold">{metrics.successfulTransmissions}</div>
        <p className="text-xs text-gray-400">Comunicații complete</p>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Operații Swapping</h4>
        <div className="text-2xl text-purple-400 font-bold">{metrics.swappingOperations}</div>
        <p className="text-xs text-gray-400">Entanglement swaps</p>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4 md:col-span-2">
        <h4 className="text-white font-medium mb-2">Fidelitate Medie</h4>
        <div className="text-2xl text-yellow-400 font-bold">
          {metrics.averageFidelity > 0 ? (metrics.averageFidelity * 100).toFixed(1) + '%' : 'N/A'}
        </div>
        <Progress 
          value={metrics.averageFidelity * 100} 
          className="mt-2"
        />
        <p className="text-xs text-gray-400 mt-1">Calitatea conexiunilor end-to-end</p>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4 md:col-span-2">
        <h4 className="text-white font-medium mb-2">Eficiență Rețea</h4>
        <div className="text-2xl text-orange-400 font-bold">
          {metrics.successfulTransmissions > 0 ? 
            ((metrics.successfulTransmissions / (metrics.swappingOperations + 1)) * 100).toFixed(1) + '%' : 
            'N/A'
          }
        </div>
        <p className="text-xs text-gray-400">Rata de succes per operație</p>
      </div>
    </div>
  );
};
