
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

interface RealTimeAnalyticsProps {
  quantumMetrics: {
    activeQubits: number;
    coherence: number;
    entanglement: number;
  };
}

export const RealTimeAnalytics = ({ quantumMetrics }: RealTimeAnalyticsProps) => {
  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-6 h-6 text-green-400" />
        <h3 className="text-2xl font-bold text-white">Analiză în Timp Real</h3>
      </div>
      <div className="space-y-4">
        <div className="bg-black/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Metrici Cuantice</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Coerență:</span>
              <span className="text-cyan-400 font-bold">{quantumMetrics.coherence}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Entanglement:</span>
              <span className="text-purple-400 font-bold">{quantumMetrics.entanglement}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Fidelitate:</span>
              <span className="text-green-400 font-bold">91.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Algoritmi Activi:</span>
              <span className="text-yellow-400 font-bold">5</span>
            </div>
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Status Senzori</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-2 bg-green-500/20 rounded">
              <div className="text-green-400 font-bold">12</div>
              <div className="text-gray-300">Activi</div>
            </div>
            <div className="text-center p-2 bg-yellow-500/20 rounded">
              <div className="text-yellow-400 font-bold">3</div>
              <div className="text-gray-300">Standby</div>
            </div>
          </div>
        </div>
        <div className="bg-black/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-2">Securitate Cuantică</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Protocoale:</span>
              <span className="text-green-400 font-bold">BB84, E91, SARG04</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Chei Generate:</span>
              <span className="text-cyan-400 font-bold">1,247</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
