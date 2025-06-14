
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Network, 
  Route, 
  Zap, 
  Target, 
  Activity,
  Play, 
  Pause, 
  RotateCcw,
  ArrowRight,
  Settings,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuantumNode {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'source' | 'intermediate' | 'destination' | 'repeater';
  coherenceTime: number;
  fidelity: number;
  capacity: number;
  currentLoad: number;
  active: boolean;
}

interface QuantumConnection {
  id: string;
  from: string;
  to: string;
  distance: number;
  baseFidelity: number;
  currentFidelity: number;
  latency: number;
  bandwidth: number;
  congestion: number;
  active: boolean;
}

interface RoutingPath {
  id: string;
  algorithm: string;
  nodes: string[];
  totalDistance: number;
  endToEndFidelity: number;
  totalLatency: number;
  cost: number;
  reliability: number;
  status: 'idle' | 'computing' | 'active' | 'completed' | 'failed';
}

interface RoutingMetrics {
  totalPaths: number;
  averageFidelity: number;
  averageLatency: number;
  networkUtilization: number;
  successfulRoutes: number;
  failedRoutes: number;
}

const routingAlgorithms = [
  { id: 'dijkstra', name: 'Dijkstra Shortest Path', description: 'Optimizare distanță minimă' },
  { id: 'fidelity', name: 'Maximum Fidelity', description: 'Optimizare fidelitate maximă' },
  { id: 'latency', name: 'Minimum Latency', description: 'Optimizare latență minimă' },
  { id: 'hybrid', name: 'Hybrid Multi-Objective', description: 'Optimizare multi-obiectiv' },
  { id: 'congestion', name: 'Congestion Aware', description: 'Evitarea congestiei' },
  { id: 'adaptive', name: 'Adaptive Routing', description: 'Rutare adaptivă dinamică' }
];

export const QuantumNetworkRouting = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra');
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [animationTime, setAnimationTime] = useState(0);
  const { toast } = useToast();

  const [nodes, setNodes] = useState<QuantumNode[]>([
    { id: 'A', name: 'Node A', position: { x: 80, y: 100 }, type: 'source', coherenceTime: 10, fidelity: 0.98, capacity: 100, currentLoad: 20, active: false },
    { id: 'B', name: 'Node B', position: { x: 200, y: 60 }, type: 'repeater', coherenceTime: 8, fidelity: 0.95, capacity: 80, currentLoad: 35, active: false },
    { id: 'C', name: 'Node C', position: { x: 180, y: 180 }, type: 'intermediate', coherenceTime: 12, fidelity: 0.93, capacity: 120, currentLoad: 60, active: false },
    { id: 'D', name: 'Node D', position: { x: 320, y: 40 }, type: 'repeater', coherenceTime: 9, fidelity: 0.96, capacity: 90, currentLoad: 45, active: false },
    { id: 'E', name: 'Node E', position: { x: 300, y: 140 }, type: 'intermediate', coherenceTime: 11, fidelity: 0.94, capacity: 110, currentLoad: 70, active: false },
    { id: 'F', name: 'Node F', position: { x: 280, y: 220 }, type: 'repeater', coherenceTime: 7, fidelity: 0.92, capacity: 70, currentLoad: 25, active: false },
    { id: 'G', name: 'Node G', position: { x: 420, y: 120 }, type: 'destination', coherenceTime: 15, fidelity: 0.99, capacity: 150, currentLoad: 10, active: false }
  ]);

  const [connections, setConnections] = useState<QuantumConnection[]>([
    { id: 'A-B', from: 'A', to: 'B', distance: 140, baseFidelity: 0.95, currentFidelity: 0.93, latency: 2.1, bandwidth: 50, congestion: 0.2, active: false },
    { id: 'A-C', from: 'A', to: 'C', distance: 130, baseFidelity: 0.92, currentFidelity: 0.90, latency: 2.0, bandwidth: 40, congestion: 0.4, active: false },
    { id: 'B-D', from: 'B', to: 'D', distance: 120, baseFidelity: 0.94, currentFidelity: 0.92, latency: 1.8, bandwidth: 60, congestion: 0.3, active: false },
    { id: 'B-E', from: 'B', to: 'E', distance: 110, baseFidelity: 0.93, currentFidelity: 0.91, latency: 1.7, bandwidth: 45, congestion: 0.5, active: false },
    { id: 'C-E', from: 'C', to: 'E', distance: 140, baseFidelity: 0.91, currentFidelity: 0.88, latency: 2.2, bandwidth: 35, congestion: 0.6, active: false },
    { id: 'C-F', from: 'C', to: 'F', distance: 100, baseFidelity: 0.96, currentFidelity: 0.94, latency: 1.5, bandwidth: 55, congestion: 0.1, active: false },
    { id: 'D-G', from: 'D', to: 'G', distance: 110, baseFidelity: 0.97, currentFidelity: 0.95, latency: 1.6, bandwidth: 65, congestion: 0.2, active: false },
    { id: 'E-G', from: 'E', to: 'G', distance: 130, baseFidelity: 0.95, currentFidelity: 0.93, latency: 1.9, bandwidth: 50, congestion: 0.4, active: false },
    { id: 'F-G', from: 'F', to: 'G', distance: 160, baseFidelity: 0.89, currentFidelity: 0.86, latency: 2.4, bandwidth: 30, congestion: 0.3, active: false }
  ]);

  const [routingPaths, setRoutingPaths] = useState<RoutingPath[]>([]);
  const [metrics, setMetrics] = useState<RoutingMetrics>({
    totalPaths: 0,
    averageFidelity: 0,
    averageLatency: 0,
    networkUtilization: 0,
    successfulRoutes: 0,
    failedRoutes: 0
  });

  const [optimizationWeights, setOptimizationWeights] = useState({
    fidelity: [0.4],
    latency: [0.3],
    distance: [0.2],
    congestion: [0.1]
  });

  // Routing algorithms implementation
  const computeRoute = (algorithm: string, source: string = 'A', destination: string = 'G'): RoutingPath | null => {
    const graph = buildGraph();
    let path: string[] = [];
    let totalDistance = 0;
    let endToEndFidelity = 1;
    let totalLatency = 0;

    switch (algorithm) {
      case 'dijkstra':
        path = dijkstraShortestPath(graph, source, destination);
        break;
      case 'fidelity':
        path = maxFidelityPath(graph, source, destination);
        break;
      case 'latency':
        path = minLatencyPath(graph, source, destination);
        break;
      case 'hybrid':
        path = hybridOptimalPath(graph, source, destination);
        break;
      case 'congestion':
        path = congestionAwarePath(graph, source, destination);
        break;
      case 'adaptive':
        path = adaptiveRoutingPath(graph, source, destination);
        break;
      default:
        return null;
    }

    if (path.length === 0) return null;

    // Calculate path metrics
    for (let i = 0; i < path.length - 1; i++) {
      const connection = connections.find(c => 
        (c.from === path[i] && c.to === path[i + 1]) || 
        (c.to === path[i] && c.from === path[i + 1])
      );
      if (connection) {
        totalDistance += connection.distance;
        endToEndFidelity *= connection.currentFidelity;
        totalLatency += connection.latency;
      }
    }

    const cost = calculatePathCost(path, algorithm);
    const reliability = calculateReliability(path);

    return {
      id: `route-${Date.now()}`,
      algorithm,
      nodes: path,
      totalDistance,
      endToEndFidelity,
      totalLatency,
      cost,
      reliability,
      status: 'computed' as any
    };
  };

  const buildGraph = () => {
    const graph: { [key: string]: Array<{ node: string; distance: number; fidelity: number; latency: number; congestion: number }> } = {};
    
    nodes.forEach(node => {
      graph[node.id] = [];
    });

    connections.forEach(conn => {
      graph[conn.from].push({
        node: conn.to,
        distance: conn.distance,
        fidelity: conn.currentFidelity,
        latency: conn.latency,
        congestion: conn.congestion
      });
      graph[conn.to].push({
        node: conn.from,
        distance: conn.distance,
        fidelity: conn.currentFidelity,
        latency: conn.latency,
        congestion: conn.congestion
      });
    });

    return graph;
  };

  const dijkstraShortestPath = (graph: any, start: string, end: string): string[] => {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited = new Set(Object.keys(graph));

    Object.keys(graph).forEach(node => {
      distances[node] = node === start ? 0 : Infinity;
      previous[node] = null;
    });

    while (unvisited.size > 0) {
      const current = Array.from(unvisited).reduce((min, node) => 
        distances[node] < distances[min] ? node : min
      );

      if (current === end) break;
      unvisited.delete(current);

      graph[current].forEach((neighbor: any) => {
        if (unvisited.has(neighbor.node)) {
          const alt = distances[current] + neighbor.distance;
          if (alt < distances[neighbor.node]) {
            distances[neighbor.node] = alt;
            previous[neighbor.node] = current;
          }
        }
      });
    }

    const path: string[] = [];
    let current = end;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    return path[0] === start ? path : [];
  };

  const maxFidelityPath = (graph: any, start: string, end: string): string[] => {
    const fidelities: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited = new Set(Object.keys(graph));

    Object.keys(graph).forEach(node => {
      fidelities[node] = node === start ? 1 : 0;
      previous[node] = null;
    });

    while (unvisited.size > 0) {
      const current = Array.from(unvisited).reduce((max, node) => 
        fidelities[node] > fidelities[max] ? node : max
      );

      if (current === end) break;
      unvisited.delete(current);

      graph[current].forEach((neighbor: any) => {
        if (unvisited.has(neighbor.node)) {
          const alt = fidelities[current] * neighbor.fidelity;
          if (alt > fidelities[neighbor.node]) {
            fidelities[neighbor.node] = alt;
            previous[neighbor.node] = current;
          }
        }
      });
    }

    const path: string[] = [];
    let current = end;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    return path[0] === start ? path : [];
  };

  const minLatencyPath = (graph: any, start: string, end: string): string[] => {
    const latencies: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited = new Set(Object.keys(graph));

    Object.keys(graph).forEach(node => {
      latencies[node] = node === start ? 0 : Infinity;
      previous[node] = null;
    });

    while (unvisited.size > 0) {
      const current = Array.from(unvisited).reduce((min, node) => 
        latencies[node] < latencies[min] ? node : min
      );

      if (current === end) break;
      unvisited.delete(current);

      graph[current].forEach((neighbor: any) => {
        if (unvisited.has(neighbor.node)) {
          const alt = latencies[current] + neighbor.latency;
          if (alt < latencies[neighbor.node]) {
            latencies[neighbor.node] = alt;
            previous[neighbor.node] = current;
          }
        }
      });
    }

    const path: string[] = [];
    let current = end;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    return path[0] === start ? path : [];
  };

  const hybridOptimalPath = (graph: any, start: string, end: string): string[] => {
    const scores: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited = new Set(Object.keys(graph));

    Object.keys(graph).forEach(node => {
      scores[node] = node === start ? 0 : Infinity;
      previous[node] = null;
    });

    while (unvisited.size > 0) {
      const current = Array.from(unvisited).reduce((min, node) => 
        scores[node] < scores[min] ? node : min
      );

      if (current === end) break;
      unvisited.delete(current);

      graph[current].forEach((neighbor: any) => {
        if (unvisited.has(neighbor.node)) {
          const hybridCost = 
            optimizationWeights.distance[0] * neighbor.distance +
            optimizationWeights.latency[0] * neighbor.latency * 100 +
            optimizationWeights.fidelity[0] * (1 - neighbor.fidelity) * 1000 +
            optimizationWeights.congestion[0] * neighbor.congestion * 100;
          
          const alt = scores[current] + hybridCost;
          if (alt < scores[neighbor.node]) {
            scores[neighbor.node] = alt;
            previous[neighbor.node] = current;
          }
        }
      });
    }

    const path: string[] = [];
    let current = end;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    return path[0] === start ? path : [];
  };

  const congestionAwarePath = (graph: any, start: string, end: string): string[] => {
    return dijkstraShortestPath(graph, start, end); // Simplified for now
  };

  const adaptiveRoutingPath = (graph: any, start: string, end: string): string[] => {
    return hybridOptimalPath(graph, start, end); // Simplified for now
  };

  const calculatePathCost = (path: string[], algorithm: string): number => {
    // Simplified cost calculation
    return path.length * 10 + Math.random() * 50;
  };

  const calculateReliability = (path: string[]): number => {
    let reliability = 1;
    for (let i = 0; i < path.length - 1; i++) {
      const connection = connections.find(c => 
        (c.from === path[i] && c.to === path[i + 1]) || 
        (c.to === path[i] && c.from === path[i + 1])
      );
      if (connection) {
        reliability *= (1 - connection.congestion) * connection.currentFidelity;
      }
    }
    return reliability;
  };

  const executeRouting = () => {
    const algorithmInfo = routingAlgorithms.find(a => a.id === selectedAlgorithm);
    if (!algorithmInfo) return;

    setIsRunning(true);
    
    toast({
      title: "Execuție algoritm rutare",
      description: `Se calculează ruta optimă cu ${algorithmInfo.name}`,
    });

    // Simulate computation time
    setTimeout(() => {
      const newPath = computeRoute(selectedAlgorithm);
      if (newPath) {
        setRoutingPaths(prev => [{ ...newPath, status: 'active' }, ...prev.slice(0, 4)]);
        setSelectedPath(newPath.id);
        
        // Activate nodes and connections in the path
        setNodes(prev => prev.map(node => ({
          ...node,
          active: newPath.nodes.includes(node.id)
        })));

        setConnections(prev => prev.map(conn => ({
          ...conn,
          active: newPath.nodes.some((node, i) => 
            i < newPath.nodes.length - 1 && 
            ((conn.from === node && conn.to === newPath.nodes[i + 1]) ||
             (conn.to === node && conn.from === newPath.nodes[i + 1]))
          )
        })));

        // Update metrics
        setMetrics(prev => ({
          ...prev,
          totalPaths: prev.totalPaths + 1,
          successfulRoutes: prev.successfulRoutes + 1,
          averageFidelity: newPath.endToEndFidelity,
          averageLatency: newPath.totalLatency,
          networkUtilization: calculateNetworkUtilization()
        }));

        toast({
          title: "Rută calculată cu succes",
          description: `Fidelitate: ${(newPath.endToEndFidelity * 100).toFixed(1)}%, Latență: ${newPath.totalLatency.toFixed(1)}ms`,
        });
      }
      
      setIsRunning(false);
    }, 1000 + Math.random() * 2000);
  };

  const calculateNetworkUtilization = (): number => {
    const totalCapacity = nodes.reduce((sum, node) => sum + node.capacity, 0);
    const totalLoad = nodes.reduce((sum, node) => sum + node.currentLoad, 0);
    return (totalLoad / totalCapacity) * 100;
  };

  const resetNetwork = () => {
    setIsRunning(false);
    setSelectedPath('');
    setRoutingPaths([]);
    
    setNodes(prev => prev.map(node => ({ ...node, active: false })));
    setConnections(prev => prev.map(conn => ({ ...conn, active: false })));
    
    setMetrics({
      totalPaths: 0,
      averageFidelity: 0,
      averageLatency: 0,
      networkUtilization: 0,
      successfulRoutes: 0,
      failedRoutes: 0
    });
  };

  // Network visualization
  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.from);
      const toNode = nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        ctx.strokeStyle = conn.active ? '#3b82f6' : '#64748b';
        ctx.lineWidth = conn.active ? 3 : 1.5;
        ctx.setLineDash(conn.active ? [] : [3, 3]);
        
        ctx.beginPath();
        ctx.moveTo(fromNode.position.x, fromNode.position.y);
        ctx.lineTo(toNode.position.x, toNode.position.y);
        ctx.stroke();

        // Draw congestion indicator
        if (conn.congestion > 0.3) {
          const midX = (fromNode.position.x + toNode.position.x) / 2;
          const midY = (fromNode.position.y + toNode.position.y) / 2;
          ctx.fillStyle = `rgba(239, 68, 68, ${conn.congestion})`;
          ctx.beginPath();
          ctx.arc(midX, midY, 5, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Animate quantum packets
        if (conn.active && isRunning) {
          const progress = (animationTime * 0.03) % 1;
          const x = fromNode.position.x + (toNode.position.x - fromNode.position.x) * progress;
          const y = fromNode.position.y + (toNode.position.y - fromNode.position.y) * progress;
          
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const { x, y } = node.position;
      
      // Node color based on type
      let nodeColor = '#6b7280';
      if (node.active) {
        switch (node.type) {
          case 'source': nodeColor = '#ef4444'; break;
          case 'destination': nodeColor = '#22c55e'; break;
          case 'repeater': nodeColor = '#8b5cf6'; break;
          case 'intermediate': nodeColor = '#3b82f6'; break;
        }
      }
      
      ctx.fillStyle = nodeColor;
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = node.active ? '#ffffff' : '#64748b';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, x, y - 25);
      
      // Load indicator
      if (node.currentLoad > 0) {
        const loadRatio = node.currentLoad / node.capacity;
        ctx.fillStyle = loadRatio > 0.7 ? '#ef4444' : loadRatio > 0.4 ? '#f59e0b' : '#22c55e';
        ctx.fillRect(x - 8, y + 20, 16 * loadRatio, 3);
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(x - 8, y + 20, 16, 3);
      }
    });
  };

  const animate = () => {
    setAnimationTime(prev => prev + 1);
    drawNetwork();
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
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

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-white">Algoritmi de Rutare Cuantică</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isRunning ? "destructive" : "default"}
              onClick={isRunning ? () => setIsRunning(false) : executeRouting}
              className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
              disabled={!selectedAlgorithm}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? "Stop" : "Execută"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetNetwork}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="algorithms" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="algorithms">Algoritmi</TabsTrigger>
            <TabsTrigger value="network">Rețea</TabsTrigger>
            <TabsTrigger value="routes">Rute</TabsTrigger>
            <TabsTrigger value="metrics">Metrici</TabsTrigger>
          </TabsList>
          
          <TabsContent value="algorithms" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routingAlgorithms.map(algorithm => (
                <div
                  key={algorithm.id}
                  className={`border border-white/20 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAlgorithm === algorithm.id ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedAlgorithm(algorithm.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Route className="w-5 h-5 text-blue-400" />
                    <h4 className="text-white font-medium">{algorithm.name}</h4>
                  </div>
                  <p className="text-sm text-gray-300">{algorithm.description}</p>
                  {selectedAlgorithm === algorithm.id && (
                    <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Selectat
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="network" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={300}
                    className="w-full h-auto border border-white/20 rounded"
                  />
                </div>
              </div>
              
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
                          <span className="text-xs text-gray-500">
                            {Math.round((node.currentLoad / node.capacity) * 100)}%
                          </span>
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
              {routingPaths.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Rute Calculate</h4>
                  {routingPaths.map(path => (
                    <div key={path.id} className="border border-white/20 rounded-lg p-4 bg-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h5 className="text-white font-medium">{path.algorithm}</h5>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              path.status === 'active' ? 'border-green-500/30 text-green-400' : 'border-gray-500/30 text-gray-400'
                            }`}
                          >
                            {path.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {path.nodes.map((nodeId, index) => (
                          <React.Fragment key={nodeId}>
                            <span className="text-cyan-400 text-sm">{nodeId}</span>
                            {index < path.nodes.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-gray-400">Distanță: </span>
                          <span className="text-white">{path.totalDistance}km</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Fidelitate: </span>
                          <span className="text-white">{(path.endToEndFidelity * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Latență: </span>
                          <span className="text-white">{path.totalLatency.toFixed(1)}ms</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Fiabilitate: </span>
                          <span className="text-white">{(path.reliability * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Route className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Nu există rute calculate încă</p>
                  <p className="text-sm text-gray-500">Selectați un algoritm și apăsați "Execută"</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Rute Totale</h4>
                  <div className="text-2xl text-blue-400 font-bold">{metrics.totalPaths}</div>
                  <p className="text-xs text-gray-400">Calculate cu succes</p>
                </div>
                
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Fidelitate Medie</h4>
                  <div className="text-2xl text-green-400 font-bold">
                    {metrics.averageFidelity > 0 ? `${(metrics.averageFidelity * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  <p className="text-xs text-gray-400">End-to-end</p>
                </div>
                
                <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Latență Medie</h4>
                  <div className="text-2xl text-yellow-400 font-bold">
                    {metrics.averageLatency > 0 ? `${metrics.averageLatency.toFixed(1)}ms` : 'N/A'}
                  </div>
                  <p className="text-xs text-gray-400">Întârziere totală</p>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Configurare Optimizare</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Greutate Fidelitate</span>
                      <span className="text-white">{optimizationWeights.fidelity[0].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={optimizationWeights.fidelity}
                      onValueChange={(value) => setOptimizationWeights(prev => ({...prev, fidelity: value}))}
                      max={1}
                      step={0.1}
                      className="mb-4"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Greutate Latență</span>
                      <span className="text-white">{optimizationWeights.latency[0].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={optimizationWeights.latency}
                      onValueChange={(value) => setOptimizationWeights(prev => ({...prev, latency: value}))}
                      max={1}
                      step={0.1}
                      className="mb-4"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Greutate Distanță</span>
                      <span className="text-white">{optimizationWeights.distance[0].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={optimizationWeights.distance}
                      onValueChange={(value) => setOptimizationWeights(prev => ({...prev, distance: value}))}
                      max={1}
                      step={0.1}
                      className="mb-4"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Greutate Congestie</span>
                      <span className="text-white">{optimizationWeights.congestion[0].toFixed(2)}</span>
                    </div>
                    <Slider
                      value={optimizationWeights.congestion}
                      onValueChange={(value) => setOptimizationWeights(prev => ({...prev, congestion: value}))}
                      max={1}
                      step={0.1}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
