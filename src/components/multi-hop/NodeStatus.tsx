
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { QuantumNode } from './types';

interface NodeStatusProps {
  nodes: QuantumNode[];
}

export const NodeStatus: React.FC<NodeStatusProps> = ({ nodes }) => {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-300 mb-2">Status Noduri</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {nodes.map(node => (
          <div key={node.id} className="flex items-center justify-between text-sm bg-white/5 p-2 rounded">
            <span className="text-gray-400">{node.name}</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  node.active ? 'border-green-500/30 text-green-400' : 'border-gray-500/30 text-gray-400'
                }`}
              >
                {node.active ? 'Activ' : 'Inactiv'}
              </Badge>
              {node.entanglementCount > 0 && (
                <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-400">
                  E:{node.entanglementCount}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
