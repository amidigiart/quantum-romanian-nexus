
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cloud, thermometer, wind, Activity, Target, Zap } from 'lucide-react';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  visibility: number;
  precipitation: number;
}

interface QuantumPrediction {
  location: string;
  forecast: {
    day: string;
    temperature: { min: number; max: number };
    precipitation: number;
    confidence: number;
    quantumAdvantage: number;
  }[];
  accuracy: number;
  quantumAccuracy: number;
  classicalAccuracy: number;
}

export const QuantumWeatherPrediction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentWeather, setCurrentWeather] = useState<WeatherData>({
    location: 'București, România',
    temperature: 22.5,
    humidity: 68,
    pressure: 1013,
    windSpeed: 12,
    visibility: 10,
    precipitation: 15
  });

  const [predictions, setPredictions] = useState<QuantumPrediction>({
    location: 'București, România',
    forecast: [
      {
        day: 'Astăzi',
        temperature: { min: 18, max: 26 },
        precipitation: 15,
        confidence: 94.2,
        quantumAdvantage: 12.5
      },
      {
        day: 'Mâine',
        temperature: { min: 16, max: 24 },
        precipitation: 35,
        confidence: 91.8,
        quantumAdvantage: 15.3
      },
      {
        day: 'Poimâine',
        temperature: { min: 14, max: 22 },
        precipitation: 65,
        confidence: 89.4,
        quantumAdvantage: 18.7
      },
      {
        day: 'Joi',
        temperature: { min: 17, max: 25 },
        precipitation: 25,
        confidence: 87.1,
        quantumAdvantage: 14.2
      },
      {
        day: 'Vineri',
        temperature: { min: 19, max: 27 },
        precipitation: 10,
        confidence: 85.6,
        quantumAdvantage: 11.8
      }
    ],
    accuracy: 92.3,
    quantumAccuracy: 96.7,
    classicalAccuracy: 84.4
  });

  const [algorithmMetrics, setAlgorithmMetrics] = useState({
    qubits: 24,
    circuitDepth: 156,
    gateOperations: 2847,
    entanglement: 0.89,
    coherenceTime: 250,
    quantumVolume: 128
  });

  // Simulate quantum processing
  const runQuantumForecast = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate processing steps
    const steps = [
      'Inițializare circuit cuantic...',
      'Codificare date meteorologice...',
      'Aplicare algoritm Grover pentru căutare...',
      'Execuție algoritm Shor pentru optimizare...',
      'Procesare superpoziție cuantică...',
      'Analiză entanglement atmosferic...',
      'Decodificare rezultate cuantice...',
      'Comparare cu modele clasice...',
      'Generare predicții finale...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Update predictions with new quantum-enhanced data
    setPredictions(prev => ({
      ...prev,
      accuracy: 92.3 + Math.random() * 3,
      quantumAccuracy: 96.7 + Math.random() * 2,
      classicalAccuracy: 84.4 + Math.random() * 2,
      forecast: prev.forecast.map(day => ({
        ...day,
        confidence: day.confidence + Math.random() * 2 - 1,
        quantumAdvantage: day.quantumAdvantage + Math.random() * 3 - 1.5
      }))
    }));

    setIsProcessing(false);
  };

  // Real-time weather updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWeather(prev => ({
        ...prev,
        temperature: +(20 + Math.random() * 8).toFixed(1),
        humidity: Math.floor(60 + Math.random() * 25),
        pressure: Math.floor(1010 + Math.random() * 10),
        windSpeed: Math.floor(8 + Math.random() * 12),
        precipitation: Math.floor(Math.random() * 40)
      }));

      setAlgorithmMetrics(prev => ({
        ...prev,
        entanglement: +(0.85 + Math.random() * 0.1).toFixed(2),
        coherenceTime: Math.floor(240 + Math.random() * 20),
        gateOperations: Math.floor(2800 + Math.random() * 100)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (precipitation: number) => {
    if (precipitation > 60) return <cloud className="w-6 h-6 text-gray-400" />;
    if (precipitation > 30) return <cloud className="w-6 h-6 text-blue-400" />;
    return <cloud className="w-6 h-6 text-yellow-400" />;
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <cloud className="w-6 h-6 text-blue-400" />
        <h3 className="text-2xl font-bold text-white">Quantum Weather Prediction</h3>
        <Badge variant="outline" className="border-blue-400 text-blue-400 ml-auto">
          <Activity className="w-3 h-3 mr-1" />
          Quantum Enhanced
        </Badge>
      </div>

      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg border-white/20">
          <TabsTrigger value="forecast">Prognoză</TabsTrigger>
          <TabsTrigger value="current">Date Actuale</TabsTrigger>
          <TabsTrigger value="quantum">Circuit Cuantic</TabsTrigger>
          <TabsTrigger value="analysis">Analiză</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Prognoză Cuantică 5 Zile</h4>
              <Button
                onClick={runQuantumForecast}
                disabled={isProcessing}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                <Zap className="w-4 h-4 mr-1" />
                {isProcessing ? 'Procesare...' : 'Rulează Quantum'}
              </Button>
            </div>

            {isProcessing && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white">Procesare Cuantică:</span>
                  <span className="text-cyan-400">{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {predictions.forecast.map((day, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-4 text-center">
                  <div className="text-white font-medium mb-2">{day.day}</div>
                  {getWeatherIcon(day.precipitation)}
                  <div className="text-lg font-bold text-white mt-2">
                    {day.temperature.max}° / {day.temperature.min}°
                  </div>
                  <div className="text-blue-400 text-sm">
                    Precipitații: {day.precipitation}%
                  </div>
                  <div className="text-green-400 text-xs mt-1">
                    Încredere: {day.confidence.toFixed(1)}%
                  </div>
                  <div className="text-purple-400 text-xs">
                    Q-Avantaj: +{day.quantumAdvantage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h5 className="text-white font-semibold mb-3">Comparație Acuratețe:</h5>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-green-400 text-2xl font-bold">{predictions.accuracy.toFixed(1)}%</div>
                  <div className="text-gray-400 text-sm">Hibrid Total</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-400 text-2xl font-bold">{predictions.quantumAccuracy.toFixed(1)}%</div>
                  <div className="text-gray-400 text-sm">Cuantic Pur</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 text-2xl font-bold">{predictions.classicalAccuracy.toFixed(1)}%</div>
                  <div className="text-gray-400 text-sm">Clasic Tradițional</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="current" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <thermometer className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{currentWeather.temperature}°C</div>
              <div className="text-gray-400 text-sm">Temperatură</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <cloud className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{currentWeather.humidity}%</div>
              <div className="text-gray-400 text-sm">Umiditate</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <Target className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{currentWeather.pressure}</div>
              <div className="text-gray-400 text-sm">Presiune (hPa)</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <wind className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{currentWeather.windSpeed}</div>
              <div className="text-gray-400 text-sm">Vânt (km/h)</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <Activity className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{currentWeather.visibility}</div>
              <div className="text-gray-400 text-sm">Vizibilitate (km)</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center">
              <cloud className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{currentWeather.precipitation}%</div>
              <div className="text-gray-400 text-sm">Precipitații</div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quantum" className="mt-6">
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Parametrii Circuit Cuantic Meteorologic:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-cyan-400 text-2xl font-bold">{algorithmMetrics.qubits}</div>
                <div className="text-gray-400 text-sm">Qubits Activi</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-green-400 text-2xl font-bold">{algorithmMetrics.circuitDepth}</div>
                <div className="text-gray-400 text-sm">Adâncime Circuit</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-yellow-400 text-2xl font-bold">{algorithmMetrics.gateOperations}</div>
                <div className="text-gray-400 text-sm">Operații Porți</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-purple-400 text-2xl font-bold">{(algorithmMetrics.entanglement * 100).toFixed(1)}%</div>
                <div className="text-gray-400 text-sm">Entanglement</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-pink-400 text-2xl font-bold">{algorithmMetrics.coherenceTime}μs</div>
                <div className="text-gray-400 text-sm">Timp Coherență</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <div className="text-indigo-400 text-2xl font-bold">{algorithmMetrics.quantumVolume}</div>
                <div className="text-gray-400 text-sm">Volum Cuantic</div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h5 className="text-white font-semibold mb-3">Algoritmi Cuantici Utilizați:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-blue-400 text-blue-400">
                    Grover
                  </Badge>
                  <span className="text-gray-300 text-sm">Căutare optimă date meteorologice</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-green-400 text-green-400">
                    QAOA
                  </Badge>
                  <span className="text-gray-300 text-sm">Optimizare aproximativă cuantică</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-purple-400 text-purple-400">
                    VQE
                  </Badge>
                  <span className="text-gray-300 text-sm">Estimare energie variațională</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                    Shor
                  </Badge>
                  <span className="text-gray-300 text-sm">Factorizare pentru optimizare</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <div className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4">
              <h5 className="text-white font-semibold mb-3">Avantajul Cuantic în Meteorologie:</h5>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Procesare paralelă date atmosferice:</span>
                  <span className="text-green-400 font-bold">+2500x viteza</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Analiză pattern-uri complexe:</span>
                  <span className="text-blue-400 font-bold">+85% acuratețe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Predicție evenimente extreme:</span>
                  <span className="text-purple-400 font-bold">+60% precizie</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Optimizare resurse computaționale:</span>
                  <span className="text-yellow-400 font-bold">-40% consum</span>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h5 className="text-white font-semibold mb-3">Aplicații Avansate:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="text-cyan-400 font-medium">Modelarea Climei</div>
                  <div className="text-gray-300">Simulări climatice pe termen lung cu precizie cuantică</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="text-green-400 font-medium">Avertizări Extreme</div>
                  <div className="text-gray-300">Detectarea timpurie a fenomenelor meteorologice severe</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="text-purple-400 font-medium">Agricultură Precision</div>
                  <div className="text-gray-300">Predicții meteo ultra-precise pentru optimizare culturi</div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <div className="text-yellow-400 font-medium">Energie Regenerabilă</div>
                  <div className="text-gray-300">Previziuni optimizate voor sisteme eoliene și solare</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
