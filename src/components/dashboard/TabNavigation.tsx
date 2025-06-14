
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPanel } from '@/components/AdminPanel';
import { TeamManager } from '@/components/TeamManager';
import { MainDashboard } from './MainDashboard';

interface TabNavigationProps {
  sensorData: {
    temperature: number;
    humidity: number;
    pressure: number;
    motion: string;
  };
  quantumMetrics: {
    activeQubits: number;
    coherence: number;
    entanglement: number;
  };
  systemLogs: Array<{
    time: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  sensorData,
  quantumMetrics,
  systemLogs
}) => {
  return (
    <div className="mb-8">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border-white/20">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-cyan-500/20">
            Dashboard Principal
          </TabsTrigger>
          <TabsTrigger value="admin" className="data-[state=active]:bg-cyan-500/20">
            Administrare
          </TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-cyan-500/20">
            Echipe
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <MainDashboard 
            sensorData={sensorData}
            quantumMetrics={quantumMetrics}
            systemLogs={systemLogs}
          />
        </TabsContent>
        
        <TabsContent value="admin" className="mt-6">
          <AdminPanel />
        </TabsContent>
        
        <TabsContent value="teams" className="mt-6">
          <TeamManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
