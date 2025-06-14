
import React from 'react';
import { QuantumCircuit } from '@/components/QuantumCircuit';
import { RealTimeAnalytics } from '@/components/RealTimeAnalytics';

interface AnalyticsSectionProps {
  quantumMetrics: {
    activeQubits: number;
    coherence: number;
    entanglement: number;
  };
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ quantumMetrics }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <QuantumCircuit />
      <RealTimeAnalytics quantumMetrics={quantumMetrics} />
    </div>
  );
};
