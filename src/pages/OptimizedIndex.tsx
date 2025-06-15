
import React, { Suspense, useState } from 'react';
import { OptimizedChatInterface } from '@/components/chat/OptimizedChatInterface';
import { QuantumStatus } from '@/components/QuantumStatus';
import { QuantumNewsFeed } from '@/components/QuantumNewsFeed';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Gauge } from 'lucide-react';

const OptimizedIndex = () => {
  const [showPerformance, setShowPerformance] = useState(false);
  
  // Mock quantum metrics for the status component
  const mockQuantumMetrics = {
    activeQubits: 127,
    coherence: 87,
    entanglement: 92
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Performance Toggle */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => setShowPerformance(!showPerformance)}
            variant="outline"
            size="sm"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
          >
            <Gauge className="w-4 h-4 mr-2" />
            {showPerformance ? 'Hide' : 'Show'} Performance
          </Button>
        </div>

        {/* Performance Dashboard */}
        {showPerformance && (
          <div className="mb-6">
            <Suspense fallback={
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
                <Skeleton className="h-8 w-64 mb-4 bg-white/20" />
                <Skeleton className="h-32 w-full bg-white/20" />
              </Card>
            }>
              <PerformanceDashboard />
            </Suspense>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chat Interface */}
          <div className="xl:col-span-2">
            <Suspense fallback={
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
                <Skeleton className="h-8 w-64 mb-4 bg-white/20" />
                <Skeleton className="h-64 w-full mb-4 bg-white/20" />
                <Skeleton className="h-12 w-full bg-white/20" />
              </Card>
            }>
              <OptimizedChatInterface />
            </Suspense>
          </div>

          {/* Sidebar with status and news */}
          <div className="space-y-6">
            <Suspense fallback={<Skeleton className="h-32 w-full bg-white/20" />}>
              <QuantumStatus metrics={mockQuantumMetrics} />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-96 w-full bg-white/20" />}>
              <QuantumNewsFeed />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedIndex;
