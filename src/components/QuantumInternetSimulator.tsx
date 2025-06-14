
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  Zap, 
  Shield, 
  Network, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuantumNode {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'sender' | 'receiver' | 'repeater';
  status: 'idle' | 'active' | 'entangled';
  qubits: number;
}

interface QuantumConnection {
  id: string;
  from: string;
  to: string;
  protocol: 'qkd' | 'teleportation' | 'entanglement';
  fidelity: number;
  active: boolean;
}

interface SimulationStats {
  packetsTransmitted: number;
  successRate: number;
  averageFidelity: number;
  protocolsUsed: string[];
}

export const QuantumInternetSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<'qkd' | 'teleportation' | 'entanglement'>('qkd');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const { toast } = useToast();

  const [nodes, setNodes] = useState<QuantumNode[]>([
    { id: 'alice', name: 'Alice', position: { x: 100, y: 150 }, type: 'sender', status: 'idle', qubits: 4 },
    { id: 'bob', name: 'Bob', position: { x: 500, y: 150 }, type: 'receiver', status: 'idle', qubits: 4 },
    { id: 'charlie', name: 'Charlie', position: { x: 300, y: 80 }, type: 'repeater', status: 'idle', qubits: 8 },
    { id: 'eve', name: 'Eve', position: { x: 300, y: 220 }, type: 'repeater', status: 'idle', qubits: 6 }
  ]);

  const [connections, setConnections] = useState<QuantumConnection[]>([
    { id: 'alice-charlie', from: 'alice', to: 'charlie', protocol: 'qkd', fidelity: 0.95, active: false },
    { id: 'charlie-bob', from: 'charlie', to: 'bob', protocol: 'qkd', fidelity: 0.92, active: false },
    { id: 'alice-eve', from: 'alice', to: 'eve', protocol: 'entanglement', fidelity: 0.88, active: false },
    { id: 'eve-bob', from: 'eve', to: 'bob', protocol: 'teleportation', fidelity: 0.90, active: false }
  ]);

  const [stats, setStats] = useState<SimulationStats>({
    packetsTransmitted: 0,
    successRate: 0,
    averageFidelity: 0,
    protocolsUsed: []
  });

  const [animationTime, setAnimationTime] = useState(0);

  // Draw the quantum network
  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    connections.forEach(connection => {
      const fromNode = nodes.find(n => n.id === connection.from);
      const toNode = nodes.find(n => n.id === connection.to);
      
      if (fromNode && toNode) {
        ctx.strokeStyle = connection.active ? '#00ff88' : '#64748b';
        ctx.lineWidth = connection.active ? 3 : 2;
        ctx.setLineDash(connection.active ? [] : [5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(fromNode.position.x, fromNode.position.y);
        ctx.lineTo(toNode.position.x, toNode.position.y);
        ctx.stroke();

        // Draw quantum particles flowing through active connections
        if (connection.active && isRunning) {
          const progress = (animationTime * simulationSpeed * 0.02) % 1;
          const x = fromNode.position.x + (toNode.position.x - fromNode.position.x) * progress;
          const y = fromNode.position.y + (toNode.position.y - fromNode.position.y) * progress;
          
          ctx.fillStyle = getProtocolColor(connection.protocol);
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
          
          // Add glow effect
          ctx.shadowColor = getProtocolColor(connection.protocol);
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const { x, y } = node.position;
      
      // Node background
      ctx.fillStyle = getNodeColor(node.status);
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, 2 * Math.PI);
      ctx.fill();
      
      // Node border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, x, y - 35);
      
      // Qubit count
      ctx.fillText(`${node.qubits}q`, x, y + 45);
    });
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'entangled': return '#8b5cf6';
      default: return '#3b82f6';
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'qkd': return '#ff6b6b';
      case 'teleportation': return '#4ecdc4';
      case 'entanglement': return '#ffe66d';
      default: return '#ffffff';
    }
  };

  // Animation loop
  const animate = () => {
    setAnimationTime(prev => prev + 1);
    drawNetwork();
    animationRef.current = requestAnimationFrame(animate);
  };

  const startSimulation = () => {
    setIsRunning(true);
    
    // Activate connections based on selected protocol
    setConnections(prev => 
      prev.map(conn => ({
        ...conn,
        active: conn.protocol === selectedProtocol
      }))
    );

    // Update node status
    setNodes(prev => 
      prev.map(node => ({
        ...node,
        status: selectedProtocol === 'entanglement' ? 'entangled' : 'active'
      }))
    );

    // Start packet transmission simulation
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        packetsTransmitted: prev.packetsTransmitted + 1,
        successRate: Math.min(95, prev.successRate + Math.random() * 2),
        averageFidelity: 0.85 + Math.random() * 0.1,
        protocolsUsed: [...new Set([...prev.protocolsUsed, selectedProtocol])]
      }));
    }, 2000 / simulationSpeed);

    toast({
      title: "Simulare pornită",
      description: `Protocol: ${selectedProtocol.toUpperCase()}`,
    });

    return () => clearInterval(interval);
  };

  const stopSimulation = () => {
    setIsRunning(false);
    
    setConnections(prev => 
      prev.map(conn => ({ ...conn, active: false }))
    );

    setNodes(prev => 
      prev.map(node => ({ ...node, status: 'idle' }))
    );

    toast({
      title: "Simulare oprită",
      description: "Rețeaua cuantică este în stare de repaus",
    });
  };

  const resetSimulation = () => {
    stopSimulation();
    setStats({
      packetsTransmitted: 0,
      successRate: 0,
      averageFidelity: 0,
      protocolsUsed: []
    });
    setAnimationTime(0);
  };

  useEffect(() => {
    drawNetwork();
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, nodes, connections, animationTime]);

  const protocolDescriptions = {
    qkd: "Quantum Key Distribution - Distribuția securizată de chei cuantice folosind principiile mecanicii cuantice pentru detectarea interceptării.",
    teleportation: "Quantum Teleportation - Transferul instantaneu al stării cuantice între noduri distante folosind entanglement-ul cuantic.",
    entanglement: "Entanglement Distribution - Crearea și distribuția de perechi entangled între noduri pentru comunicare cuantică."
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            <CardTitle className="text-white">Simulator Internet Cuantic</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isRunning ? "destructive" : "default"}
              onClick={isRunning ? stopSimulation : startSimulation}
              className="bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Stop" : "Start"}
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
            <TabsTrigger value="statistics">Statistici</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simulation" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Network Visualization */}
              <div className="lg:col-span-2">
                <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={300}
                    className="w-full h-auto border border-white/20 rounded"
                  />
                </div>
              </div>
              
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Protocol Cuantic
                  </label>
                  <select
                    value={selectedProtocol}
                    onChange={(e) => setSelectedProtocol(e.target.value as any)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={isRunning}
                  >
                    <option value="qkd">QKD (Key Distribution)</option>
                    <option value="teleportation">Quantum Teleportation</option>
                    <option value="entanglement">Entanglement Distribution</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Viteză Simulare: {simulationSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.5"
                    value={simulationSpeed}
                    onChange={(e) => setSimulationSpeed(parseFloat(e.target.value))}
                    className="w-full"
                    disabled={isRunning}
                  />
                </div>
                
                {/* Node Status */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Status Noduri</h4>
                  {nodes.map(node => (
                    <div key={node.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{node.name}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          node.status === 'active' ? 'border-green-500/30 text-green-400' :
                          node.status === 'entangled' ? 'border-purple-500/30 text-purple-400' :
                          'border-gray-500/30 text-gray-400'
                        }`}
                      >
                        {node.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="protocols" className="mt-6">
            <div className="space-y-4">
              {Object.entries(protocolDescriptions).map(([protocol, description]) => (
                <div key={protocol} className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getProtocolColor(protocol) }}
                    />
                    <h4 className="text-white font-medium">{protocol.toUpperCase()}</h4>
                  </div>
                  <p className="text-gray-300 text-sm">{description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="statistics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Pachete Transmise</h4>
                <div className="text-2xl text-cyan-400 font-bold">{stats.packetsTransmitted}</div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Rata de Succes</h4>
                <div className="text-2xl text-green-400 font-bold">{stats.successRate.toFixed(1)}%</div>
                <Progress value={stats.successRate} className="mt-2" />
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Fidelitate Medie</h4>
                <div className="text-2xl text-purple-400 font-bold">{stats.averageFidelity.toFixed(3)}</div>
                <Progress value={stats.averageFidelity * 100} className="mt-2" />
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Protocoale Utilizate</h4>
                <div className="flex flex-wrap gap-1">
                  {stats.protocolsUsed.map(protocol => (
                    <Badge key={protocol} variant="outline" className="text-xs">
                      {protocol.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
