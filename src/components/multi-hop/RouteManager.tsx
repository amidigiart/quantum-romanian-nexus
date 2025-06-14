
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { CommunicationRoute, QuantumNode } from './types';

interface RouteManagerProps {
  routes: CommunicationRoute[];
  nodes: QuantumNode[];
  selectedRoute: string;
  onSelectRoute: (routeId: string) => void;
}

export const RouteManager: React.FC<RouteManagerProps> = ({
  routes,
  nodes,
  selectedRoute,
  onSelectRoute
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-medium text-white mb-4">Rute de Comunicație Disponibile</h4>
        <div className="grid gap-4">
          {routes.map(route => (
            <div 
              key={route.id}
              className={`border border-white/20 rounded-lg p-4 cursor-pointer transition-all ${
                selectedRoute === route.id ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => onSelectRoute(route.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-white font-medium">Ruta {route.id.slice(-1)}</h5>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      route.status === 'completed' ? 'border-green-500/30 text-green-400' :
                      route.status === 'establishing' ? 'border-yellow-500/30 text-yellow-400' :
                      route.status === 'active' ? 'border-blue-500/30 text-blue-400' :
                      'border-gray-500/30 text-gray-400'
                    }`}
                  >
                    {route.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-400">
                  {route.hops} hop-uri
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {route.path.map((nodeId, index) => (
                  <React.Fragment key={nodeId}>
                    <span className="text-cyan-400 text-sm">{nodes.find(n => n.id === nodeId)?.name}</span>
                    {index < route.path.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-gray-400">Distanță: </span>
                  <span className="text-white">{route.totalDistance}km</span>
                </div>
                <div>
                  <span className="text-gray-400">Fidelitate: </span>
                  <span className="text-white">{(route.expectedFidelity * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Swap-uri: </span>
                  <span className="text-white">{route.hops - 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
