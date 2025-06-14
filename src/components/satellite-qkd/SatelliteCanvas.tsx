
import React, { useRef, useEffect } from 'react';
import { SatelliteNode, OrbitData } from './types';

interface SatelliteCanvasProps {
  satellites: SatelliteNode[];
  selectedSatellite: string;
  simulationTime: number;
  orbitData: Record<string, OrbitData>;
  onSatelliteClick: (satelliteId: string) => void;
}

export const SatelliteCanvas: React.FC<SatelliteCanvasProps> = ({
  satellites,
  selectedSatellite,
  simulationTime,
  orbitData,
  onSatelliteClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'transmitting': return '#8b5cf6';
      case 'inactive': return '#64748b';
      default: return '#3b82f6';
    }
  };

  const drawSatelliteNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Earth background
    ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
    ctx.beginPath();
    ctx.arc(300, 200, 80, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw orbital paths
    satellites.forEach(sat => {
      if (sat.type === 'satellite') {
        const radius = sat.altitude ? sat.altitude / 5 : 100;
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(300, 200, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw coverage areas and connections
    satellites.forEach(sat => {
      const { x, y } = sat.position;
      
      // Draw coverage area
      ctx.fillStyle = sat.type === 'satellite' 
        ? 'rgba(59, 130, 246, 0.1)' 
        : 'rgba(34, 197, 94, 0.1)';
      ctx.beginPath();
      ctx.arc(x, y, sat.coverage_radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw QKD links
      if (sat.status === 'transmitting') {
        satellites.forEach(targetSat => {
          if (targetSat.id !== sat.id) {
            const distance = Math.sqrt(
              Math.pow(x - targetSat.position.x, 2) + 
              Math.pow(y - targetSat.position.y, 2)
            );
            
            if (distance < sat.coverage_radius + targetSat.coverage_radius) {
              ctx.strokeStyle = '#00ff88';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(targetSat.position.x, targetSat.position.y);
              ctx.stroke();
              
              // Animate quantum photons
              const progress = (simulationTime * 0.1) % 1;
              const photonX = x + (targetSat.position.x - x) * progress;
              const photonY = y + (targetSat.position.y - y) * progress;
              
              ctx.fillStyle = '#ffff00';
              ctx.beginPath();
              ctx.arc(photonX, photonY, 3, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        });
      }
    });

    // Draw nodes
    satellites.forEach(sat => {
      const { x, y } = sat.position;
      
      // Node body
      if (sat.type === 'satellite') {
        ctx.fillStyle = getNodeColor(sat.status);
        ctx.fillRect(x - 8, y - 8, 16, 16);
        
        // Solar panels
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(x - 15, y - 3, 6, 6);
        ctx.fillRect(x + 9, y - 3, 6, 6);
      } else {
        ctx.fillStyle = getNodeColor(sat.status);
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Antenna
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x, y - 25);
        ctx.stroke();
      }
      
      // Node border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sat.name, x, y + 30);
      
      // Status indicator
      if (sat.id === selectedSatellite) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (sat.type === 'satellite') {
          ctx.strokeRect(x - 10, y - 10, 20, 20);
        } else {
          ctx.arc(x, y, 15, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (400 / rect.height);
    
    satellites.forEach(sat => {
      const distance = Math.sqrt(
        Math.pow(x - sat.position.x, 2) + 
        Math.pow(y - sat.position.y, 2)
      );
      if (distance < 20) {
        onSatelliteClick(sat.id);
      }
    });
  };

  useEffect(() => {
    drawSatelliteNetwork();
  }, [satellites, selectedSatellite, simulationTime]);

  return (
    <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-auto border border-white/20 rounded cursor-pointer"
        onClick={handleCanvasClick}
      />
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-300">Activ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded"></div>
          <span className="text-gray-300">Transmite</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-300">Fotoni Cuantici</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded"></div>
          <span className="text-gray-300">Link QKD</span>
        </div>
      </div>
    </div>
  );
};
