
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Target, Brain, Zap, BarChart3, PieChart, Shield, Calculator } from 'lucide-react';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  expectedReturn: number;
  volatility: number;
  weight: number;
  quantumScore: number;
}

interface PortfolioMetrics {
  totalValue: number;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  quantumAdvantage: number;
  riskScore: number;
}

interface OptimizationResult {
  algorithm: string;
  newWeights: Record<string, number>;
  expectedReturn: number;
  risk: number;
  quantumAdvantage: number;
  convergenceTime: number;
}

export const FinancialQuantumOptimizer = () => {
  const [assets, setAssets] = useState<Asset[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, expectedReturn: 0.12, volatility: 0.24, weight: 0.25, quantumScore: 0.85 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.21, expectedReturn: 0.15, volatility: 0.28, weight: 0.20, quantumScore: 0.92 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, expectedReturn: 0.13, volatility: 0.22, weight: 0.20, quantumScore: 0.88 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, expectedReturn: 0.18, volatility: 0.45, weight: 0.15, quantumScore: 0.78 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 461.30, expectedReturn: 0.22, volatility: 0.52, weight: 0.20, quantumScore: 0.95 }
  ]);

  const [portfolioValue, setPortfolioValue] = useState(100000);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('QAOA');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState<PortfolioMetrics>({
    totalValue: 100000,
    expectedReturn: 0.14,
    volatility: 0.28,
    sharpeRatio: 1.85,
    quantumAdvantage: 0.12,
    riskScore: 0.32
  });

  const quantumAlgorithms = [
    { id: 'QAOA', name: 'Quantum Approximate Optimization Algorithm', complexity: 'O(p·m)' },
    { id: 'VQE', name: 'Variational Quantum Eigensolver', complexity: 'O(N⁴)' },
    { id: 'QSVM', name: 'Quantum Support Vector Machine', complexity: 'O(log N)' },
    { id: 'QAE', name: 'Quantum Amplitude Estimation', complexity: 'O(1/ε)' }
  ];

  const calculatePortfolioMetrics = () => {
    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
    const expectedReturn = assets.reduce((sum, asset) => sum + (asset.expectedReturn * asset.weight), 0) / totalWeight;
    const volatility = Math.sqrt(assets.reduce((sum, asset) => sum + Math.pow(asset.volatility * asset.weight, 2), 0)) / totalWeight;
    const sharpeRatio = (expectedReturn - 0.02) / volatility; // Assuming 2% risk-free rate
    const quantumAdvantage = assets.reduce((sum, asset) => sum + (asset.quantumScore * asset.weight), 0) / totalWeight * 0.2;
    const riskScore = volatility;

    setPortfolioMetrics({
      totalValue: portfolioValue,
      expectedReturn,
      volatility,
      sharpeRatio,
      quantumAdvantage,
      riskScore
    });
  };

  useEffect(() => {
    calculatePortfolioMetrics();
  }, [assets, portfolioValue]);

  const runQuantumOptimization = () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);

    const optimizationInterval = setInterval(() => {
      setOptimizationProgress(prev => {
        const newProgress = prev + Math.random() * 8 + 2;
        
        if (newProgress >= 100) {
          clearInterval(optimizationInterval);
          setIsOptimizing(false);
          
          // Generate optimized portfolio weights
          const newWeights: Record<string, number> = {};
          let remainingWeight = 1.0;
          
          assets.forEach((asset, index) => {
            if (index === assets.length - 1) {
              newWeights[asset.symbol] = remainingWeight;
            } else {
              const optimalWeight = Math.max(0.05, Math.min(0.4, 
                asset.quantumScore * (0.15 + Math.random() * 0.25)
              ));
              newWeights[asset.symbol] = optimalWeight;
              remainingWeight -= optimalWeight;
            }
          });

          // Normalize weights
          const totalWeight = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
          Object.keys(newWeights).forEach(symbol => {
            newWeights[symbol] = newWeights[symbol] / totalWeight;
          });

          const result: OptimizationResult = {
            algorithm: selectedAlgorithm,
            newWeights,
            expectedReturn: portfolioMetrics.expectedReturn + Math.random() * 0.03 + 0.01,
            risk: portfolioMetrics.volatility - Math.random() * 0.05 - 0.01,
            quantumAdvantage: Math.random() * 0.15 + 0.08,
            convergenceTime: Math.random() * 2000 + 500
          };

          setOptimizationResult(result);
          return 100;
        }
        
        return newProgress;
      });
    }, 200);
  };

  const applyOptimization = () => {
    if (!optimizationResult) return;
    
    const updatedAssets = assets.map(asset => ({
      ...asset,
      weight: optimizationResult.newWeights[asset.symbol] || asset.weight
    }));
    
    setAssets(updatedAssets);
    setOptimizationResult(null);
  };

  const updateAssetWeight = (symbol: string, newWeight: number) => {
    const updatedAssets = assets.map(asset =>
      asset.symbol === symbol ? { ...asset, weight: Math.max(0, Math.min(1, newWeight)) } : asset
    );
    setAssets(updatedAssets);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-green-400" />
        <h3 className="text-2xl font-bold text-white">Financial Quantum Optimizer</h3>
        <Badge variant="outline" className="border-green-400 text-green-400 ml-auto">
          <Brain className="w-3 h-3 mr-1" />
          Quantum Enhanced
        </Badge>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg border-white/20">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Overview */}
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Portfolio Overview
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Value:</span>
                  <span className="text-green-400 font-bold">${portfolioMetrics.totalValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expected Return:</span>
                  <span className="text-blue-400 font-bold">{(portfolioMetrics.expectedReturn * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Volatility:</span>
                  <span className="text-yellow-400 font-bold">{(portfolioMetrics.volatility * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sharpe Ratio:</span>
                  <span className="text-purple-400 font-bold">{portfolioMetrics.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantum Advantage:</span>
                  <span className="text-cyan-400 font-bold">+{(portfolioMetrics.quantumAdvantage * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Portfolio Value Input */}
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Portfolio Settings</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm">Portfolio Value ($)</label>
                  <Input
                    type="number"
                    value={portfolioValue}
                    onChange={(e) => setPortfolioValue(Number(e.target.value))}
                    className="bg-white/20 border-white/30 text-white mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="mt-6 bg-black/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Asset Allocation
            </h4>
            <div className="space-y-3">
              {assets.map((asset) => (
                <div key={asset.symbol} className="flex items-center gap-4 p-3 bg-white/10 rounded border border-white/20">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white font-medium">{asset.symbol}</span>
                      <span className="text-gray-400 text-sm">{asset.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">${asset.price}</span>
                      <div className="flex gap-3">
                        <span className="text-green-400">Return: {(asset.expectedReturn * 100).toFixed(1)}%</span>
                        <span className="text-yellow-400">Vol: {(asset.volatility * 100).toFixed(1)}%</span>
                        <span className="text-purple-400">Q-Score: {(asset.quantumScore * 100).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={asset.weight.toFixed(3)}
                      onChange={(e) => updateAssetWeight(asset.symbol, Number(e.target.value))}
                      className="bg-white/20 border-white/30 text-white text-sm"
                      step="0.001"
                      min="0"
                      max="1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Algorithm Selection */}
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Quantum Algorithms
              </h4>
              <div className="space-y-2">
                {quantumAlgorithms.map((algo) => (
                  <Button
                    key={algo.id}
                    variant={selectedAlgorithm === algo.id ? "default" : "outline"}
                    onClick={() => setSelectedAlgorithm(algo.id)}
                    className={`w-full justify-start ${
                      selectedAlgorithm === algo.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'border-white/30 text-white hover:bg-white/20'
                    }`}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{algo.name}</div>
                      <div className="text-xs opacity-70">{algo.complexity}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Optimization Controls */}
            <div className="bg-black/30 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Optimization Controls
              </h4>
              <div className="space-y-4">
                <Button
                  onClick={runQuantumOptimization}
                  disabled={isOptimizing}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {isOptimizing ? 'Optimizing...' : 'Run Quantum Optimization'}
                </Button>
                
                {isOptimizing && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-sm">Progress:</span>
                      <span className="text-cyan-400 text-sm">{optimizationProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={optimizationProgress} className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Optimization Results */}
          {optimizationResult && (
            <div className="mt-6 bg-black/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Optimization Results
                </h4>
                <Button
                  onClick={applyOptimization}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  Apply Optimization
                </Button>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-gray-400 text-sm">Expected Return</div>
                  <div className="text-green-400 font-bold">{(optimizationResult.expectedReturn * 100).toFixed(2)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm">Risk</div>
                  <div className="text-yellow-400 font-bold">{(optimizationResult.risk * 100).toFixed(2)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm">Quantum Advantage</div>
                  <div className="text-purple-400 font-bold">+{(optimizationResult.quantumAdvantage * 100).toFixed(1)}%</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm">Convergence Time</div>
                  <div className="text-cyan-400 font-bold">{optimizationResult.convergenceTime.toFixed(0)}ms</div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-white font-medium">Optimized Weights:</h5>
                {Object.entries(optimizationResult.newWeights).map(([symbol, weight]) => (
                  <div key={symbol} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">{symbol}:</span>
                    <span className="text-white">{(weight * 100).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Performance Analytics
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/10 rounded">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">
                  {(portfolioMetrics.expectedReturn * 100).toFixed(2)}%
                </div>
                <div className="text-gray-400 text-sm">Annual Return</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded">
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-400">
                  {portfolioMetrics.sharpeRatio.toFixed(2)}
                </div>
                <div className="text-gray-400 text-sm">Sharpe Ratio</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded">
                <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400">
                  +{(portfolioMetrics.quantumAdvantage * 100).toFixed(1)}%
                </div>
                <div className="text-gray-400 text-sm">Quantum Edge</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="mt-6">
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Risk Analysis
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Portfolio Volatility:</span>
                <span className="text-yellow-400 font-bold">{(portfolioMetrics.volatility * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Risk Score:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${
                    portfolioMetrics.riskScore < 0.3 ? 'text-green-400' : 
                    portfolioMetrics.riskScore < 0.5 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {portfolioMetrics.riskScore < 0.3 ? 'Low' : 
                     portfolioMetrics.riskScore < 0.5 ? 'Medium' : 'High'}
                  </span>
                  <Badge variant="outline" className={`${
                    portfolioMetrics.riskScore < 0.3 ? 'border-green-400 text-green-400' : 
                    portfolioMetrics.riskScore < 0.5 ? 'border-yellow-400 text-yellow-400' : 'border-red-400 text-red-400'
                  }`}>
                    {(portfolioMetrics.riskScore * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="text-white font-medium mb-2">Risk Distribution:</h5>
                <div className="space-y-2">
                  {assets.map((asset) => (
                    <div key={asset.symbol} className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">{asset.symbol}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white">{(asset.volatility * 100).toFixed(1)}%</span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-red-400 transition-all duration-300"
                            style={{ width: `${(asset.volatility / 0.6) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
