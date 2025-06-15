
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { OptimizedChatContent } from './OptimizedChatContent';
import { MemoryManagementControls } from './MemoryManagementControls';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useLazyMultiProviderBotResponses } from '@/hooks/chat/useLazyMultiProviderBotResponses';
import { useOptimizedRealtimeChat } from '@/hooks/chat/useOptimizedRealtimeChat';
import { useMemoryManagement } from '@/hooks/chat/useMemoryManagement';
import { useBatchMessageManager } from '@/hooks/chat/useBatchMessageManager';
import { useOptimizedChatHandlers } from '@/hooks/chat/useOptimizedChatHandlers';
import { LazyPersonalizationSettings } from '../personalization/LazyPersonalizationSettings';

export const OptimizedChatInterface = React.memo(() => {
  const { user } = useAuth();
  const { messages, addMessage, pendingMessages } = useChatMessages();
  const { generateResponseWithProvider, isGenerating } = useLazyMultiProviderBotResponses();
  const { checkMemoryPressure } = useMemoryManagement();
  const { saveBatchedMessage, queueSize } = useBatchMessageManager();
  
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-2025-04-14');
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showMemoryControls, setShowMemoryControls] = useState(false);

  // Set up optimized realtime chat
  const { isConnected, setMessageHandlers } = useOptimizedRealtimeChat(null);

  // Use the optimized chat handlers
  const { inputValue, setInputValue, sendMessage, handleQuickAction } = useOptimizedChatHandlers({
    user,
    isGenerating,
    addMessage,
    generateResponseWithProvider,
    saveBatchedMessage,
    checkMemoryPressure,
    selectedProvider,
    selectedModel
  });

  // Configure realtime message handlers
  React.useEffect(() => {
    setMessageHandlers({
      onMessage: (message) => {
        addMessage(message, false);
        checkMemoryPressure();
      }
    });
  }, [setMessageHandlers, addMessage, checkMemoryPressure]);

  const loadPersonalizationSettings = () => {
    setShowPersonalization(true);
  };

  return (
    <div className="space-y-4">
      <ChatErrorBoundary>
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
          <OptimizedChatContent
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={setSelectedProvider}
            onModelChange={setSelectedModel}
            messages={messages}
            pendingMessages={pendingMessages}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSendMessage={sendMessage}
            onQuickAction={handleQuickAction}
            onPersonalizationClick={loadPersonalizationSettings}
            onMemoryToggle={() => setShowMemoryControls(!showMemoryControls)}
            showMemoryControls={showMemoryControls}
            queueSize={queueSize}
            isConnected={isConnected}
            user={user}
            isGenerating={isGenerating}
          />
        </Card>
      </ChatErrorBoundary>

      {/* Memory Management Controls */}
      {showMemoryControls && (
        <React.Suspense fallback={<div>Loading memory controls...</div>}>
          <ChatErrorBoundary>
            <MemoryManagementControls />
          </ChatErrorBoundary>
        </React.Suspense>
      )}

      {/* Personalization Settings */}
      {showPersonalization && (
        <React.Suspense fallback={<div>Loading personalization...</div>}>
          <ChatErrorBoundary>
            <LazyPersonalizationSettings />
          </ChatErrorBoundary>
        </React.Suspense>
      )}
    </div>
  );
});

OptimizedChatInterface.displayName = 'OptimizedChatInterface';
