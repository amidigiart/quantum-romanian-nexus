
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Gauge, Zap, Database, AlertTriangle, TrendingUp } from 'lucide-react';
import { performanceMonitoringService } from '@/services/performanceMonitoringService';
import { cachePerformanceMonitor } from '@/services/cachePerformanceMonitor';
import { analyticsService } from '@/services/analyticsService';

export const PerformanceDashboard: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    memory: { current: 0, percentage: 0 },
    navigation: { average: 0, recent: [] as number[] },
    longTasks: { count: 0, totalDuration: 0 },
    resources: { average: 0, count: 0 }
  });
  const [cacheMetrics, setCacheMetrics] = useState({
    overall: cachePerformanceMonitor.getMetrics(),
    memory: cachePerformanceMonitor.getCacheTypeMetrics('memory'),
    session: cachePerformanceMonitor.getCacheTypeMetrics('session'),
    response: cachePerformanceMonitor.getCacheTypeMetrics('response')
  });

  useEffect(() => {
    if (!isMonitoring) return;

    const updateMetrics = () => {
      // Performance metrics
      const memoryMetrics = performanceMonitoringService.getMetrics('memory_usage');
      const navigationMetrics = performanceMonitoringService.getMetrics('navigation');
      const longTaskMetrics = performanceMonitoringService.getMetrics('long_task');
      const resourceMetrics = performanceMonitoringService.getMetrics('resource_load');

      const latestMemory = memoryMetrics[memoryMetrics.length - 1];
      
      setPerformanceData({
        memory: {
          current: latestMemory?.value || 0,
          percentage: latestMemory?.metadata?.percentage || 0
        },
        navigation: {
          average: performanceMonitoringService.getAverageMetric('navigation'),
          recent: navigationMetrics.slice(-10).map(m => m.value)
        },
        longTasks: {
          count: longTaskMetrics.length,
          totalDuration: longTaskMetrics.reduce((sum, m) => sum + m.value, 0)
        },
        resources: {
          average: performanceMonitoringService.getAverageMetric('resource_load'),
          count: resourceMetrics.length
        }
      });

      // Cache metrics
      setCacheMetrics({
        overall: cachePerformanceMonitor.getMetrics(),
        memory: cachePerformanceMonitor.getCacheTypeMetrics('memory'),
        session: cachePerformanceMonitor.getCacheTypeMetrics('session'),
        response: cachePerformanceMonitor.getCacheTypeMetrics('response')
      });
    };

    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getPerformanceStatus = () => {
    const { memory, longTasks, navigation } = performanceData;
    
    let score = 100;
    if (memory.percentage > 80) score -= 30;
    else if (memory.percentage > 60) score -= 15;
    
    if (longTasks.count > 5) score -= 20;
    if (navigation.average > 3000) score -= 25;
    else if (navigation.average > 1500) score -= 10;

    if (score >= 80) return { status: 'Excellent', color: 'bg-green-500', score };
    if (score >= 60) return { status: 'Good', color: 'bg-yellow-500', score };
    return { status: 'Needs Attention', color: 'bg-red-500', score };
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Performance Monitor</h2>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant="outline"
            size="sm"
            className={`border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 ${!isMonitoring ? 'opacity-50' : ''}`}
          >
            <Activity className="w-4 h-4 mr-2" />
            {isMonitoring ? 'Monitoring' : 'Paused'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="text-white">Performance</TabsTrigger>
          <TabsTrigger value="cache" className="text-white">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/5 border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Performance Score</p>
                  <p className="text-2xl font-bold text-white">{performanceStatus.score}%</p>
                </div>
                <Badge className={`${performanceStatus.color} text-white border-0`}>
                  {performanceStatus.status}
                </Badge>
              </div>
              <Progress value={performanceStatus.score} className="mt-2" />
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Memory Usage</p>
                  <p className="text-2xl font-bold text-white">{performanceData.memory.percentage.toFixed(1)}%</p>
                </div>
                <Database className="w-8 h-8 text-purple-400" />
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Cache Hit Rate</p>
                  <p className="text-2xl font-bold text-white">{cacheMetrics.overall.hitRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">Long Tasks</p>
                  <p className="text-2xl font-bold text-white">{performanceData.longTasks.count}</p>
                </div>
                {performanceData.longTasks.count > 3 ? (
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                ) : (
                  <Zap className="w-8 h-8 text-green-400" />
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10 p-4">
              <h3 className="text-white font-medium mb-3">Memory Performance</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Heap Usage</span>
                    <span className="text-white">{formatBytes(performanceData.memory.current)}</span>
                  </div>
                  <Progress value={performanceData.memory.percentage} />
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <h3 className="text-white font-medium mb-3">Navigation Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Average Load Time:</span>
                  <span className="text-white">{performanceData.navigation.average.toFixed(0)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Resources Loaded:</span>
                  <span className="text-white">{performanceData.resources.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Resource Time:</span>
                  <span className="text-white">{performanceData.resources.average.toFixed(0)}ms</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/5 border-white/10 p-4">
              <h4 className="text-white font-medium mb-3">Memory Cache</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Hit Rate:</span>
                  <span className="text-green-400">{cacheMetrics.memory.hitRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Hit Time:</span>
                  <span className="text-white">{cacheMetrics.memory.averageHitTime.toFixed(1)}ms</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <h4 className="text-white font-medium mb-3">Session Cache</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Hit Rate:</span>
                  <span className="text-green-400">{cacheMetrics.session.hitRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Hit Time:</span>
                  <span className="text-white">{cacheMetrics.session.averageHitTime.toFixed(1)}ms</span>
                </div>
              </div>
            </Card>

            <Card className="bg-white/5 border-white/10 p-4">
              <h4 className="text-white font-medium mb-3">Response Cache</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Hit Rate:</span>
                  <span className="text-green-400">{cacheMetrics.response.hitRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Avg Hit Time:</span>
                  <span className="text-white">{cacheMetrics.response.averageHitTime.toFixed(1)}ms</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
