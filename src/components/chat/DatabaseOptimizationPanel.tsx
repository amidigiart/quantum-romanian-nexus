
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOptimizedQueryPersistence } from '@/hooks/chat/persistence/useOptimizedQueryPersistence';
import { useEnhancedBatchOperations } from '@/hooks/chat/persistence/useEnhancedBatchOperations';

export const DatabaseOptimizationPanel: React.FC = () => {
  const { getPerformanceMetrics, invalidateUserCache } = useOptimizedQueryPersistence();
  const { 
    getDetailedMetrics, 
    resetMetrics, 
    optimizeBatchSize,
    loading: batchLoading 
  } = useEnhancedBatchOperations();

  const [metrics, setMetrics] = useState<any>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimizedBatchSize, setLastOptimizedBatchSize] = useState<number | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      const performance = getPerformanceMetrics();
      const batch = getDetailedMetrics();
      setMetrics({ performance, batch });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);

    return () => clearInterval(interval);
  }, [getPerformanceMetrics, getDetailedMetrics]);

  const handleOptimizeBatchSize = async () => {
    setIsOptimizing(true);
    try {
      const optimalSize = await optimizeBatchSize();
      setLastOptimizedBatchSize(optimalSize);
    } catch (error) {
      console.error('Error optimizing batch size:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await invalidateUserCache();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Încărcare metrici...</div>
        </CardContent>
      </Card>
    );
  }

  const { performance, batch } = metrics;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Optimizare Bază de Date</CardTitle>
          <CardDescription>
            Monitorizare performanță și optimizare query-uri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="connections" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="connections">Conexiuni</TabsTrigger>
              <TabsTrigger value="cache">Cache</TabsTrigger>
              <TabsTrigger value="batch">Operații Batch</TabsTrigger>
            </TabsList>

            <TabsContent value="connections" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {performance.connection.activeConnections}
                  </div>
                  <div className="text-sm text-gray-500">Conexiuni Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performance.connection.idleConnections}
                  </div>
                  <div className="text-sm text-gray-500">Conexiuni Idle</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {performance.connection.queuedRequests}
                  </div>
                  <div className="text-sm text-gray-500">Cereri în Coadă</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {performance.connection.averageAcquireTime.toFixed(1)}ms
                  </div>
                  <div className="text-sm text-gray-500">Timp Mediu Achiziție</div>
                </div>
              </div>

              {performance.connection.connectionErrors > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-red-800 font-medium">
                    {performance.connection.connectionErrors} erori de conexiune detectate
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="cache" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performance.cache.hitRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Hit Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {performance.cache.totalQueries}
                  </div>
                  <div className="text-sm text-gray-500">Total Query-uri</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {performance.cache.averageQueryTime.toFixed(1)}ms
                  </div>
                  <div className="text-sm text-gray-500">Timp Mediu Query</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {performance.cache.totalCacheSize}
                  </div>
                  <div className="text-sm text-gray-500">Mărime Cache</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Cache Hit Rate</span>
                  <Badge variant={performance.cache.hitRate > 70 ? "default" : "destructive"}>
                    {performance.cache.hitRate > 70 ? "Bun" : "Necesar optimizare"}
                  </Badge>
                </div>
                <Progress value={performance.cache.hitRate} className="h-2" />
              </div>

              <Button onClick={handleClearCache} variant="outline" className="w-full">
                Șterge Cache Utilizator
              </Button>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {batch.totalOperations}
                  </div>
                  <div className="text-sm text-gray-500">Total Operații</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {batch.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Rata Succes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {batch.averageExecutionTime.toFixed(1)}ms
                  </div>
                  <div className="text-sm text-gray-500">Timp Mediu Execuție</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {batch.lastBatchSize}
                  </div>
                  <div className="text-sm text-gray-500">Ultima Mărime Batch</div>
                </div>
              </div>

              {lastOptimizedBatchSize && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-green-800 font-medium">
                    Mărime optimă batch determinată: {lastOptimizedBatchSize} elemente
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleOptimizeBatchSize}
                  disabled={isOptimizing || batchLoading}
                  className="flex-1"
                >
                  {isOptimizing ? "Optimizare..." : "Optimizează Mărime Batch"}
                </Button>
                <Button onClick={resetMetrics} variant="outline">
                  Reset Metrici
                </Button>
              </div>

              {batch.connectionMetrics && (
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Conexiuni active: {batch.connectionMetrics.activeConnections}</div>
                  <div>Cache hit rate: {batch.cacheMetrics.hitRate.toFixed(1)}%</div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
