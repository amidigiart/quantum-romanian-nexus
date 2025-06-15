
import React, { Suspense } from 'react';
import { OptimizedChatInterface } from '@/components/chat/OptimizedChatInterface';
import { QuantumStatus } from '@/components/QuantumStatus';
import { QuantumNewsFeed } from '@/components/QuantumNewsFeed';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const OptimizedIndex = () => {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
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
              <QuantumStatus />
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
