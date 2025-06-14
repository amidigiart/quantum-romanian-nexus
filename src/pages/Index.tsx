
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { QuantumParticles } from '@/components/QuantumParticles';
import { QuantumStatus } from '@/components/QuantumStatus';
import { ConnectivityStatus } from '@/components/ConnectivityStatus';
import { RealTimeAnalytics } from '@/components/RealTimeAnalytics';
import { SystemLogs } from '@/components/SystemLogs';
import { QuantumCircuit } from '@/components/QuantumCircuit';
import { SensorDashboard } from '@/components/SensorDashboard';
import { ChatInterface } from '@/components/ChatInterface';
import { SystemMetrics } from '@/components/SystemMetrics';
import { QuantumAlgorithms } from '@/components/QuantumAlgorithms';
import { QuantumCryptography } from '@/components/QuantumCryptography';
import { QuantumML } from '@/components/QuantumML';
import { UserProfile } from '@/components/UserProfile';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Index = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 22.3,
    humidity: 65.8,
    pressure: 1013,
    motion: 'Detectată'
  });

  const [quantumMetrics, setQuantumMetrics] = useState({
    activeQubits: 8,
    coherence: 94.7,
    entanglement: 87.2
  });

  const [systemLogs, setSystemLogs] = useState([
    { time: '12:34:56', message: 'Sistem cuantic inițializat cu succes', type: 'success' as const },
    { time: '12:35:02', message: 'Conectare gateway IoT stabilită', type: 'info' as const },
    { time: '12:35:15', message: 'Calibrare senzori în progres...', type: 'warning' as const },
    { time: '12:35:23', message: 'Toate senzorii operaționali', type: 'success' as const },
    { time: '12:35:45', message: 'Simulare cuantică activă - 4 qubits', type: 'info' as const }
  ]);

  // Real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        temperature: +(20 + Math.random() * 10).toFixed(1),
        humidity: +(60 + Math.random() * 20).toFixed(1),
        pressure: Math.round(1010 + Math.random() * 10),
        motion: Math.random() > 0.7 ? 'Detectată' : 'Inactivă'
      }));

      setQuantumMetrics(prev => ({
        activeQubits: Math.floor(6 + Math.random() * 4),
        coherence: +(90 + Math.random() * 10).toFixed(1),
        entanglement: +(80 + Math.random() * 15).toFixed(1)
      }));

      // Add new system log
      const messages = [
        'Sincronizare date cuantice completă',
        'Optimizare algoritmi în progres',
        'Backup date senzori efectuat',
        'Calibrare automată finalizată',
        'Detectare anomalie - rezolvată'
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const newLog = {
        time: new Date().toLocaleTimeString(),
        message: randomMessage,
        type: Math.random() > 0.7 ? 'warning' as const : 'success' as const
      };
      
      setSystemLogs(prev => [...prev.slice(-4), newLog]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <QuantumParticles />

        <div className="container mx-auto px-4 py-6 relative z-10">
          <Header />

          {/* User Profile */}
          <div className="mb-6">
            <UserProfile />
          </div>

          {/* Main Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>

            {/* System Status */}
            <div className="space-y-6">
              <SystemMetrics metrics={quantumMetrics} />
              <QuantumStatus metrics={quantumMetrics} />
              <ConnectivityStatus />
            </div>
          </div>

          {/* IoT Sensors Dashboard */}
          <SensorDashboard sensorData={sensorData} />

          {/* Enhanced Quantum Computing Section */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <QuantumAlgorithms />
            <QuantumML />
            <QuantumCryptography />
          </div>

          {/* Quantum Circuit Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <QuantumCircuit />
            <RealTimeAnalytics quantumMetrics={quantumMetrics} />
          </div>

          {/* System Logs */}
          <SystemLogs logs={systemLogs} />

          {/* Footer */}
          <footer className="text-center text-gray-400">
            <p>&copy; 2024 Chatbot Cuantic Român. Tehnologie avansată pentru viitorul cuantic.</p>
          </footer>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
