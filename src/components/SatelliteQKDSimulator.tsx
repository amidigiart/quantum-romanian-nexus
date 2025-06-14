
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Satellite, Globe } from 'lucide-react';
import { SatelliteCanvas } from './satellite-qkd/SatelliteCanvas';
import { SatelliteControls } from './satellite-qkd/SatelliteControls';
import { QKDSessionsList } from './satellite-qkd/QKDSessionsList';
import { SatellitesList } from './satellite-qkd/SatellitesList';
import { TelemetryDashboard } from './satellite-qkd/TelemetryDashboard';
import { useSatelliteSimulation } from './satellite-qkd/useSatelliteSimulation';

export const SatelliteQKDSimulator = () => {
  const {
    satellites,
    qkdSessions,
    orbitData,
    isSimulating,
    simulationTime,
    selectedSatellite,
    setSelectedSatellite,
    startSimulation,
    stopSimulation,
    resetSimulation,
    startQKDSession
  } = useSatelliteSimulation();

  const handleSatelliteClick = (satelliteId: string) => {
    setSelectedSatellite(satelliteId === selectedSatellite ? '' : satelliteId);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-white">Simulator QKD Satelitar</CardTitle>
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              <Globe className="w-3 h-3 mr-1" />
              Global Network
            </Badge>
          </div>
          <SatelliteControls
            isSimulating={isSimulating}
            onStartSimulation={startSimulation}
            onStopSimulation={stopSimulation}
            onStartQKDSession={startQKDSession}
            onResetSimulation={resetSimulation}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="network" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="network">Rețea</TabsTrigger>
            <TabsTrigger value="sessions">Sesiuni QKD</TabsTrigger>
            <TabsTrigger value="satellites">Sateliți</TabsTrigger>
            <TabsTrigger value="telemetry">Telemetrie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="network" className="mt-6">
            <SatelliteCanvas
              satellites={satellites}
              selectedSatellite={selectedSatellite}
              simulationTime={simulationTime}
              orbitData={orbitData}
              onSatelliteClick={handleSatelliteClick}
            />
          </TabsContent>
          
          <TabsContent value="sessions" className="mt-6">
            <QKDSessionsList sessions={qkdSessions} satellites={satellites} />
          </TabsContent>
          
          <TabsContent value="satellites" className="mt-6">
            <SatellitesList
              satellites={satellites}
              selectedSatellite={selectedSatellite}
              orbitData={orbitData}
              onSatelliteSelect={setSelectedSatellite}
            />
          </TabsContent>
          
          <TabsContent value="telemetry" className="mt-6">
            <TelemetryDashboard
              satellites={satellites}
              qkdSessions={qkdSessions}
              simulationTime={simulationTime}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
