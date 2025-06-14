
import { useState, useRef, useCallback } from 'react';
import { QuantumNode, QuantumLink, CommunicationRoute, NetworkMetrics } from './types';
import { useToast } from '@/hooks/use-toast';

export const useMultiHopSimulation = () => {
  const animationRef = useRef<number>();
  const { toast } = useToast();

  const [isRunning, setIsRunning] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [animationTime, setAnimationTime] = useState(0);
  const [transmissionProgress, setTransmissionProgress] = useState(0);

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

  const startCommunication = useCallback(() => {
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
          averageFidelity: route.expectedFidelity * 0.85
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
  }, [selectedRoute, routes, links, toast]);

  const stopCommunication = useCallback(() => {
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
  }, []);

  const resetSimulation = useCallback(() => {
    stopCommunication();
    setSelectedRoute('');
    setMetrics({
      totalNodes: 6,
      activeConnections: 0,
      averageFidelity: 0,
      successfulTransmissions: 0,
      swappingOperations: 0
    });
  }, [stopCommunication]);

  return {
    // State
    isRunning,
    selectedRoute,
    animationTime,
    transmissionProgress,
    nodes,
    links,
    routes,
    metrics,
    animationRef,
    
    // Actions
    setSelectedRoute,
    setAnimationTime,
    startCommunication,
    stopCommunication,
    resetSimulation
  };
};
