
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Satellite, 
  Globe, 
  Shield, 
  Signal, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Loader
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SatelliteNode {
  id: string;
  name: string;
  type: 'satellite' | 'ground_station';
  position: { x: number; y: number };
  altitude?: number;
  orbital_period?: number;
  coverage_radius: number;
  status: 'active' | 'inactive' | 'transmitting';
  qkd_capacity: number;
}

interface QKDSession {
  id: string;
  from: string;
  to: string;
  startTime: Date;
  duration: number;
  keyRate: number;
  security_level: number;
  atmospheric_loss: number;
  status: 'establishing' | 'active' | 'completed' | 'failed';
}

interface OrbitData {
  angle: number;
  visibility: boolean;
  distance: number;
  signal_strength: number;
}

export const SatelliteQKDSimulator = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationTime, setSimulationTime] = useState(0);
  const [selectedSatellite, setSelectedSatellite] = useState<string>('');
  const { toast } = useToast();

  const [satellites, setSatellites] = useState<SatelliteNode[]>([
    {
      id: 'quantum-sat-1',
      name: 'QuantumSat-1',
      type: 'satellite',
      position: { x: 300, y: 100 },
      altitude: 500,
      orbital_period: 90,
      coverage_radius: 80,
      status: 'active',
      qkd_capacity: 1000
    },
    {
      id: 'quantum-sat-2',
      name: 'QuantumSat-2',
      type: 'satellite',
      position: { x: 400, y: 120 },
      altitude: 600,
      orbital_period: 95,
      coverage_radius: 85,
      status: 'active',
      qkd_capacity: 1200
    },
    {
      id: 'bucharest-gs',
      name: 'București Ground Station',
      type: 'ground_station',
      position: { x: 150, y: 200 },
      coverage_radius: 50,
      status: 'active',
      qkd_capacity: 2000
    },
    {
      id: 'vienna-gs',
      name: 'Vienna Ground Station',
      type: 'ground_station',
      position: { x: 450, y: 180 },
      coverage_radius: 50,
      status: 'active',
      qkd_capacity: 2000
    }
  ]);

  const [qkdSessions, setQkdSessions] = useState<QKDSession[]>([]);
  const [orbitData, setOrbitData] = useState<Record<string, OrbitData>>({});

  // Calculate orbital positions and visibility
  const updateOrbitalMechanics = () => {
    const newOrbitData: Record<string, OrbitData> = {};
    
    satellites.forEach(sat => {
      if (sat.type === 'satellite') {
        const angle = (simulationTime * 2 / (sat.orbital_period || 90)) % (2 * Math.PI);
        const centerX = 300;
        const centerY = 200;
        const radius = sat.altitude ? sat.altitude / 5 : 100;
        
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        // Update satellite position
        setSatellites(prev => prev.map(s => 
          s.id === sat.id 
            ? { ...s, position: { ...s.position, x, y } }
            : s
        ));

        // Calculate visibility and signal strength
        const groundStations = satellites.filter(s => s.type === 'ground_station');
        let maxVisibility = false;
        let maxSignalStrength = 0;
        
        groundStations.forEach(gs => {
          const distance = Math.sqrt(Math.pow(x - gs.position.x, 2) + Math.pow(y - gs.position.y, 2));
          const visibility = distance < sat.coverage_radius + gs.coverage_radius;
          const signalStrength = Math.max(0, 100 - (distance / 3));
          
          if (visibility && signalStrength > maxSignalStrength) {
            maxVisibility = true;
            maxSignalStrength = signalStrength;
          }
        });

        newOrbitData[sat.id] = {
          angle,
          visibility: maxVisibility,
          distance: radius,
          signal_strength: maxSignalStrength
        };
      }
    });
    
    setOrbitData(newOrbitData);
  };

  // Draw the satellite network
  const drawSatelliteNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Earth background
    ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
    ctx.beginPath();
    ctx.arc(300, 200, 80, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw orbital paths
    satellites.forEach(sat => {
      if (sat.type === 'satellite') {
        const radius = sat.altitude ? sat.altitude / 5 : 100;
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(300, 200, radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // Draw coverage areas and connections
    satellites.forEach(sat => {
      const { x, y } = sat.position;
      
      // Draw coverage area
      ctx.fillStyle = sat.type === 'satellite' 
        ? 'rgba(59, 130, 246, 0.1)' 
        : 'rgba(34, 197, 94, 0.1)';
      ctx.beginPath();
      ctx.arc(x, y, sat.coverage_radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw QKD links
      if (sat.status === 'transmitting') {
        satellites.forEach(targetSat => {
          if (targetSat.id !== sat.id) {
            const distance = Math.sqrt(
              Math.pow(x - targetSat.position.x, 2) + 
              Math.pow(y - targetSat.position.y, 2)
            );
            
            if (distance < sat.coverage_radius + targetSat.coverage_radius) {
              ctx.strokeStyle = '#00ff88';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(targetSat.position.x, targetSat.position.y);
              ctx.stroke();
              
              // Animate quantum photons
              const progress = (simulationTime * 0.1) % 1;
              const photonX = x + (targetSat.position.x - x) * progress;
              const photonY = y + (targetSat.position.y - y) * progress;
              
              ctx.fillStyle = '#ffff00';
              ctx.beginPath();
              ctx.arc(photonX, photonY, 3, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
        });
      }
    });

    // Draw nodes
    satellites.forEach(sat => {
      const { x, y } = sat.position;
      
      // Node body
      if (sat.type === 'satellite') {
        ctx.fillStyle = getNodeColor(sat.status);
        ctx.fillRect(x - 8, y - 8, 16, 16);
        
        // Solar panels
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(x - 15, y - 3, 6, 6);
        ctx.fillRect(x + 9, y - 3, 6, 6);
      } else {
        ctx.fillStyle = getNodeColor(sat.status);
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Antenna
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x, y - 25);
        ctx.stroke();
      }
      
      // Node border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sat.name, x, y + 30);
      
      // Status indicator
      if (sat.id === selectedSatellite) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (sat.type === 'satellite') {
          ctx.strokeRect(x - 10, y - 10, 20, 20);
        } else {
          ctx.arc(x, y, 15, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    });
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'transmitting': return '#8b5cf6';
      case 'inactive': return '#64748b';
      default: return '#3b82f6';
    }
  };

  const startQKDSession = () => {
    const activeSatellites = satellites.filter(s => s.status === 'active');
    if (activeSatellites.length < 2) return;

    const satellite = activeSatellites[0];
    const groundStation = satellites.find(s => s.type === 'ground_station' && s.status === 'active');
    
    if (!groundStation) return;

    const newSession: QKDSession = {
      id: `qkd-${Date.now()}`,
      from: satellite.id,
      to: groundStation.id,
      startTime: new Date(),
      duration: 30,
      keyRate: Math.floor(Math.random() * 500) + 100,
      security_level: 0.95 + Math.random() * 0.05,
      atmospheric_loss: Math.random() * 0.1,
      status: 'establishing'
    };

    setQkdSessions(prev => [newSession, ...prev.slice(0, 4)]);

    // Update satellite status
    setSatellites(prev => prev.map(s => 
      s.id === satellite.id ? { ...s, status: 'transmitting' } : s
    ));

    // Simulate session progression
    setTimeout(() => {
      setQkdSessions(prev => prev.map(s => 
        s.id === newSession.id ? { ...s, status: 'active' } : s
      ));
    }, 2000);

    setTimeout(() => {
      setQkdSessions(prev => prev.map(s => 
        s.id === newSession.id ? { ...s, status: 'completed' } : s
      ));
      setSatellites(prev => prev.map(s => 
        s.id === satellite.id ? { ...s, status: 'active' } : s
      ));
    }, 8000);

    toast({
      title: "Sesiune QKD Inițiată",
      description: `Comunicare cuantică prin satelit ${satellite.name}`,
    });
  };

  const animate = () => {
    setSimulationTime(prev => prev + 1);
    updateOrbitalMechanics();
    drawSatelliteNetwork();
    animationRef.current = requestAnimationFrame(animate);
  };

  const startSimulation = () => {
    setIsSimulating(true);
    animationRef.current = requestAnimationFrame(animate);
    toast({
      title: "Simulare Satelit QKD Activată",
      description: "Rețeaua cuantică satelitară este operațională",
    });
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    toast({
      title: "Simulare Oprită",
      description: "Rețeaua satelitară în standby",
    });
  };

  const resetSimulation = () => {
    stopSimulation();
    setSimulationTime(0);
    setQkdSessions([]);
    setSatellites(prev => prev.map(s => ({ ...s, status: 'active' })));
  };

  useEffect(() => {
    drawSatelliteNetwork();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [satellites, selectedSatellite]);

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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={isSimulating ? "destructive" : "default"}
              onClick={isSimulating ? stopSimulation : startSimulation}
              className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30"
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isSimulating ? "Stop" : "Start"}
            </Button>
            <Button
              size="sm"
              onClick={startQKDSession}
              disabled={!isSimulating}
              className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
            >
              <Shield className="w-4 h-4 mr-1" />
              QKD
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
            <TabsTrigger value="sessions">Sesiuni QKD</TabsTrigger>
            <TabsTrigger value="satellites">Sateliți</TabsTrigger>
            <TabsTrigger value="telemetry">Telemetrie</TabsTrigger>
          </TabsList>
          
          <TabsContent value="network" className="mt-6">
            <div className="bg-slate-900/50 border border-white/20 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full h-auto border border-white/20 rounded cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) * (600 / rect.width);
                  const y = (e.clientY - rect.top) * (400 / rect.height);
                  
                  satellites.forEach(sat => {
                    const distance = Math.sqrt(
                      Math.pow(x - sat.position.x, 2) + 
                      Math.pow(y - sat.position.y, 2)
                    );
                    if (distance < 20) {
                      setSelectedSatellite(sat.id === selectedSatellite ? '' : sat.id);
                    }
                  });
                }}
              />
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Activ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-300">Transmite</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Fotoni Cuantici</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-500 rounded"></div>
                <span className="text-gray-300">Link QKD</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sessions" className="mt-6">
            <div className="space-y-3">
              {qkdSessions.length > 0 ? (
                qkdSessions.map((session) => (
                  <div key={session.id} className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium">
                          {satellites.find(s => s.id === session.from)?.name} → 
                          {satellites.find(s => s.id === session.to)?.name}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          session.status === 'active' ? 'border-green-500/30 text-green-400' :
                          session.status === 'establishing' ? 'border-yellow-500/30 text-yellow-400' :
                          session.status === 'completed' ? 'border-blue-500/30 text-blue-400' :
                          'border-red-500/30 text-red-400'
                        }`}
                      >
                        {session.status === 'establishing' && <Loader className="w-3 h-3 mr-1 animate-spin" />}
                        {session.status === 'active' && <Signal className="w-3 h-3 mr-1" />}
                        {session.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {session.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {session.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Key Rate:</span>
                        <div className="text-cyan-400 font-mono">{session.keyRate} bps</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Securitate:</span>
                        <div className="text-green-400 font-mono">{(session.security_level * 100).toFixed(2)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Pierderi:</span>
                        <div className="text-orange-400 font-mono">{(session.atmospheric_loss * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Durată:</span>
                        <div className="text-blue-400 font-mono">{session.duration}s</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nu sunt sesiuni QKD active</p>
                  <p className="text-sm">Apăsați butonul QKD pentru a începe</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="satellites" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {satellites.map((sat) => (
                <div 
                  key={sat.id} 
                  className={`bg-white/5 border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedSatellite === sat.id 
                      ? 'border-yellow-400 bg-yellow-400/10' 
                      : 'border-white/20 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedSatellite(sat.id === selectedSatellite ? '' : sat.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {sat.type === 'satellite' ? 
                        <Satellite className="w-5 h-5 text-blue-400" /> : 
                        <Globe className="w-5 h-5 text-green-400" />
                      }
                      <span className="text-white font-medium">{sat.name}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        sat.status === 'active' ? 'border-green-500/30 text-green-400' :
                        sat.status === 'transmitting' ? 'border-purple-500/30 text-purple-400' :
                        'border-gray-500/30 text-gray-400'
                      }`}
                    >
                      {sat.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tip:</span>
                      <span className="text-gray-300">{sat.type === 'satellite' ? 'Satelit' : 'Stație Sol'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Capacitate QKD:</span>
                      <span className="text-cyan-400 font-mono">{sat.qkd_capacity} bps</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Raza Acoperire:</span>
                      <span className="text-blue-400 font-mono">{sat.coverage_radius} km</span>
                    </div>
                    {sat.type === 'satellite' && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Perioadă Orbitală:</span>
                        <span className="text-purple-400 font-mono">{sat.orbital_period} min</span>
                      </div>
                    )}
                    {orbitData[sat.id] && (
                      <div className="mt-2 pt-2 border-t border-white/20">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vizibilitate:</span>
                          <Badge variant="outline" className={`text-xs ${
                            orbitData[sat.id].visibility 
                              ? 'border-green-500/30 text-green-400'
                              : 'border-red-500/30 text-red-400'
                          }`}>
                            {orbitData[sat.id].visibility ? 'Vizibil' : 'Ascuns'}
                          </Badge>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-400">Putere Semnal:</span>
                          <span className="text-yellow-400 font-mono">
                            {orbitData[sat.id].signal_strength.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="telemetry" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Signal className="w-4 h-4 text-blue-400" />
                  <h4 className="text-white font-medium">Sateliți Activi</h4>
                </div>
                <div className="text-2xl text-blue-400 font-bold">
                  {satellites.filter(s => s.type === 'satellite' && s.status !== 'inactive').length}
                </div>
                <div className="text-xs text-gray-400">din {satellites.filter(s => s.type === 'satellite').length} total</div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <h4 className="text-white font-medium">Sesiuni QKD</h4>
                </div>
                <div className="text-2xl text-green-400 font-bold">
                  {qkdSessions.filter(s => s.status === 'active').length}
                </div>
                <div className="text-xs text-gray-400">active acum</div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <h4 className="text-white font-medium">Timp Simulare</h4>
                </div>
                <div className="text-2xl text-yellow-400 font-bold">
                  {Math.floor(simulationTime / 60)}:{(simulationTime % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-400">minute:secunde</div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-white font-medium">Acoperire Globală</h4>
                </div>
                <Progress 
                  value={Math.min(100, satellites.filter(s => s.status === 'active').length * 25)} 
                  className="mb-2" 
                />
                <div className="text-xs text-gray-400">
                  {Math.min(100, satellites.filter(s => s.status === 'active').length * 25)}% acoperire
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                  <h4 className="text-white font-medium">Sesiuni Finalizate</h4>
                </div>
                <div className="text-2xl text-purple-400 font-bold">
                  {qkdSessions.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-xs text-gray-400">total completate</div>
              </div>
              
              <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <h4 className="text-white font-medium">Rata Succes</h4>
                </div>
                <div className="text-2xl text-orange-400 font-bold">
                  {qkdSessions.length > 0 
                    ? Math.round((qkdSessions.filter(s => s.status === 'completed').length / qkdSessions.length) * 100)
                    : 0}%
                </div>
                <div className="text-xs text-gray-400">comunicații reușite</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
