
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Atom, 
  Bot, 
  Wifi, 
  Thermometer, 
  Droplets, 
  Gauge, 
  Activity,
  Microchip,
  Terminal,
  TrendingUp,
  Zap,
  Brain,
  Send,
  Info,
  BarChart3,
  Shield,
  Lock
} from 'lucide-react';
import { QuantumCircuit } from '@/components/QuantumCircuit';
import { SensorDashboard } from '@/components/SensorDashboard';
import { ChatInterface } from '@/components/ChatInterface';
import { SystemMetrics } from '@/components/SystemMetrics';
import { QuantumAlgorithms } from '@/components/QuantumAlgorithms';
import { QuantumCryptography } from '@/components/QuantumCryptography';
import { QuantumML } from '@/components/QuantumML';

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
    { time: '12:34:56', message: 'Sistem cuantic inițializat cu succes', type: 'success' },
    { time: '12:35:02', message: 'Conectare gateway IoT stabilită', type: 'info' },
    { time: '12:35:15', message: 'Calibrare senzori în progres...', type: 'warning' },
    { time: '12:35:23', message: 'Toate senzorii operaționali', type: 'success' },
    { time: '12:35:45', message: 'Simulare cuantică activă - 4 qubits', type: 'info' }
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
        type: Math.random() > 0.7 ? 'warning' : 'success'
      };
      
      setSystemLogs(prev => [...prev.slice(-4), newLog]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Quantum particles background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Atom className="w-12 h-12 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Chatbot Cuantic Român
            </h1>
          </div>
          <p className="text-xl text-blue-200 mb-2">Inteligență Artificială Cuantică cu Monitorizare IoT</p>
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            <Zap className="w-4 h-4 mr-1" />
            Sistem Activ
          </Badge>
        </header>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>

          {/* System Status */}
          <div className="space-y-6">
            <SystemMetrics metrics={quantumMetrics} />
            
            {/* Connection Status */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wifi className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Conectivitate IoT</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">Gateway Principal</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">Senzori Ambientali</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-300">Senzori Industriali</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* IoT Sensors Dashboard */}
        <SensorDashboard sensorData={sensorData} />

        {/* Enhanced Quantum Computing Section */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Quantum Algorithms */}
          <QuantumAlgorithms />
          
          {/* Quantum Machine Learning */}
          <QuantumML />
          
          {/* Quantum Cryptography */}
          <QuantumCryptography />
        </div>

        {/* Quantum Circuit Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <QuantumCircuit />
          
          {/* Real-time Analytics */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <h3 className="text-2xl font-bold text-white">Analiză în Timp Real</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-black/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Metrici Cuantice</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Coerență:</span>
                    <span className="text-cyan-400 font-bold">{quantumMetrics.coherence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Entanglement:</span>
                    <span className="text-purple-400 font-bold">{quantumMetrics.entanglement}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Fidelitate:</span>
                    <span className="text-green-400 font-bold">91.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Algoritmi Activi:</span>
                    <span className="text-yellow-400 font-bold">5</span>
                  </div>
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Status Senzori</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-green-500/20 rounded">
                    <div className="text-green-400 font-bold">12</div>
                    <div className="text-gray-300">Activi</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-500/20 rounded">
                    <div className="text-yellow-400 font-bold">3</div>
                    <div className="text-gray-300">Standby</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Securitate Cuantică</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Protocoale:</span>
                    <span className="text-green-400 font-bold">BB84, E91, SARG04</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Chei Generate:</span>
                    <span className="text-cyan-400 font-bold">1,247</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* System Logs */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-6 h-6 text-gray-400" />
            <h3 className="text-2xl font-bold text-white">Jurnal Sistem</h3>
          </div>
          <div className="bg-black/50 rounded-lg p-4 h-32 overflow-y-auto">
            <div className="font-mono text-sm space-y-1">
              {systemLogs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    log.type === 'error' ? 'text-red-400' :
                    'text-blue-400'
                  }`}
                >
                  [{log.time}] {log.message}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Footer */}
        <footer className="text-center text-gray-400">
          <p>&copy; 2024 Chatbot Cuantic Român. Tehnologie avansată pentru viitorul cuantic.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
