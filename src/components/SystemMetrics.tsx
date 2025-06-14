
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Atom, Zap, Target } from 'lucide-react';

interface QuantumMetrics {
  activeQubits: number;
  coherence: number;
  entanglement: number;
}

interface SystemMetricsProps {
  metrics: QuantumMetrics;
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({ metrics }) => {
  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceStatus = (value: number) => {
    if (value >= 90) return 'Excelent';
    if (value >= 70) return 'Bun';
    return 'Ajustare';
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Atom className="w-6 h-6 text-cyan-400" />
        <h3 className="text-xl font-bold text-white">Status Cuantic</h3>
        <Badge variant="outline" className="border-cyan-400 text-cyan-400 ml-auto">
          <Zap className="w-3 h-3 mr-1" />
          Operațional
        </Badge>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Qubits Activi:</span>
          <div className="flex items-center gap-2">
            <span className="text-green-400 font-bold text-lg">{metrics.activeQubits}</span>
            <div className="flex gap-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < metrics.activeQubits ? 'bg-green-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Coerență:</span>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-lg ${getPerformanceColor(metrics.coherence)}`}>
              {metrics.coherence}%
            </span>
            <Badge 
              variant="outline" 
              className={`border-current ${getPerformanceColor(metrics.coherence)}`}
            >
              {getPerformanceStatus(metrics.coherence)}
            </Badge>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Entanglement:</span>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-lg ${getPerformanceColor(metrics.entanglement)}`}>
              {metrics.entanglement}%
            </span>
            <Badge 
              variant="outline" 
              className={`border-current ${getPerformanceColor(metrics.entanglement)}`}
            >
              {getPerformanceStatus(metrics.entanglement)}
            </Badge>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Coerență</span>
            <span className="text-gray-400">{metrics.coherence}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${metrics.coherence}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Entanglement</span>
            <span className="text-gray-400">{metrics.entanglement}%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-500"
              style={{ width: `${metrics.entanglement}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
