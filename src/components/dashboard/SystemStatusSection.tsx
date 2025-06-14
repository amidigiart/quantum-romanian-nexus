
import React from 'react';
import { SystemMetrics } from '@/components/SystemMetrics';
import { QuantumStatus } from '@/components/QuantumStatus';
import { ConnectivityStatus } from '@/components/ConnectivityStatus';

interface SystemStatusSectionProps {
  quantumMetrics: {
    activeQubits: number;
    coherence: number;
    entanglement: number;
  };
}

export const SystemStatusSection: React.FC<SystemStatusSectionProps> = ({ quantumMetrics }) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <SystemMetrics metrics={quantumMetrics} />
      <QuantumStatus metrics={quantumMetrics} />
      <ConnectivityStatus />
    </div>
  );
};
