
import React from 'react';
import { QuantumErrorCorrection } from '@/components/QuantumErrorCorrection';
import { QuantumSupremacyBenchmarks } from '@/components/QuantumSupremacyBenchmarks';
import { FinancialQuantumOptimizer } from '@/components/FinancialQuantumOptimizer';
import { QuantumWeatherPrediction } from '@/components/QuantumWeatherPrediction';
import { QuantumInternetSimulator } from '@/components/QuantumInternetSimulator';
import { QuantumChemistryLab } from '@/components/QuantumChemistryLab';
import { QuantumNewsFeed } from '@/components/QuantumNewsFeed';
import { QuantumAlgorithms } from '@/components/QuantumAlgorithms';
import { QuantumML } from '@/components/QuantumML';
import { QuantumCryptography } from '@/components/QuantumCryptography';

export const QuantumFeaturesSection: React.FC = () => {
  return (
    <>
      {/* Quantum Error Correction Breakthroughs */}
      <div className="mb-8">
        <QuantumErrorCorrection />
      </div>

      {/* Quantum Supremacy Benchmarks */}
      <div className="mb-8">
        <QuantumSupremacyBenchmarks />
      </div>

      {/* Financial Quantum Optimizer */}
      <div className="mb-8">
        <FinancialQuantumOptimizer />
      </div>

      {/* Quantum Weather Prediction */}
      <div className="mb-8">
        <QuantumWeatherPrediction />
      </div>

      {/* Quantum Internet Simulator */}
      <div className="mb-8">
        <QuantumInternetSimulator />
      </div>

      {/* Quantum Chemistry Lab */}
      <div className="mb-8">
        <QuantumChemistryLab />
      </div>

      {/* Quantum News Feed */}
      <div className="mb-8">
        <QuantumNewsFeed />
      </div>

      {/* Enhanced Quantum Computing Section */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <QuantumAlgorithms />
        <QuantumML />
        <QuantumCryptography />
      </div>
    </>
  );
};
