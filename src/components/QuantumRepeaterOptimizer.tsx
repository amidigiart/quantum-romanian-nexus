
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  Zap, 
  Settings, 
  Play, 
  Pause,
  RotateCcw,
  MapPin,
  TrendingUp,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RepeaterNode {
  id: string;
  name: string;
  position: { x: number; y: number };
  type: 'source' | 'destination' | 'repeater';
  status: 'idle' | 'active' | 'entangled' | 'error';
  memoryTime: number;
  fidelity: number;
  range: number;
  isOptimal?: boolean;
}

interface NetworkPath {
  id: string;
  nodes: string[];
  totalDistance: number;
  averageFidelity: number;
  latency: number;
  isOptimal: boolean;
}

interface OptimizationMetrics {
  totalRepeaters: number;
  averageDistance: number;
  networkEfficiency: number;
  fidelityLoss: number;
  memoryRequirement: number;
}

export const QuantumRepeaterOptimizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'genetic' | 'simulated_annealing' | 'greedy'>('genetic');
  const [showOptimalPath, setShowOptimalPath] = useState(false);
  const { toast } = useToast();

  const [nodes, setNodes] = useState<RepeaterNode[]>([
    { id: 'alice', name: 'Alice', position: { x: 50, y: 150 }, type: 'source', status: 'idle', memoryTime: 100, fidelity: 0.98, range: 100 },
    { id: 'bob', name: 'Bob', position: { x: 650, y: 150 }, type: 'destination', status: 'idle', memoryTime: 100, fidelity: 0.98, range: 100 },
    { id: 'rep1', name: 'Rep-1', position: { x: 200, y: 100 }, type: 'repeater', status: 'idle', memoryTime: 50, fidelity: 0.85, range: 120 },
    { id: 'rep2', name: 'Rep-2', position: { x: 350, y: 180 }, type: 'repeater', status: 'idle', memoryTime: 60, fidelity: 0.88, range: 110 },
    { id: 'rep3', name: 'Rep-3', position: { x: 500, y: 120 }, type: 'repeater', status: 'idle', memoryTime: 45, fidelity: 0.82, range: 130 }
  ]);

  const [networkPaths, setNetworkPaths] = useState<NetworkPath[]>([]);
  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    totalRepeaters: 3,
    averageDistance: 0,
    networkEfficiency: 0,
    fidelityLoss: 0,
    memoryRequirement: 0
  });

  const getNodeColor = (node: RepeaterNode) => {
    if (node.isOptimal) return '#22c55e';
    switch (node.status) {
      case 'active': return '#3b82f6';
      case 'entangled': return '#8b5cf6';
      case 'error': return '#ef4444';
      default: return node.type === 'source' ? '#f59e0b' : node.type === 'destination' ? '#06b6d4' : '#6b7280';
    }
  };

  const calculateDistance = (node1: RepeaterNode, node2: RepeaterNode) => {
    return Math.sqrt(Math.pow(node2.position.x - node1.position.x, 2) + Math.pow(node2.position.y - node1.position.y, 2));
  };

  const findOptimalPath = (algorithm: string) => {
    const source = nodes.find(n => n.type === 'source');
    const destination = nodes.find(n => n.type === 'destination');
    const repeaters = nodes.filter(n => n.type === 'repeater');
    
    if (!source || !destination) return [];

    let bestPath: NetworkPath = {
      id: 'optimal',
      nodes: [source.id, destination.id],
      totalDistance: calculateDistance(source, destination),
      averageFidelity: 0.5,
      latency: 1000,
      isOptimal: true
    };

    // Implement optimization algorithms
    switch (algorithm) {
      case 'genetic':
        bestPath = geneticAlgorithmOptimization(source, destination, repeaters);
        break;
      case 'simulated_annealing':
        bestPath = simulatedAnnealingOptimization(source, destination, repeaters);
        break;
      case 'greedy':
        bestPath = greedyOptimization(source, destination, repeaters);
        break;
    }

    return [bestPath];
  };

  const geneticAlgorithmOptimization = (source: RepeaterNode, destination: RepeaterNode, repeaters: RepeaterNode[]): NetworkPath => {
    // Simplified genetic algorithm implementation
    const populations = 50;
    const generations = 20;
    
    let bestFitness = 0;
    let bestPath = [source.id, destination.id];
    
    for (let gen = 0; gen < generations; gen++) {
      // Generate random paths and evaluate fitness
      const availableRepeaters = repeaters.filter(r => {
        const distToSource = calculateDistance(source, r);
        const distToDest = calculateDistance(r, destination);
        return distToSource <= source.range && distToDest <= destination.range;
      });
      
      if (availableRepeaters.length > 0) {
        const selectedRepeater = availableRepeaters[Math.floor(Math.random() * availableRepeaters.length)];
        const pathFidelity = source.fidelity * selectedRepeater.fidelity * destination.fidelity;
        
        if (pathFidelity > bestFitness) {
          bestFitness = pathFidelity;
          bestPath = [source.id, selectedRepeater.id, destination.id];
        }
      }
    }
    
    const totalDistance = calculatePathDistance(bestPath);
    return {
      id: 'genetic-optimal',
      nodes: bestPath,
      totalDistance,
      averageFidelity: bestFitness,
      latency: totalDistance * 0.5,
      isOptimal: true
    };
  };

  const simulatedAnnealingOptimization = (source: RepeaterNode, destination: RepeaterNode, repeaters: RepeaterNode[]): NetworkPath => {
    // Simplified simulated annealing
    let currentPath = [source.id, destination.id];
    let currentCost = calculatePathDistance(currentPath);
    let temperature = 1000;
    
    for (let i = 0; i < 1000; i++) {
      const newPath = generateNeighborPath(currentPath, repeaters);
      const newCost = calculatePathDistance(newPath);
      
      if (newCost < currentCost || Math.random() < Math.exp(-(newCost - currentCost) / temperature)) {
        currentPath = newPath;
        currentCost = newCost;
      }
      
      temperature *= 0.995;
    }
    
    return {
      id: 'sa-optimal',
      nodes: currentPath,
      totalDistance: currentCost,
      averageFidelity: calculatePathFidelity(currentPath),
      latency: currentCost * 0.4,
      isOptimal: true
    };
  };

  const greedyOptimization = (source: RepeaterNode, destination: RepeaterNode, repeaters: RepeaterNode[]): NetworkPath => {
    const path = [source.id];
    let currentNode = source;
    
    while (currentNode.id !== destination.id) {
      const reachableNodes = [...repeaters, destination].filter(node => {
        const distance = calculateDistance(currentNode, node);
        return distance <= currentNode.range && !path.includes(node.id);
      });
      
      if (reachableNodes.length === 0) break;
      
      // Choose node with best fidelity-to-distance ratio
      const bestNode = reachableNodes.reduce((best, node) => {
        const distance = calculateDistance(currentNode, node);
        const score = node.fidelity / distance;
        const bestScore = best.fidelity / calculateDistance(currentNode, best);
        return score > bestScore ? node : best;
      });
      
      path.push(bestNode.id);
      currentNode = bestNode;
    }
    
    const totalDistance = calculatePathDistance(path);
    return {
      id: 'greedy-optimal',
      nodes: path,
      totalDistance,
      averageFidelity: calculatePathFidelity(path),
      latency: totalDistance * 0.6,
      isOptimal: true
    };
  };

  const generateNeighborPath = (path: string[], repeaters: RepeaterNode[]): string[] => {
    const newPath = [...path];
    if (repeaters.length > 0 && Math.random() > 0.5) {
      const randomRepeater = repeaters[Math.floor(Math.random() * repeaters.length)];
      if (!newPath.includes(randomRepeater.id)) {
        newPath.splice(-1, 0, randomRepeater.id);
      }
    }
    return newPath;
  };

  const calculatePathDistance = (path: string[]): number => {
    let totalDistance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const node1 = nodes.find(n => n.id === path[i]);
      const node2 = nodes.find(n => n.id === path[i + 1]);
      if (node1 && node2) {
        totalDistance += calculateDistance(node1, node2);
      }
    }
    return totalDistance;
  };

  const calculatePathFidelity = (path: string[]): number => {
    let totalFidelity = 1;
    path.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) totalFidelity *= node.fidelity;
    });
    return totalFidelity;
  };

  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw optimal path if exists
    if (showOptimalPath && networkPaths.length > 0) {
      const optimalPath = networkPaths[0];
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      
      for (let i = 0; i < optimalPath.nodes.length - 1; i++) {
        const node1 = nodes.find(n => n.id === optimalPath.nodes[i]);
        const node2 = nodes.find(n => n.id === optimalPath.nodes[i + 1]);
        
        if (node1 && node2) {
          ctx.beginPath();
          ctx.moveTo(node1.position.x, node1.position.y);
          ctx.lineTo(node2.position.x, node2.position.y);
          ctx.stroke();
        }
      }
    }

    // Draw range circles for repeaters
    nodes.forEach(node => {
      if (node.type === 'repeater') {
        ctx.strokeStyle = getNodeColor(node) + '20';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(node.position.x, node.position.y, node.range, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      const { x, y } = node.position;
      
      ctx.fillStyle = getNodeColor(node);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      
      if (node.type === 'repeater') {
        ctx.fillRect(x - 12, y - 12, 24, 24);
        ctx.strokeRect(x - 12, y - 12, 24, 24);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, x, y - 25);
      
      // Fidelity display
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(`F: ${node.fidelity.toFixed(2)}`, x, y + 30);
      
      // Memory time for repeaters
      if (node.type === 'repeater') {
        ctx.fillText(`M: ${node.memoryTime}ms`, x, y + 40);
      }
    });
  };

  const startOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    
    // Simulate optimization process
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        const newProgress = prev + 5;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Calculate optimal paths
          const optimalPaths = findOptimalPath(selectedAlgorithm);
          setNetworkPaths(optimalPaths);
          
          // Mark optimal nodes
          if (optimalPaths.length > 0) {
            setNodes(prev => prev.map(node => ({
              ...node,
              isOptimal: optimalPaths[0].nodes.includes(node.id),
              status: optimalPaths[0].nodes.includes(node.id) ? 'active' : 'idle'
            })));
          }
          
          // Update metrics
          const optimalPath = optimalPaths[0];
          setMetrics({
            totalRepeaters: optimalPath.nodes.length - 2,
            averageDistance: optimalPath.totalDistance / (optimalPath.nodes.length - 1),
            networkEfficiency: optimalPath.averageFidelity * 100,
            fidelityLoss: (1 - optimalPath.averageFidelity) * 100,
            memoryRequirement: optimalPath.nodes.length * 50
          });
          
          setShowOptimalPath(true);
          setIsOptimizing(false);
          
          toast({
            title: "Optimizare completă!",
            description: `Algoritm: ${selectedAlgorithm.toUpperCase()}, Fidelitate: ${(optimalPath.averageFidelity * 100).toFixed(1)}%`,
          });
        }
        
        return newProgress;
      });
    }, 200);
  };

  const resetOptimization = () => {
    setIsOptimizing(false);
    setOptimizationProgress(0);
    setShowOptimalPath(false);
    setNetworkPaths([]);
    setNodes(prev => prev.map(node => ({ ...node, isOptimal: false, status: 'idle' })));
    setMetrics({
      totalRepeaters: 3,
      averageDistance: 0,
      networkEfficiency: 0,
      fidelityLoss: 0,
      memoryRequirement: 0
    });
  };

  useEffect(() => {
    drawNetwork();
  }, [nodes, showOptimalPath, networkPaths]);

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-green-400" />
            <CardTitle className="text-white">Optimizator Rețea Quantum Repeater</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={startOptimization}
              disabled={isOptimizing}
              className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
            >
              <Play className="w-4 h-4 mr-1" />
              Optimizează
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetOptimization}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="optimization" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="optimization">Optimizare</TabsTrigger>
            <TabsTrigger value="analysis">Analiză</TabsTrigger>
            <TabsTrigger value="algorithms">Algoritmi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="optimization" className="mt-6">
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
                
                {/* Optimization Progress */}
                {isOptimizing && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Progress Optimizare</span>
                      <span className="text-green-400">{optimizationProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={optimizationProgress} className="h-2" />
                  </div>
                )}
              </div>
              
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Algoritm Optimizare
                  </label>
                  <select
                    value={selectedAlgorithm}
                    onChange={(e) => setSelectedAlgorithm(e.target.value as any)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isOptimizing}
                  >
                    <option value="genetic">Algoritm Genetic</option>
                    <option value="simulated_annealing">Simulated Annealing</option>
                    <option value="greedy">Greedy Heuristic</option>
                  </select>
                </div>
                
                {/* Network Metrics */}
                <div className="bg-white/5 border border-white/20 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-3">Metrici Rețea</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Repeaters Totali:</span>
                      <span className="text-cyan-400">{metrics.totalRepeaters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distanța Medie:</span>
                      <span className="text-blue-400">{metrics.averageDistance.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Eficiență Rețea:</span>
                      <span className="text-green-400">{metrics.networkEfficiency.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pierdere Fidelitate:</span>
                      <span className="text-red-400">{metrics.fidelityLoss.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Node Status */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Status Noduri</h4>
                  {nodes.map(node => (
                    <div key={node.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{node.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            node.isOptimal ? 'border-green-500/30 text-green-400' :
                            node.status === 'active' ? 'border-blue-500/30 text-blue-400' :
                            'border-gray-500/30 text-gray-400'
                          }`}
                        >
                          {node.isOptimal ? 'Optimal' : node.status}
                        </Badge>
                        <span className="text-xs text-gray-500">F: {node.fidelity.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Eficiență Rețea</h4>
                <div className="text-2xl text-green-400 font-bold">{metrics.networkEfficiency.toFixed(1)}%</div>
                <Progress value={metrics.networkEfficiency} className="mt-2" />
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Pierdere Fidelitate</h4>
                <div className="text-2xl text-red-400 font-bold">{metrics.fidelityLoss.toFixed(1)}%</div>
                <Progress value={100 - metrics.fidelityLoss} className="mt-2" />
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Repeaters Necesari</h4>
                <div className="text-2xl text-cyan-400 font-bold">{metrics.totalRepeaters}</div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Memorie Totală</h4>
                <div className="text-2xl text-purple-400 font-bold">{metrics.memoryRequirement}ms</div>
              </div>
            </div>
            
            {/* Optimal Path Info */}
            {networkPaths.length > 0 && (
              <div className="mt-6 bg-white/5 border border-white/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Calea Optimală</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Noduri:</span>
                    <div className="flex gap-1">
                      {networkPaths[0].nodes.map((nodeId, index) => (
                        <React.Fragment key={nodeId}>
                          <span className="text-green-400">{nodes.find(n => n.id === nodeId)?.name}</span>
                          {index < networkPaths[0].nodes.length - 1 && (
                            <span className="text-gray-500">→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Distanța Totală:</span>
                    <span className="text-cyan-400">{networkPaths[0].totalDistance.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Fidelitate Medie:</span>
                    <span className="text-green-400">{(networkPaths[0].averageFidelity * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Latență:</span>
                    <span className="text-purple-400">{networkPaths[0].latency.toFixed(1)}ms</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="algorithms" className="mt-6">
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <h4 className="text-white font-medium">Algoritm Genetic</h4>
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  Folosește principiile evoluției pentru a găsi configurația optimală de repeaters prin 
                  selecție, crossover și mutație.
                </p>
                <div className="text-xs text-gray-400">
                  Complexitate: O(n²), Timp: Mediu, Calitate: Foarte Bună
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  <h4 className="text-white font-medium">Simulated Annealing</h4>
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  Inspirat din procesul de răcire controlată a metalelor, explorează spațiul de soluții 
                  acceptând uneori soluții mai slabe pentru a evita minimele locale.
                </p>
                <div className="text-xs text-gray-400">
                  Complexitate: O(n log n), Timp: Rapid, Calitate: Bună
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <h4 className="text-white font-medium">Greedy Heuristic</h4>
                </div>
                <p className="text-gray-300 text-sm mb-2">
                  Alege întotdeauna următorul repeater care oferă cel mai bun raport fidelitate/distanță, 
                  construind calea pas cu pas.
                </p>
                <div className="text-xs text-gray-400">
                  Complexitate: O(n), Timp: Foarte Rapid, Calitate: Moderată
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
