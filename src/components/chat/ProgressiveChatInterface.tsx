
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LazySection } from '@/components/progressive/LazySection';
import { useProgressiveLoading } from '@/hooks/useProgressiveLoading';
import { WelcomeMessage } from './WelcomeMessage';

// Lazy load chat components
const LazyAIProviderSelector = React.lazy(() => 
  import('./LazyAIProviderSelector').then(module => ({
    default: module.LazyAIProviderSelector
  }))
);

const LazyVirtualizedMessageList = React.lazy(() => 
  import('./VirtualizedMessageList').then(module => ({
    default: module.VirtualizedMessageList
  }))
);

const LazyMessageInput = React.lazy(() => 
  import('./MessageInput').then(module => ({
    default: module.MessageInput
  }))
);

const LazyQuickActions = React.lazy(() => 
  import('./QuickActions').then(module => ({
    default: module.QuickActions
  }))
);

export const ProgressiveChatInterface = React.memo(() => {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-2025-04-14');
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);

  // Progressive loading for chat components
  const { getStageStatus, getOverallProgress } = useProgressiveLoading({
    stages: [
      {
        id: 'welcome',
        priority: 'critical',
        loadFn: async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      },
      {
        id: 'provider-selector',
        priority: 'high',
        loadFn: async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      },
      {
        id: 'message-list',
        priority: 'high',
        loadFn: async () => {
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      },
      {
        id: 'input-actions',
        priority: 'medium',
        loadFn: async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    ],
    batchSize: 2,
    delayBetweenBatches: 100
  });

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
      {/* Welcome Message - Critical Priority */}
      <LazySection priority="high" delay={0}>
        <WelcomeMessage isEnhanced={true} />
      </LazySection>

      {/* AI Provider Selector - High Priority */}
      <LazySection priority="high" delay={100}>
        <LazyAIProviderSelector
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onProviderChange={setSelectedProvider}
          onModelChange={setSelectedModel}
          disabled={false}
        />
      </LazySection>

      {/* Message List - High Priority */}
      <LazySection priority="high" delay={150}>
        <LazyVirtualizedMessageList 
          messages={messages}
          pendingMessages={new Set()}
          maxMessagesInView={50}
        />
      </LazySection>

      {/* Message Input - Medium Priority */}
      <LazySection priority="medium" delay={200}>
        <LazyMessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          disabled={false}
          placeholder="Ask about quantum computing with progressive loading..."
        />
      </LazySection>

      {/* Quick Actions - Medium Priority */}
      <LazySection priority="medium" delay={250}>
        <LazyQuickActions 
          onActionClick={handleQuickAction}
          disabled={false}
        />
      </LazySection>

      {/* Loading Progress Indicator */}
      {getOverallProgress() < 100 && (
        <div className="mt-4 bg-white/5 rounded-lg p-3">
          <div className="text-xs text-cyan-400 mb-2">
            Loading chat components... {Math.round(getOverallProgress())}%
          </div>
          <div className="bg-white/20 rounded-full h-1">
            <div 
              className="bg-cyan-400 h-1 rounded-full transition-all duration-300"
              style={{ width: `${getOverallProgress()}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
});

ProgressiveChatInterface.displayName = 'ProgressiveChatInterface';
