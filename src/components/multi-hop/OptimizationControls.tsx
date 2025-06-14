
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Shield, Shuffle, Activity, Network, Zap } from 'lucide-react';

interface OptimizationControlsProps {
  errorCorrectionEnabled: boolean;
  swappingEfficiency: number[];
  onToggleErrorCorrection: () => void;
  onSwappingEfficiencyChange: (value: number[]) => void;
}

export const OptimizationControls: React.FC<OptimizationControlsProps> = ({
  errorCorrectionEnabled,
  swappingEfficiency,
  onToggleErrorCorrection,
  onSwappingEfficiencyChange
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <h4 className="text-white font-medium">Corecția Erorilor</h4>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Activată</span>
            <Button
              size="sm"
              variant={errorCorrectionEnabled ? "default" : "outline"}
              onClick={onToggleErrorCorrection}
              className="bg-green-500/20 border-green-500/30 text-green-400"
            >
              {errorCorrectionEnabled ? "ON" : "OFF"}
            </Button>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Corecția automată a erorilor cuantice în timpul transmisiei multi-hop
          </p>
        </div>
        
        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shuffle className="w-5 h-5 text-purple-400" />
            <h4 className="text-white font-medium">Eficiența Swapping-ului</h4>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Eficiență</span>
              <span className="text-white">{(swappingEfficiency[0] * 100).toFixed(0)}%</span>
            </div>
            <Slider
              value={swappingEfficiency}
              onValueChange={onSwappingEfficiencyChange}
              max={1}
              min={0.5}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-gray-400">
              Probabilitatea de succes pentru operațiile de entanglement swapping
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/20 rounded-lg p-4">
        <h4 className="text-white font-medium mb-4">Algoritmi de Optimizare Rute</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Activity className="w-4 h-4 mr-2" />
            Dijkstra Cuantic
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Network className="w-4 h-4 mr-2" />
            Optimizare Fidelitate
          </Button>
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Zap className="w-4 h-4 mr-2" />
            Balansare Încărcare
          </Button>
        </div>
      </div>
    </div>
  );
};
