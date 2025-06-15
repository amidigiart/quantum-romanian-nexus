
import React from 'react';
import { Header } from '@/components/Header';
import { QuantumParticles } from '@/components/QuantumParticles';
import { ContentPrioritizer } from '@/components/progressive/ContentPrioritizer';
import { LazySection } from '@/components/progressive/LazySection';
import { useProgressiveLoading } from '@/hooks/useProgressiveLoading';

// Lazy load heavy components
const LazyOptimizedChatInterface = React.lazy(() => 
  import('@/components/chat/OptimizedChatInterface').then(module => ({
    default: module.OptimizedChatInterface
  }))
);

const LazyQuantumStatus = React.lazy(() => 
  import('@/components/QuantumStatus').then(module => ({
    default: module.QuantumStatus
  }))
);

const LazyQuantumNewsFeed = React.lazy(() => 
  import('@/components/QuantumNewsFeed').then(module => ({
    default: module.QuantumNewsFeed
  }))
);

const LazyPerformanceDashboard = React.lazy(() => 
  import('@/components/performance/PerformanceDashboard').then(module => ({
    default: module.PerformanceDashboard
  }))
);

const ProgressiveIndex = () => {
  // Mock quantum metrics
  const mockQuantumMetrics = {
    activeQubits: 127,
    coherence: 87,
    entanglement: 92
  };

  // Define progressive loading stages
  const { isComplete, getOverallProgress } = useProgressiveLoading({
    stages: [
      {
        id: 'chat-interface',
        priority: 'critical',
        loadFn: async () => {
          // Preload chat interface
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      },
      {
        id: 'quantum-status',
        priority: 'high',
        loadFn: async () => {
          // Load quantum status
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      },
      {
        id: 'news-feed',
        priority: 'medium',
        loadFn: async () => {
          // Load news feed
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      },
      {
        id: 'performance-dashboard',
        priority: 'low',
        loadFn: async () => {
          // Load performance dashboard
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    ],
    batchSize: 2,
    delayBetweenBatches: 150
  });

  // Define content sections with priorities
  const contentSections = [
    {
      id: 'chat-interface',
      component: LazyOptimizedChatInterface,
      priority: 'high' as const,
      delay: 0
    },
    {
      id: 'quantum-status',
      component: LazyQuantumStatus,
      props: { metrics: mockQuantumMetrics },
      priority: 'high' as const,
      delay: 100
    },
    {
      id: 'news-feed',
      component: LazyQuantumNewsFeed,
      priority: 'medium' as const,
      delay: 200
    },
    {
      id: 'performance-dashboard',
      component: LazyPerformanceDashboard,
      priority: 'low' as const,
      delay: 300
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <QuantumParticles />

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header loads immediately */}
        <Header />

        {/* Progress indicator */}
        {!isComplete && (
          <div className="mb-4">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="text-sm text-cyan-400">Loading...</div>
                <div className="flex-1 bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getOverallProgress()}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400">
                  {Math.round(getOverallProgress())}%
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chat Interface - High Priority */}
          <div className="xl:col-span-2">
            <LazySection priority="high" delay={0}>
              <LazyOptimizedChatInterface />
            </LazySection>
          </div>

          {/* Sidebar Content - Progressive Loading */}
          <div className="space-y-6">
            <ContentPrioritizer 
              sections={contentSections.filter(s => s.id !== 'chat-interface')}
            />
          </div>
        </div>

        {/* Footer */}
        <LazySection priority="low" delay={1000} className="mt-8">
          <footer className="text-center text-gray-400">
            <p>&copy; 2024 Chatbot Cuantic Român. Tehnologie avansată pentru viitorul cuantic.</p>
          </footer>
        </LazySection>
      </div>
    </div>
  );
};

export default ProgressiveIndex;
