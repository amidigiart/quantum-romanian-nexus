
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Route, 
  Play, 
  Pause, 
  RotateCcw
} from 'lucide-react';

import { NetworkVisualization } from './multi-hop/NetworkVisualization';
import { NodeStatus } from './multi-hop/NodeStatus';
import { RouteManager } from './multi-hop/RouteManager';
import { OptimizationControls } from './multi-hop/OptimizationControls';
import { NetworkMetricsDisplay } from './multi-hop/NetworkMetricsDisplay';
import { useMultiHopSimulation } from './multi-hop/useMultiHopSimulation';

export const MultiHopQuantumCommunication = () => {
  const {
    isRunning,
    selectedRoute,
    animationTime,
    transmissionProgress,
    nodes,
    links,
    routes,
    metrics,
    animationRef,
    setSelectedRoute,
    setAnimationTime,
    startCommunication,
    stopCommunication,
    resetSimulation
  } = useMultiHopSimulation();

  const [errorCorrectionEnabled, setErrorCorrectionEnabled] = useState(true);
  const [swappingEfficiency, setSwappingEfficiency] = useState([0.85]);

  // Animation loop
  const animate = () => {
    setAnimationTime(prev => prev + 1);
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

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
                <NetworkVisualization
                  nodes={nodes}
                  links={links}
                  selectedRoute={selectedRoute}
                  routes={routes}
                  isRunning={isRunning}
                  animationTime={animationTime}
                />
                
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
                <NodeStatus nodes={nodes} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="routes" className="mt-6">
            <RouteManager
              routes={routes}
              nodes={nodes}
              selectedRoute={selectedRoute}
              onSelectRoute={setSelectedRoute}
            />
          </TabsContent>
          
          <TabsContent value="optimization" className="mt-6">
            <OptimizationControls
              errorCorrectionEnabled={errorCorrectionEnabled}
              swappingEfficiency={swappingEfficiency}
              onToggleErrorCorrection={() => setErrorCorrectionEnabled(!errorCorrectionEnabled)}
              onSwappingEfficiencyChange={setSwappingEfficiency}
            />
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-6">
            <NetworkMetricsDisplay metrics={metrics} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
