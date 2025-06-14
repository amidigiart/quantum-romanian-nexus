
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Route, 
  Network, 
  Zap, 
  Shield, 
  Play, 
  Pause, 
  RotateCcw,
  ArrowRight,
  Shuffle,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuantumNode {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'source' | 'intermediate' | 'destination';
  entanglementCount: number;
  fidelity: number;
  active: boolean;
}

interface QuantumLink {
  id: string;
  from: string;
  to: string;
  distance: number;
  fidelity: number;
  active: boolean;
  entangled: boolean;
}

interface CommunicationRoute {
  id: string;
  path: string[];
  totalDistance: number;
  expectedFidelity: number;
  hops: number;
  status: 'idle' | 'establishing' | 'active' | 'completed' | 'failed';
}

interface NetworkMetrics {
  totalNodes: number;
  activeConnections: number;
  averageFidelity: number;
  successfulTransmissions: number;
  swappingOperations: number;
}

export const MultiHopQuantumCommunication = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [animationTime, setAnimationTime] = useState(0);
  const { toast } = useToast();

  const [nodes, setNodes] = useState<QuantumNode[]>([
    { id: 'alice', name: 'Alice', position: { x: 50, y: 150 }, type: 'source', entanglementCount: 0, fidelity: 1.0, active: false },
    { id: 'node1', name: 'Node 1', position: { x: 150, y: 80 }, type: 'intermediate', entanglementCount: 0, fidelity: 0.95, active: false },
    { id: 'node2', name: 'Node 2', position: { x: 250, y: 220 }, type: 'intermediate', entanglementCount: 0, fidelity: 0.93, active: false },
    { id: 'node3', name: 'Node 3', position: { x: 350, y: 120 }, type: 'intermediate', entanglementCount: 0, fidelity: 0.91, active: false },
    { id: 'node4', name: 'Node 4', position: { x: 300, y: 50 }, type: 'intermediate', entanglementCount: 0, fidelity: 0.89, active: false },
    { id: 'bob', name: 'Bob', position: { x: 450, y: 150 }, type: 'destination', entanglementCount: 0, fidelity: 1.0, active: false }
  ]);

  const [links, setLinks] = useState<QuantumLink[]>([
    { id: 'alice-node1', from: 'alice', to: 'node1', distance: 120, fidelity: 0.95, active: false, entangled: false },
    { id: 'alice-node2', from: 'alice', to: 'node2', distance: 200, fidelity: 0.88, active: false, entangled: false },
    { id: 'node1-node3', from: 'node1', to: 'node3', distance: 180, fidelity: 0.92, active: false, entangled: false },
    { id: 'node1-node4', from: 'node1', to: 'node4', distance: 160, fidelity: 0.94, active: false, entangled: false },
    { id: 'node2-node3', from: 'node2', to: 'node3', distance: 140, fidelity: 0.90, active: false, entangled: false },
    { id: 'node3-bob', from: 'node3', to: 'bob', distance: 110, fidelity: 0.96, active: false, entangled: false },
    { id: 'node4-bob', from: 'node4', to: 'bob', distance: 170, fidelity: 0.87, active: false, entangled: false }
  ]);

  const [routes, setRoutes] = useState<CommunicationRoute[]>([
    { id: 'route1', path: ['alice', 'node1', 'node3', 'bob'], totalDistance: 410, expectedFidelity: 0.86, hops: 3, status: 'idle' },
    { id: 'route2', path: ['alice', 'node2', 'node3', 'bob'], totalDistance: 450, expectedFidelity: 0.83, hops: 3, status: 'idle' },
    { id: 'route3', path: ['alice', 'node1', 'node4', 'bob'], totalDistance: 450, expectedFidelity: 0.81, hops: 3, status: 'idle' }
  ]);

  const [metrics, setMetrics] = useState<NetworkMetrics>({
    totalNodes: 6,
    activeConnections: 0,
    averageFidelity: 0,
    successfulTransmissions: 0,
    swappingOperations: 0
  });

  const [errorCorrectionEnabled, setErrorCorrectionEnabled] = useState(true);
  const [swappingEfficiency, setSwappingEfficiency] = useState([0.85]);
  const [transmissionProgress, setTransmissionProgress] = useState(0);

  // Draw the quantum network
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

  const startCommunication = () => {
    if (!selectedRoute) {
      toast({
        title: "Selectați o rută",
        description: "Alegeți o rută pentru comunicația multi-hop",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    const route = routes.find(r => r.id === selectedRoute);
    if (!route) return;

    // Update route status
    setRoutes(prev => prev.map(r => 
      r.id === selectedRoute ? { ...r, status: 'establishing' } : r
    ));

    // Activate nodes in the route
    setNodes(prev => prev.map(node => ({
      ...node,
      active: route.path.includes(node.id),
      entanglementCount: route.path.includes(node.id) ? Math.floor(Math.random() * 3) + 1 : 0
    })));

    // Activate links in the route
    setLinks(prev => prev.map(link => {
      const isInRoute = route.path.some((nodeId, index) => 
        index < route.path.length - 1 && 
        ((link.from === nodeId && link.to === route.path[index + 1]) ||
         (link.to === nodeId && link.from === route.path[index + 1]))
      );
      return {
        ...link,
        active: isInRoute,
        entangled: isInRoute && Math.random() > 0.3
      };
    }));

    // Simulate transmission progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 2;
      setTransmissionProgress(progress);
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        // Complete transmission
        setRoutes(prev => prev.map(r => 
          r.id === selectedRoute ? { ...r, status: 'completed' } : r
        ));
        
        setMetrics(prev => ({
          ...prev,
          successfulTransmissions: prev.successfulTransmissions + 1,
          swappingOperations: prev.swappingOperations + route.hops - 1,
          activeConnections: links.filter(l => l.active).length,
          averageFidelity: route.expectedFidelity * swappingEfficiency[0]
        }));
        
        toast({
          title: "Transmisie completă",
          description: `Comunicația multi-hop a fost realizată cu succes pe ${route.hops} hop-uri`,
        });
      }
    }, 100);

    toast({
      title: "Comunicație pornită",
      description: `Stabilirea entanglement-ului pe ruta ${route.path.join(' → ')}`,
    });
  };

  const stopCommunication = () => {
    setIsRunning(false);
    setTransmissionProgress(0);
    
    setNodes(prev => prev.map(node => ({
      ...node,
      active: false,
      entanglementCount: 0
    })));
    
    setLinks(prev => prev.map(link => ({
      ...link,
      active: false,
      entangled: false
    })));
    
    setRoutes(prev => prev.map(route => ({
      ...route,
      status: 'idle'
    })));
  };

  const resetSimulation = () => {
    stopCommunication();
    setSelectedRoute('');
    setMetrics({
      totalNodes: 6,
      activeConnections: 0,
      averageFidelity: 0,
      successfulTransmissions: 0,
      swappingOperations: 0
    });
  };

  // Animation loop
  const animate = () => {
    setAnimationTime(prev => prev + 1);
    drawNetwork();
    animationRef.current = requestAnimationFrame(animate);
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
  }, [isRunning, nodes, links, selectedRoute, animationTime]);

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-white">Comunicație Cuantică Multi-Hop</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isRunning ? "destructive" : "default"}
              onClick={isRunning ? stopCommunication : startCommunication}
              className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
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
        <Tabs defaultValue="network" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="network">Rețea</TabsTrigger>
            <TabsTrigger value="routes">Rute</TabsTrigger>
            <TabsTrigger value="optimization">Optimizare</TabsTrigger>
            <TabsTrigger value="metrics">Metrici</TabsTrigger>
          </TabsList>
          
          <TabsContent value="network" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Network Visualization */}
              <div className="lg:col-span-2">
                <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={300}
                    className="w-full h-auto border border-white/20 rounded"
                  />
                </div>
                
                {isRunning && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-300 mb-2">
                      <span>Progres transmisie</span>
                      <span>{transmissionProgress}%</span>
                    </div>
                    <Progress value={transmissionProgress} className="h-2" />
                  </div>
                )}
              </div>
              
              {/* Network Status */}
              <div className="space-y-4">
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
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="routes" className="mt-6">
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
                      onClick={() => setSelectedRoute(route.id)}
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
          </TabsContent>
          
          <TabsContent value="optimization" className="mt-6">
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
                      onClick={() => setErrorCorrectionEnabled(!errorCorrectionEnabled)}
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
                      onValueChange={setSwappingEfficiency}
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
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Noduri Totale</h4>
                <div className="text-2xl text-blue-400 font-bold">{metrics.totalNodes}</div>
                <p className="text-xs text-gray-400">În rețeaua cuantică</p>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Conexiuni Active</h4>
                <div className="text-2xl text-green-400 font-bold">{metrics.activeConnections}</div>
                <p className="text-xs text-gray-400">Link-uri cuantice stabile</p>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Transmisii Reușite</h4>
                <div className="text-2xl text-cyan-400 font-bold">{metrics.successfulTransmissions}</div>
                <p className="text-xs text-gray-400">Comunicații complete</p>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Operații Swapping</h4>
                <div className="text-2xl text-purple-400 font-bold">{metrics.swappingOperations}</div>
                <p className="text-xs text-gray-400">Entanglement swaps</p>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 md:col-span-2">
                <h4 className="text-white font-medium mb-2">Fidelitate Medie</h4>
                <div className="text-2xl text-yellow-400 font-bold">
                  {metrics.averageFidelity > 0 ? (metrics.averageFidelity * 100).toFixed(1) + '%' : 'N/A'}
                </div>
                <Progress 
                  value={metrics.averageFidelity * 100} 
                  className="mt-2"
                />
                <p className="text-xs text-gray-400 mt-1">Calitatea conexiunilor end-to-end</p>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4 md:col-span-2">
                <h4 className="text-white font-medium mb-2">Eficiență Rețea</h4>
                <div className="text-2xl text-orange-400 font-bold">
                  {metrics.successfulTransmissions > 0 ? 
                    ((metrics.successfulTransmissions / (metrics.swappingOperations + 1)) * 100).toFixed(1) + '%' : 
                    'N/A'
                  }
                </div>
                <p className="text-xs text-gray-400">Rata de succes per operație</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
