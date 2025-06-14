
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, Zap, Activity, TrendingUp, Shield, Target, Brain, Cpu, Clock } from 'lucide-react';

interface ErrorData {
  timestamp: string;
  physicalErrors: number;
  logicalErrors: number;
  correctionRate: number;
  fidelity: number;
}

interface BreakthroughMetrics {
  willowChipErrors: number;
  ibmLogicalQubits: number;
  correctionLatency: number;
  errorSuppressionRatio: number;
}

export const QuantumErrorCorrection = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [errorData, setErrorData] = useState<ErrorData[]>([]);
  const [realTimeCorrections, setRealTimeCorrections] = useState(0);
  const [metrics, setMetrics] = useState<BreakthroughMetrics>({
    willowChipErrors: 0,
    ibmLogicalQubits: 8,
    correctionLatency: 0.3,
    errorSuppressionRatio: 2.14
  });

  // Simulate real-time error correction
  useEffect(() => {
    const interval = setInterval(() => {
      const newData: ErrorData = {
        timestamp: new Date().toLocaleTimeString(),
        physicalErrors: Math.floor(Math.random() * 100 + 50),
        logicalErrors: Math.floor(Math.random() * 5 + 1),
        correctionRate: +(95 + Math.random() * 4.5).toFixed(1),
        fidelity: +(99.9 - Math.random() * 0.5).toFixed(3)
      };

      setErrorData(prev => [...prev.slice(-9), newData]);
      setRealTimeCorrections(prev => prev + Math.floor(Math.random() * 50 + 10));
      
      setMetrics(prev => ({
        ...prev,
        willowChipErrors: Math.floor(Math.random() * 3),
        correctionLatency: +(0.1 + Math.random() * 0.3).toFixed(2)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Breakthrough data
  const breakthroughs = [
    {
      id: 'willow',
      company: 'Google',
      title: 'Willow Chip Breakthrough',
      description: 'Primul chip cuantic care reduce exponențial erorile cu creșterea numărului de qubits',
      achievements: [
        'Corecție de eroare sub pragul critic',
        'Scalabilitate demonstrată pe grile de 3x3, 5x5, 7x7 qubits',
        'Timpul de coerență îmbunătățit cu 5x',
        'Rata de eroare logică < 10⁻⁶'
      ],
      icon: Shield,
      color: 'text-blue-400 border-blue-400'
    },
    {
      id: 'ibm',
      company: 'IBM',
      title: 'Logical Qubit Implementation',
      description: 'Implementarea primilor qubits logici stabili pentru computația practică',
      achievements: [
        '8 qubits logici operaționali simultan',
        'Timp de coerență > 100ms pentru qubits logici',
        'Algoritmi de corecție adaptivă în timp real',
        'Integrare cu IBM Quantum Network'
      ],
      icon: Cpu,
      color: 'text-green-400 border-green-400'
    },
    {
      id: 'realtime',
      company: 'Industrie',
      title: 'Real-time Error Syndrome Detection',
      description: 'Sisteme de detectare și corecție a erorilor în timp real cu latență ultra-scăzută',
      achievements: [
        'Detectare sindrom eroare în < 1μs',
        'Corecție automată fără întrerupere',
        'ML pentru predicția tipurilor de erori',
        'Eficiență energetică îmbunătățită cu 40%'
      ],
      icon: Activity,
      color: 'text-purple-400 border-purple-400'
    }
  ];

  const correctionMethods = [
    { name: 'Surface Code', efficiency: 94, color: '#8b5cf6' },
    { name: 'Topological', efficiency: 89, color: '#06b6d4' },
    { name: 'Cat Code', efficiency: 87, color: '#10b981' },
    { name: 'Repetition Code', efficiency: 82, color: '#f59e0b' }
  ];

  const runErrorDemo = async (demoType: string) => {
    setActiveDemo(demoType);
    // Simulate error correction demonstration
    await new Promise(resolve => setTimeout(resolve, 3000));
    setActiveDemo(null);
  };

  const chartConfig = {
    physical: {
      label: "Physical Errors",
      color: "#ef4444",
    },
    logical: {
      label: "Logical Errors", 
      color: "#10b981",
    },
    fidelity: {
      label: "Fidelity",
      color: "#8b5cf6",
    },
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-blue-400" />
        <h3 className="text-2xl font-bold text-white">Quantum Error Correction Breakthroughs</h3>
        <Badge variant="outline" className="border-blue-400 text-blue-400 ml-auto">
          <CheckCircle className="w-3 h-3 mr-1" />
          Tehnologii 2024
        </Badge>
      </div>

      <Tabs defaultValue="breakthroughs" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg border-white/20">
          <TabsTrigger value="breakthroughs">Breakthrough-uri</TabsTrigger>
          <TabsTrigger value="realtime">Timp Real</TabsTrigger>
          <TabsTrigger value="analysis">Analiză</TabsTrigger>
          <TabsTrigger value="methods">Metode</TabsTrigger>
        </TabsList>

        <TabsContent value="breakthroughs" className="mt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {breakthroughs.map((breakthrough) => {
                const IconComponent = breakthrough.icon;
                return (
                  <div key={breakthrough.id} className="bg-black/30 rounded-lg p-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-4">
                      <IconComponent className="w-8 h-8 text-cyan-400" />
                      <div>
                        <Badge variant="outline" className="text-xs mb-1">
                          {breakthrough.company}
                        </Badge>
                        <h4 className="text-white font-semibold">{breakthrough.title}</h4>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">{breakthrough.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <h5 className="text-cyan-400 font-medium text-sm">Realizări cheie:</h5>
                      {breakthrough.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-xs">{achievement}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      onClick={() => runErrorDemo(breakthrough.id)}
                      disabled={activeDemo === breakthrough.id}
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/30"
                    >
                      {activeDemo === breakthrough.id ? (
                        <>
                          <Activity className="w-4 h-4 mr-1 animate-spin" />
                          Demonstrație...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-1" />
                          Demo Corecție
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{metrics.willowChipErrors}</div>
                <div className="text-gray-400 text-sm">Erori Willow/sec</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <Cpu className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{metrics.ibmLogicalQubits}</div>
                <div className="text-gray-400 text-sm">Qubits Logici IBM</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{metrics.correctionLatency}μs</div>
                <div className="text-gray-400 text-sm">Latență Corecție</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 text-center">
                <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{metrics.errorSuppressionRatio}</div>
                <div className="text-gray-400 text-sm">Raport Supresie</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-semibold">Monitorizare Corecție Erori în Timp Real</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Live</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Evoluție Erori vs Corecții</h5>
                {errorData.length > 0 && (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={errorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="physicalErrors" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="Erori Fizice"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="logicalErrors" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Erori Logice"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Fidelitate și Rata Corecție</h5>
                {errorData.length > 0 && (
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={errorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="timestamp" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="fidelity" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          name="Fidelitate (%)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="correctionRate" 
                          stroke="#06b6d4" 
                          strokeWidth={2}
                          name="Rata Corecție (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                )}
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-white font-semibold">Corecții în Timp Real</h5>
                <Badge variant="outline" className="border-green-400 text-green-400">
                  <Activity className="w-3 h-3 mr-1" />
                  Activ
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">{realTimeCorrections}</div>
                  <div className="text-gray-400 text-sm">Total Corecții</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    {errorData.length > 0 ? errorData[errorData.length - 1].correctionRate : 0}%
                  </div>
                  <div className="text-gray-400 text-sm">Rata Succes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">
                    {errorData.length > 0 ? errorData[errorData.length - 1].fidelity : 0}%
                  </div>
                  <div className="text-gray-400 text-sm">Fidelitate Cuantică</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <div className="space-y-6">
            <h4 className="text-white font-semibold">Analiză Avansată Error Correction</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Comparație Breakthrough-uri</h5>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Google Willow - Scalabilitate:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95} className="w-20" />
                      <span className="text-blue-400 font-bold">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">IBM Logical - Stabilitate:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={88} className="w-20" />
                      <span className="text-green-400 font-bold">88%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Real-time - Viteză:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20" />
                      <span className="text-purple-400 font-bold">92%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Impact pe Industrie</h5>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="text-blue-400 font-medium">Criptografie Cuantică</div>
                    <div className="text-gray-300">Securitate îmbunătățită prin corecția erorilor</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="text-green-400 font-medium">Simulări Științifice</div>
                    <div className="text-gray-300">Calcule complexe cu precizie înaltă</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <div className="text-purple-400 font-medium">AI și Machine Learning</div>
                    <div className="text-gray-300">Algoritmi quantum ML mai stabili</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h5 className="text-white font-semibold mb-3">Prognoze pentru 2025-2026:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">1000+ qubits logici operaționali</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Rata de eroare sub 10⁻⁹</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Corecție automată ML-driven</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Standardizare protocoale QEC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Integrare cloud quantum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Aplicații comerciale viabile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="mt-6">
          <div className="space-y-6">
            <h4 className="text-white font-semibold">Metode de Corecție a Erorilor</h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Eficiența Metodelor</h5>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={correctionMethods}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="efficiency" fill="#8b5cf6" name="Eficiență %" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <h5 className="text-white font-medium mb-3">Distribuția Metodelor</h5>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={correctionMethods}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="efficiency"
                        label={({ name, efficiency }) => `${name}: ${efficiency}%`}
                      >
                        {correctionMethods.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {correctionMethods.map((method, index) => (
                <div key={index} className="bg-black/30 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-3">
                    <h6 className="text-white font-medium">{method.name}</h6>
                    <Badge variant="outline" style={{ borderColor: method.color, color: method.color }}>
                      {method.efficiency}%
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    {method.name === 'Surface Code' && (
                      <>
                        <p>• Cel mai promițător pentru scalabilitate</p>
                        <p>• Folosit de Google în Willow chip</p>
                        <p>• Toleranță înaltă la erori</p>
                      </>
                    )}
                    {method.name === 'Topological' && (
                      <>
                        <p>• Protecție naturală la erori</p>
                        <p>• Implementare mai complexă</p>
                        <p>• Potential pentru aplicații specifice</p>
                      </>
                    )}
                    {method.name === 'Cat Code' && (
                      <>
                        <p>• Corecție continuă a erorilor</p>
                        <p>• Eficient pentru erori mici</p>
                        <p>• Implementare în bosonic systems</p>
                      </>
                    )}
                    {method.name === 'Repetition Code' && (
                      <>
                        <p>• Cel mai simplu de implementat</p>
                        <p>• Bun pentru demonstrații</p>
                        <p>• Limitări în scalabilitate</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
