
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Network, 
  Radio, 
  Shield, 
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeleportationNode {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'sender' | 'receiver' | 'repeater' | 'amplifier';
  status: 'idle' | 'active' | 'entangled' | 'error';
  fidelity: number;
  range: number;
}

interface TeleportationProtocol {
  id: string;
  name: string;
  description: string;
  maxDistance: number;
  fidelityThreshold: number;
  errorCorrection: boolean;
  complexity: 'Low' | 'Medium' | 'High' | 'Extreme';
}

const protocols: TeleportationProtocol[] = [
  {
    id: 'standard',
    name: 'Standard Teleportation',
    description: 'Basic quantum teleportation using Bell states',
    maxDistance: 100,
    fidelityThreshold: 0.8,
    errorCorrection: false,
    complexity: 'Low'
  },
  {
    id: 'repeater',
    name: 'Quantum Repeater Chain',
    description: 'Extended range using quantum repeaters and memory',
    maxDistance: 1000,
    fidelityThreshold: 0.85,
    errorCorrection: true,
    complexity: 'High'
  },
  {
    id: 'satellite',
    name: 'Satellite-Mediated',
    description: 'Ground-to-satellite-to-ground teleportation',
    maxDistance: 10000,
    fidelityThreshold: 0.75,
    errorCorrection: true,
    complexity: 'Extreme'
  },
  {
    id: 'multipath',
    name: 'Multi-Path Redundancy',
    description: 'Multiple parallel paths with error correction',
    maxDistance: 5000,
    fidelityThreshold: 0.9,
    errorCorrection: true,
    complexity: 'High'
  }
];

export const LongDistanceQuantumTeleportation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<TeleportationProtocol>(protocols[0]);
  const [simulationTime, setSimulationTime] = useState(0);
  const [transmissionProgress, setTransmissionProgress] = useState(0);
  const [currentFidelity, setCurrentFidelity] = useState(1.0);
  const [successfulTransmissions, setSuccessfulTransmissions] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const { toast } = useToast();

  const [nodes, setNodes] = useState<TeleportationNode[]>([
    { id: 'alice', name: 'Alice', position: { x: 50, y: 200 }, type: 'sender', status: 'idle', fidelity: 0.95, range: 200 },
    { id: 'rep1', name: 'Repeater 1', position: { x: 200, y: 150 }, type: 'repeater', status: 'idle', fidelity: 0.92, range: 300 },
    { id: 'rep2', name: 'Repeater 2', position: { x: 350, y: 100 }, type: 'repeater', status: 'idle', fidelity: 0.88, range: 300 },
    { id: 'amp1', name: 'Amplifier', position: { x: 500, y: 200 }, type: 'amplifier', status: 'idle', fidelity: 0.85, range: 400 },
    { id: 'bob', name: 'Bob', position: { x: 650, y: 150 }, type: 'receiver', status: 'idle', fidelity: 0.93, range: 200 }
  ]);

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'entangled': return '#8b5cf6';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getProtocolColor = (protocolId: string) => {
    switch (protocolId) {
      case 'standard': return '#60a5fa';
      case 'repeater': return '#34d399';
      case 'satellite': return '#fbbf24';
      case 'multipath': return '#f472b6';
      default: return '#ffffff';
    }
  };

  const drawTeleportationNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections based on protocol
    if (isRunning) {
      drawProtocolConnections(ctx);
    }

    // Draw nodes
    nodes.forEach(node => {
      const { x, y } = node.position;
      
      // Node body
      ctx.fillStyle = getNodeColor(node.status);
      ctx.beginPath();
      
      if (node.type === 'repeater') {
        ctx.fillRect(x - 12, y - 12, 24, 24);
      } else if (node.type === 'amplifier') {
        ctx.moveTo(x, y - 15);
        ctx.lineTo(x + 13, y + 7);
        ctx.lineTo(x - 13, y + 7);
        ctx.closePath();
      } else {
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
      }
      ctx.fill();
      
      // Node border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Range indicator
      if (node.status === 'active') {
        ctx.strokeStyle = getNodeColor(node.status) + '40';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(x, y, node.range / 3, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, x, y - 25);
      
      // Fidelity display
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(`F: ${node.fidelity.toFixed(2)}`, x, y + 30);
    });

    // Draw quantum state transfer animation
    if (isRunning && transmissionProgress > 0) {
      drawQuantumStateTransfer(ctx);
    }
  };

  const drawProtocolConnections = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = getProtocolColor(selectedProtocol.id);
    ctx.lineWidth = 3;
    
    switch (selectedProtocol.id) {
      case 'standard':
        drawDirectConnection(ctx, nodes[0], nodes[4]);
        break;
      case 'repeater':
        drawRepeaterChain(ctx);
        break;
      case 'satellite':
        drawSatelliteConnections(ctx);
        break;
      case 'multipath':
        drawMultiPathConnections(ctx);
        break;
    }
  };

  const drawDirectConnection = (ctx: CanvasRenderingContext2D, from: TeleportationNode, to: TeleportationNode) => {
    ctx.beginPath();
    ctx.moveTo(from.position.x, from.position.y);
    ctx.lineTo(to.position.x, to.position.y);
    ctx.stroke();
  };

  const drawRepeaterChain = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < nodes.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(nodes[i].position.x, nodes[i].position.y);
      ctx.lineTo(nodes[i + 1].position.x, nodes[i + 1].position.y);
      ctx.stroke();
    }
  };

  const drawSatelliteConnections = (ctx: CanvasRenderingContext2D) => {
    const satellite = { x: 350, y: 50 };
    
    // Draw satellite
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(satellite.x - 8, satellite.y - 8, 16, 16);
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(satellite.x - 15, satellite.y - 3, 6, 6);
    ctx.fillRect(satellite.x + 9, satellite.y - 3, 6, 6);
    
    // Connections to satellite
    ctx.strokeStyle = getProtocolColor('satellite');
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(nodes[0].position.x, nodes[0].position.y);
    ctx.lineTo(satellite.x, satellite.y);
    ctx.moveTo(satellite.x, satellite.y);
    ctx.lineTo(nodes[4].position.x, nodes[4].position.y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawMultiPathConnections = (ctx: CanvasRenderingContext2D) => {
    // Draw multiple parallel paths
    const paths = [
      [0, 1, 2, 4], // Path 1
      [0, 3, 4]     // Path 2
    ];
    
    paths.forEach((path, pathIndex) => {
      ctx.strokeStyle = pathIndex === 0 ? '#f472b6' : '#a855f7';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < path.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(nodes[path[i]].position.x, nodes[path[i]].position.y);
        ctx.lineTo(nodes[path[i + 1]].position.x, nodes[path[i + 1]].position.y);
        ctx.stroke();
      }
    });
  };

  const drawQuantumStateTransfer = (ctx: CanvasRenderingContext2D) => {
    const progress = transmissionProgress / 100;
    
    // Calculate position along the path
    let totalDistance = 0;
    const segments = [];
    
    for (let i = 0; i < nodes.length - 1; i++) {
      const from = nodes[i].position;
      const to = nodes[i + 1].position;
      const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
      segments.push({ from, to, distance });
      totalDistance += distance;
    }
    
    let currentDistance = progress * totalDistance;
    let currentX = nodes[0].position.x;
    let currentY = nodes[0].position.y;
    
    for (const segment of segments) {
      if (currentDistance <= segment.distance) {
        const segmentProgress = currentDistance / segment.distance;
        currentX = segment.from.x + (segment.to.x - segment.from.x) * segmentProgress;
        currentY = segment.from.y + (segment.to.y - segment.from.y) * segmentProgress;
        break;
      }
      currentDistance -= segment.distance;
    }
    
    // Draw quantum state particle
    ctx.fillStyle = getProtocolColor(selectedProtocol.id);
    ctx.shadowColor = getProtocolColor(selectedProtocol.id);
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw quantum interference pattern
    ctx.strokeStyle = getProtocolColor(selectedProtocol.id) + '60';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(currentX, currentY, 6 + i * 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const startTeleportation = () => {
    setIsRunning(true);
    setTransmissionProgress(0);
    setTotalAttempts(prev => prev + 1);
    
    // Update node status
    setNodes(prev => prev.map(node => ({
      ...node,
      status: 'active'
    })));

    // Simulate transmission
    const interval = setInterval(() => {
      setTransmissionProgress(prev => {
        const newProgress = prev + 2;
        
        // Calculate fidelity degradation
        const baseFidelity = selectedProtocol.fidelityThreshold;
        const distanceFactor = (selectedProtocol.maxDistance / 1000) * 0.05;
        const errorCorrectionBonus = selectedProtocol.errorCorrection ? 0.1 : 0;
        const currentFid = Math.max(0.5, baseFidelity - distanceFactor + errorCorrectionBonus + (Math.random() - 0.5) * 0.1);
        setCurrentFidelity(currentFid);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          if (currentFid >= selectedProtocol.fidelityThreshold) {
            setSuccessfulTransmissions(prev => prev + 1);
            toast({
              title: "Teleportare reușită!",
              description: `Fidelitate: ${(currentFid * 100).toFixed(1)}%`,
            });
          } else {
            toast({
              title: "Teleportare eșuată",
              description: `Fidelitate prea scăzută: ${(currentFid * 100).toFixed(1)}%`,
              variant: "destructive"
            });
          }
          
          setTimeout(() => {
            setIsRunning(false);
            setNodes(prev => prev.map(node => ({ ...node, status: 'idle' })));
          }, 1000);
        }
        
        return newProgress;
      });
    }, 100);

    toast({
      title: "Teleportare începută",
      description: `Protocol: ${selectedProtocol.name}`,
    });
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setTransmissionProgress(0);
    setCurrentFidelity(1.0);
    setSuccessfulTransmissions(0);
    setTotalAttempts(0);
    setNodes(prev => prev.map(node => ({ ...node, status: 'idle' })));
  };

  const animate = () => {
    setSimulationTime(prev => prev + 1);
    drawTeleportationNetwork();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    drawTeleportationNetwork();
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, nodes, transmissionProgress, selectedProtocol]);

  const successRate = totalAttempts > 0 ? (successfulTransmissions / totalAttempts) * 100 : 0;

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-400" />
            <CardTitle className="text-white">Teleportare Cuantică Lungă Distanță</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={startTeleportation}
              disabled={isRunning}
              className="bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30"
            >
              <Play className="w-4 h-4 mr-1" />
              Teleportează
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetSimulation}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="simulation" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="simulation">Simulare</TabsTrigger>
            <TabsTrigger value="protocols">Protocoale</TabsTrigger>
            <TabsTrigger value="analytics">Analiză</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simulation" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Network Visualization */}
              <div className="lg:col-span-2">
                <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={700}
                    height={300}
                    className="w-full h-auto border border-white/20 rounded"
                  />
                </div>
                
                {/* Progress Indicators */}
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Progress Transmisie</span>
                      <span className="text-purple-400">{transmissionProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={transmissionProgress} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Fidelitate Curentă</span>
                      <span className="text-cyan-400">{(currentFidelity * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={currentFidelity * 100} className="h-2" />
                  </div>
                </div>
              </div>
              
              {/* Protocol Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Protocol Teleportare
                  </label>
                  <select
                    value={selectedProtocol.id}
                    onChange={(e) => {
                      const protocol = protocols.find(p => p.id === e.target.value);
                      if (protocol) setSelectedProtocol(protocol);
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isRunning}
                  >
                    {protocols.map(protocol => (
                      <option key={protocol.id} value={protocol.id}>
                        {protocol.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Protocol Info */}
                <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-2">{selectedProtocol.name}</h4>
                  <p className="text-gray-300 text-sm mb-3">{selectedProtocol.description}</p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distanță Max:</span>
                      <span className="text-cyan-400">{selectedProtocol.maxDistance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fidelitate Min:</span>
                      <span className="text-green-400">{(selectedProtocol.fidelityThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Corecție Erori:</span>
                      <Badge variant={selectedProtocol.errorCorrection ? "default" : "secondary"} className="text-xs">
                        {selectedProtocol.errorCorrection ? "Da" : "Nu"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Complexitate:</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          selectedProtocol.complexity === 'Low' ? 'border-green-500/30 text-green-400' :
                          selectedProtocol.complexity === 'Medium' ? 'border-yellow-500/30 text-yellow-400' :
                          selectedProtocol.complexity === 'High' ? 'border-orange-500/30 text-orange-400' :
                          'border-red-500/30 text-red-400'
                        }`}
                      >
                        {selectedProtocol.complexity}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Network Status */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Status Noduri</h4>
                  {nodes.map(node => (
                    <div key={node.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{node.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            node.status === 'active' ? 'border-green-500/30 text-green-400' :
                            node.status === 'entangled' ? 'border-purple-500/30 text-purple-400' :
                            node.status === 'error' ? 'border-red-500/30 text-red-400' :
                            'border-gray-500/30 text-gray-400'
                          }`}
                        >
                          {node.status}
                        </Badge>
                        <span className="text-xs text-gray-500">F: {node.fidelity.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="protocols" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {protocols.map(protocol => (
                <div key={protocol.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getProtocolColor(protocol.id) }}
                    />
                    <h4 className="text-white font-medium">{protocol.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ml-auto ${
                        protocol.complexity === 'Low' ? 'border-green-500/30 text-green-400' :
                        protocol.complexity === 'Medium' ? 'border-yellow-500/30 text-yellow-400' :
                        protocol.complexity === 'High' ? 'border-orange-500/30 text-orange-400' :
                        'border-red-500/30 text-red-400'
                      }`}
                    >
                      {protocol.complexity}
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{protocol.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400">Distanță:</span>
                      <div className="text-cyan-400 font-mono">{protocol.maxDistance} km</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Fidelitate:</span>
                      <div className="text-green-400 font-mono">{(protocol.fidelityThreshold * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Total Încercări</h4>
                <div className="text-2xl text-cyan-400 font-bold">{totalAttempts}</div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Teleportări Reușite</h4>
                <div className="text-2xl text-green-400 font-bold">{successfulTransmissions}</div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Rata de Succes</h4>
                <div className="text-2xl text-purple-400 font-bold">{successRate.toFixed(1)}%</div>
                <Progress value={successRate} className="mt-2" />
              </div>
            </div>
            
            <div className="mt-6 bg-white/5 border border-white/20 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Comparație Protocoale</h4>
              <div className="space-y-3">
                {protocols.map(protocol => (
                  <div key={protocol.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getProtocolColor(protocol.id) }}
                      />
                      <span className="text-gray-300 text-sm">{protocol.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-cyan-400">{protocol.maxDistance} km</span>
                      <span className="text-green-400">{(protocol.fidelityThreshold * 100).toFixed(0)}%</span>
                      <Badge variant="outline" className="text-xs">
                        {protocol.errorCorrection ? "EC" : "No EC"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
