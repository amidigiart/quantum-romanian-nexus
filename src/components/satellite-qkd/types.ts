
export interface SatelliteNode {
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

export interface QKDSession {
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

export interface OrbitData {
  angle: number;
  visibility: boolean;
  distance: number;
  signal_strength: number;
}
