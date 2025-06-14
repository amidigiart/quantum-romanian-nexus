
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Shield } from 'lucide-react';

interface SatelliteControlsProps {
  isSimulating: boolean;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onStartQKDSession: () => void;
  onResetSimulation: () => void;
}

export const SatelliteControls: React.FC<SatelliteControlsProps> = ({
  isSimulating,
  onStartSimulation,
  onStopSimulation,
  onStartQKDSession,
  onResetSimulation
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={isSimulating ? "destructive" : "default"}
        onClick={isSimulating ? onStopSimulation : onStartSimulation}
        className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
      >
        {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isSimulating ? "Stop" : "Start"}
      </Button>
      <Button
        size="sm"
        onClick={onStartQKDSession}
        disabled={!isSimulating}
        className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
      >
        <Shield className="w-4 h-4 mr-1" />
        QKD
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={onResetSimulation}
        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};
