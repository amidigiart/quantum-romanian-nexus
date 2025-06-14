
import { useState, useRef, useEffect } from 'react';
import { SatelliteNode, QKDSession, OrbitData } from './types';
import { useToast } from '@/hooks/use-toast';

export const useSatelliteSimulation = () => {
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
        
        setSatellites(prev => prev.map(s => 
          s.id === sat.id 
            ? { ...s, position: { ...s.position, x, y } }
            : s
        ));

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

    setSatellites(prev => prev.map(s => 
      s.id === satellite.id ? { ...s, status: 'transmitting' } : s
    ));

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
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
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
  };
};
