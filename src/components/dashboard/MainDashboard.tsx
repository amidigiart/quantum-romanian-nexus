
import React from 'react';
import { ChatSection } from './ChatSection';
import { SystemStatusSection } from './SystemStatusSection';
import { QuantumFeaturesSection } from './QuantumFeaturesSection';
import { AnalyticsSection } from './AnalyticsSection';
import { SensorDashboard } from '@/components/SensorDashboard';
import { SystemLogs } from '@/components/SystemLogs';

interface MainDashboardProps {
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

export const MainDashboard: React.FC<MainDashboardProps> = ({
  sensorData,
  quantumMetrics,
  systemLogs
}) => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <ChatSection />
        <SystemStatusSection quantumMetrics={quantumMetrics} />
      </div>

      <QuantumFeaturesSection />

      {/* IoT Sensors Dashboard */}
      <SensorDashboard sensorData={sensorData} />

      <AnalyticsSection quantumMetrics={quantumMetrics} />

      {/* System Logs */}
      <SystemLogs logs={systemLogs} />
    </>
  );
};
