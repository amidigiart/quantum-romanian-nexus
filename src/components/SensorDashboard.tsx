
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Thermometer, Droplets, Gauge, Activity } from 'lucide-react';

interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  motion: string;
}

interface SensorDashboardProps {
  sensorData: SensorData;
}

export const SensorDashboard: React.FC<SensorDashboardProps> = ({ sensorData }) => {
  const getStatusColor = (value: number, type: string) => {
    switch (type) {
      case 'temperature':
        return value >= 18 && value <= 25 ? 'text-green-400' : 'text-yellow-400';
      case 'humidity':
        return value >= 40 && value <= 70 ? 'text-green-400' : 'text-yellow-400';
      case 'pressure':
        return value >= 1000 && value <= 1020 ? 'text-green-400' : 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const getStatusText = (value: number, type: string) => {
    switch (type) {
      case 'temperature':
        return value >= 18 && value <= 25 ? 'Normal' : 'Monitorizare';
      case 'humidity':
        return value >= 40 && value <= 70 ? 'Optimal' : 'Ajustare';
      case 'pressure':
        return value >= 1000 && value <= 1020 ? 'Stabil' : 'Variabil';
      default:
        return 'Normal';
    }
  };

  const sensors = [
    {
      icon: Thermometer,
      name: 'Temperatură',
      value: `${sensorData.temperature}°C`,
      color: 'text-red-400',
      status: getStatusText(sensorData.temperature, 'temperature'),
      statusColor: getStatusColor(sensorData.temperature, 'temperature')
    },
    {
      icon: Droplets,
      name: 'Umiditate',
      value: `${sensorData.humidity}%`,
      color: 'text-blue-400',
      status: getStatusText(sensorData.humidity, 'humidity'),
      statusColor: getStatusColor(sensorData.humidity, 'humidity')
    },
    {
      icon: Gauge,
      name: 'Presiune',
      value: `${sensorData.pressure} hPa`,
      color: 'text-yellow-400',
      status: getStatusText(sensorData.pressure, 'pressure'),
      statusColor: getStatusColor(sensorData.pressure, 'pressure')
    },
    {
      icon: Activity,
      name: 'Mișcare',
      value: sensorData.motion,
      color: 'text-purple-400',
      status: sensorData.motion === 'Detectată' ? 'Activă' : 'Inactivă',
      statusColor: sensorData.motion === 'Detectată' ? 'text-yellow-400' : 'text-green-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {sensors.map((sensor, index) => (
        <Card
          key={index}
          className="bg-white/10 backdrop-blur-lg border-white/20 p-6 sensor-card hover:scale-105 transition-all duration-300 hover:bg-white/15"
        >
          <div className="flex items-center justify-between mb-4">
            <sensor.icon className={`w-8 h-8 ${sensor.color}`} />
            <span className="text-sm text-gray-300">{sensor.name}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-2">{sensor.value}</div>
          <Badge variant="outline" className={`border-current ${sensor.statusColor}`}>
            {sensor.status}
          </Badge>
          
          {/* Progress indicator */}
          <div className="mt-3 w-full bg-black/30 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                sensor.statusColor.includes('green') ? 'bg-green-400' :
                sensor.statusColor.includes('yellow') ? 'bg-yellow-400' :
                'bg-blue-400'
              }`}
              style={{ 
                width: `${
                  sensor.name === 'Temperatură' ? Math.min((sensorData.temperature / 30) * 100, 100) :
                  sensor.name === 'Umiditate' ? sensorData.humidity :
                  sensor.name === 'Presiune' ? Math.min(((sensorData.pressure - 980) / 60) * 100, 100) :
                  sensorData.motion === 'Detectată' ? 100 : 20
                }%` 
              }}
            />
          </div>
        </Card>
      ))}
    </div>
  );
};
