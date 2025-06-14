
import React, { useRef, useEffect } from 'react';
import { QuantumNode, QuantumLink, CommunicationRoute } from './types';

interface NetworkVisualizationProps {
  nodes: QuantumNode[];
  links: QuantumLink[];
  selectedRoute: string;
  routes: CommunicationRoute[];
  isRunning: boolean;
  animationTime: number;
}

export const NetworkVisualization: React.FC<NetworkVisualizationProps> = ({
  nodes,
  links,
  selectedRoute,
  routes,
  isRunning,
  animationTime
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getNodeColor = (node: QuantumNode) => {
    if (node.active) {
      switch (node.type) {
        case 'source': return '#ef4444';
        case 'destination': return '#22c55e';
        case 'intermediate': return '#3b82f6';
      }
    }
    return '#6b7280';
  };

  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw links
    links.forEach(link => {
      const fromNode = nodes.find(n => n.id === link.from);
      const toNode = nodes.find(n => n.id === link.to);
      
      if (fromNode && toNode) {
        ctx.strokeStyle = link.active ? (link.entangled ? '#10b981' : '#3b82f6') : '#64748b';
        ctx.lineWidth = link.active ? 3 : 1.5;
        ctx.setLineDash(link.entangled ? [] : [5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(fromNode.position.x, fromNode.position.y);
        ctx.lineTo(toNode.position.x, toNode.position.y);
        ctx.stroke();

        // Draw quantum information packets
        if (link.active && isRunning) {
          const progress = (animationTime * 0.02) % 1;
          const x = fromNode.position.x + (toNode.position.x - fromNode.position.x) * progress;
          const y = fromNode.position.y + (toNode.position.y - fromNode.position.y) * progress;
          
          ctx.fillStyle = link.entangled ? '#10b981' : '#06b6d4';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
          
          // Add glow effect
          ctx.shadowColor = link.entangled ? '#10b981' : '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw distance labels
        const midX = (fromNode.position.x + toNode.position.x) / 2;
        const midY = (fromNode.position.y + toNode.position.y) / 2;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${link.distance}km`, midX, midY - 8);
        ctx.fillText(`F=${link.fidelity.toFixed(2)}`, midX, midY + 8);
      }
    });

    // Highlight selected route
    if (selectedRoute) {
      const route = routes.find(r => r.id === selectedRoute);
      if (route) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 4;
        ctx.setLineDash([]);
        
        for (let i = 0; i < route.path.length - 1; i++) {
          const fromNode = nodes.find(n => n.id === route.path[i]);
          const toNode = nodes.find(n => n.id === route.path[i + 1]);
          
          if (fromNode && toNode) {
            ctx.beginPath();
            ctx.moveTo(fromNode.position.x, fromNode.position.y);
            ctx.lineTo(toNode.position.x, toNode.position.y);
            ctx.stroke();
          }
        }
      }
    }

    // Draw nodes
    nodes.forEach(node => {
      const { x, y } = node.position;
      
      // Node background
      ctx.fillStyle = getNodeColor(node);
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();
      
      // Node border
      ctx.strokeStyle = node.active ? '#ffffff' : '#64748b';
      ctx.lineWidth = node.active ? 3 : 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, x, y - 30);
      
      // Entanglement count
      if (node.entanglementCount > 0) {
        ctx.fillStyle = '#10b981';
        ctx.font = '9px Inter, sans-serif';
        ctx.fillText(`E:${node.entanglementCount}`, x, y + 35);
      }
      
      // Fidelity
      ctx.fillStyle = '#9ca3af';
      ctx.fillText(`F:${node.fidelity.toFixed(2)}`, x, y + 45);
    });
  };

  useEffect(() => {
    drawNetwork();
  }, [nodes, links, selectedRoute, isRunning, animationTime]);

  return (
    <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
      <canvas
        ref={canvasRef}
        width={500}
        height={300}
        className="w-full h-auto border border-white/20 rounded"
      />
    </div>
  );
};
