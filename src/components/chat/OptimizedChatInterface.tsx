import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LazyAIProviderSelector } from './LazyAIProviderSelector';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { MessageInput } from './MessageInput';
import { QuickActions } from './QuickActions';
import { WelcomeMessage } from './WelcomeMessage';
import { MemoryManagementControls } from './MemoryManagementControls';
import { ChatErrorBoundary } from './ChatErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useLazyMultiProviderBotResponses } from '@/hooks/chat/useLazyMultiProviderBotResponses';
import { useOptimizedRealtimeChat } from '@/hooks/chat/useOptimizedRealtimeChat';
import { useMemoryManagement } from '@/hooks/chat/useMemoryManagement';
import { useBatchMessageManager } from '@/hooks/chat/useBatchMessageManager';
import { ChatMessage } from '@/hooks/useChat';
import { LazyPersonalizationSettings } from '../personalization/LazyPersonalizationSettings';
import { performanceMonitoringService } from '@/services/performanceMonitoringService';

export const OptimizedChatInterface = React.memo(() => {
  const { user } = useAuth();
  const { messages, addMessage, pendingMessages } = useChatMessages();
  const { generateResponseWithProvider, isGenerating } = useLazyMultiProviderBotResponses();
  const { checkMemoryPressure } = useMemoryManagement();
  const { saveBatchedMessage, queueSize } = useBatchMessageManager();
  
  const [inputValue, setInputValue] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-2025-04-14');
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showMemoryControls, setShowMemoryControls] = useState(false);

  // Set up optimized realtime chat
  const { isConnected, setMessageHandlers } = useOptimizedRealtimeChat(null);

  // Configure realtime message handlers
  React.useEffect(() => {
    setMessageHandlers({
      onMessage: (message: ChatMessage) => {
        addMessage(message, false);
        checkMemoryPressure();
      }
    });
  }, [setMessageHandlers, addMessage, checkMemoryPressure]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !user || isGenerating) return;

    return performanceMonitoringService.measureOperation('send_message', async () => {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: inputValue,
        isBot: false,
        timestamp: new Date()
      };

      addMessage(userMessage, true);
      const messageText = inputValue;
      setInputValue('');

      // Use batched saving for user message
      saveBatchedMessage(
        userMessage,
        'current-conversation-id', // Replace with actual conversation ID
        {
          priority: 'normal',
          onSuccess: () => console.log('User message saved'),
          onError: (error) => console.error('Failed to save user message:', error)
        }
      );

      try {
        const botResponse = await generateResponseWithProvider(
          messageText,
          { provider: selectedProvider, model: selectedModel }
        );
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          isBot: true,
          timestamp: new Date()
        };
        
        addMessage(botMessage, true);
        
        // Use batched saving for bot message with high priority
        saveBatchedMessage(
          botMessage,
          'current-conversation-id', // Replace with actual conversation ID
          {
            priority: 'high', // Bot responses are more important
            onSuccess: () => console.log('Bot message saved'),
            onError: (error) => console.error('Failed to save bot message:', error)
          }
        );
        
        checkMemoryPressure();
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  };

  const loadPersonalizationSettings = () => {
    setShowPersonalization(true);
  };

  return (
    <div className="space-y-4">
      <ChatErrorBoundary>
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
          <WelcomeMessage isEnhanced={true} />

          <ChatErrorBoundary fallback={
            <div className="p-4 bg-yellow-950/20 border-yellow-500/30 rounded text-yellow-400">
              AI Provider selector temporarily unavailable
            </div>
          }>
            <LazyAIProviderSelector
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onProviderChange={setSelectedProvider}
              onModelChange={setSelectedModel}
              disabled={!user || isGenerating}
            />
          </ChatErrorBoundary>

          {/* Controls section */}
          <div className="flex justify-between mb-4">
            <div className="flex gap-2">
              <Button
                onClick={loadPersonalizationSettings}
                variant="outline"
                size="sm"
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
              >
                🧠 Personalization
              </Button>
              
              <Button
                onClick={() => setShowMemoryControls(!showMemoryControls)}
                variant="outline"
                size="sm"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
              >
                📊 Memory
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              {queueSize > 0 && (
                <div className="text-orange-400 text-sm">
                  {queueSize} messages queued
                </div>
              )}
              
              {isConnected && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Real-time Connected
                </div>
              )}
            </div>
          </div>
          
          <ChatErrorBoundary fallback={
            <div className="p-4 bg-red-950/20 border-red-500/30 rounded text-red-400">
              Message list temporarily unavailable. Please refresh the page.
            </div>
          }>
            <VirtualizedMessageList 
              messages={messages} 
              pendingMessages={pendingMessages}
              maxMessagesInView={100}
            />
          </ChatErrorBoundary>

          <ChatErrorBoundary>
            <MessageInput
              value={inputValue}
              onChange={setInputValue}
              onSend={sendMessage}
              disabled={!user || isGenerating}
              placeholder="Ask about quantum computing..."
            />
          </ChatErrorBoundary>

          <ChatErrorBoundary>
            <QuickActions 
              onActionClick={handleQuickAction}
              disabled={!user || isGenerating}
            />
          </ChatErrorBoundary>
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
