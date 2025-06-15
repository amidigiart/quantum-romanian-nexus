
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import {
  Activity,
  Monitor,
  TrendingUp,
  TrendingDown,
  Settings,
  History,
  Gauge
} from 'lucide-react';
import { analyticsService } from '@/services/analyticsService';
import { advancedCacheService } from '@/services/advancedCacheService';
import { useToast } from '@/hooks/use-toast';

export const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState({
    performance: analyticsService.getPerformanceMetrics(),
    session: analyticsService.getSessionMetrics(),
    cache: advancedCacheService.getMetrics()
  });
  const [realtimeData, setRealtimeData] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newMetrics = {
        performance: analyticsService.getPerformanceMetrics(),
        session: analyticsService.getSessionMetrics(),
        cache: advancedCacheService.getMetrics()
      };
      
      setMetrics(newMetrics);
      
      // Update realtime chart data
      const timestamp = new Date().toLocaleTimeString();
      setRealtimeData(prev => {
        const newData = [...prev, {
          time: timestamp,
          performance: newMetrics.performance.responseTime,
          cache: newMetrics.cache.hitRate,
          memory: newMetrics.performance.memoryUsage
        }].slice(-20); // Keep last 20 data points
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const handleExportAnalytics = () => {
    const data = analyticsService.exportAnalytics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Analytics Exported",
      description: "Analytics data has been downloaded as JSON file.",
    });
  };

  const handleClearAnalytics = () => {
    analyticsService.clearAnalytics();
    setRealtimeData([]);
    toast({
      title: "Analytics Cleared",
      description: "All analytics data has been cleared.",
    });
  };

  const getHealthStatus = () => {
    const { performance, cache } = metrics;
    const score = (
      (performance.errorRate < 5 ? 25 : 0) +
      (performance.responseTime < 1000 ? 25 : performance.responseTime < 2000 ? 15 : 0) +
      (cache.hitRate > 70 ? 25 : cache.hitRate > 40 ? 15 : 0) +
      (performance.memoryUsage < 80 ? 25 : performance.memoryUsage < 90 ? 15 : 0)
    );

    if (score >= 80) return { status: 'Excellent', color: 'bg-green-500', score };
    if (score >= 60) return { status: 'Good', color: 'bg-yellow-500', score };
    return { status: 'Needs Attention', color: 'bg-red-500', score };
  };

  const health = getHealthStatus();

  const chartConfig = {
    performance: {
      label: "Response Time (ms)",
      color: "hsl(var(--chart-1))",
    },
    cache: {
      label: "Cache Hit Rate (%)",
      color: "hsl(var(--chart-2))",
    },
    memory: {
      label: "Memory Usage (%)",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">System Monitoring</h2>
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
            <Button
              onClick={handleExportAnalytics}
              variant="outline"
              size="sm"
              className="border-green-400 text-green-400 hover:bg-green-400/10"
            >
              <History className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5">
            <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="text-white">Performance</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
            <TabsTrigger value="realtime" className="text-white">Real-time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">System Health</p>
                    <p className="text-2xl font-bold text-white">{health.score}%</p>
                  </div>
                  <Badge className={`${health.color} text-white border-0`}>
                    {health.status}
                  </Badge>
                </div>
                <Progress value={health.score} className="mt-2" />
              </Card>

              <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Response Time</p>
                    <p className="text-2xl font-bold text-white">{metrics.performance.responseTime.toFixed(0)}ms</p>
                  </div>
                  <Gauge className="w-8 h-8 text-blue-400" />
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Cache Hit Rate</p>
                    <p className="text-2xl font-bold text-white">{metrics.cache.hitRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Memory Usage</p>
                    <p className="text-2xl font-bold text-white">{metrics.performance.memoryUsage.toFixed(1)}%</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-400" />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10 p-4">
                <h3 className="text-white font-medium mb-3">Session Analytics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Page Views:</span>
                    <span className="text-white">{metrics.session.pageViews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Messages Sent:</span>
                    <span className="text-white">{metrics.session.messageCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Session Duration:</span>
                    <span className="text-white">{Math.round(metrics.session.sessionDuration / 1000 / 60)}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Click Events:</span>
                    <span className="text-white">{metrics.session.clickEvents}</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-4">
                <h3 className="text-white font-medium mb-3">Error Monitoring</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Error Rate:</span>
                    <span className={`${metrics.performance.errorRate > 5 ? 'text-red-400' : 'text-green-400'}`}>
                      {metrics.performance.errorRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Load Time:</span>
                    <span className="text-white">{metrics.performance.loadTime.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cache Efficiency:</span>
                    <span className="text-white">{metrics.cache.cacheEfficiency.toFixed(1)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/5 border-white/10 p-4">
                <h3 className="text-white font-medium mb-3">Performance Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">Response Time</span>
                      <span className="text-white">{metrics.performance.responseTime.toFixed(0)}ms</span>
                    </div>
                    <Progress value={Math.min(metrics.performance.responseTime / 20, 100)} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">Memory Usage</span>
                      <span className="text-white">{metrics.performance.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.performance.memoryUsage} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">Cache Hit Rate</span>
                      <span className="text-white">{metrics.cache.hitRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.cache.hitRate} />
                  </div>
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-4">
                <h3 className="text-white font-medium mb-3">Cache Analytics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Entries:</span>
                    <span className="text-white">{metrics.cache.totalSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Hit Rate:</span>
                    <span className="text-green-400">{metrics.cache.hitRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Miss Rate:</span>
                    <span className="text-red-400">{metrics.cache.missRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Avg Response:</span>
                    <span className="text-white">{metrics.cache.averageResponseTime.toFixed(1)}ms</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-medium">User Behavior Analytics</h3>
              <Button
                onClick={handleClearAnalytics}
                variant="outline"
                size="sm"
                className="border-red-400 text-red-400 hover:bg-red-400/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Clear Data
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(metrics.session.interactions).map(([component, count]) => (
                <Card key={component} className="bg-white/5 border-white/10 p-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{count}</p>
                    <p className="text-sm text-gray-300 capitalize">{component.replace('_', ' ')}</p>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-4">
            <Card className="bg-white/5 border-white/10 p-4">
              <h3 className="text-white font-medium mb-4">Real-time Performance</h3>
              {realtimeData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={realtimeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="performance"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="cache"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="memory"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>Collecting real-time data...</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
