
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LazyAIProviderSelector } from './LazyAIProviderSelector';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { MessageInput } from './MessageInput';
import { QuickActions } from './QuickActions';
import { WelcomeMessage } from './WelcomeMessage';
import { MemoryManagementControls } from './MemoryManagementControls';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useLazyMultiProviderBotResponses } from '@/hooks/chat/useLazyMultiProviderBotResponses';
import { useOptimizedRealtimeChat } from '@/hooks/chat/useOptimizedRealtimeChat';
import { useMemoryManagement } from '@/hooks/chat/useMemoryManagement';
import { ChatMessage } from '@/hooks/useChat';
import { LazyPersonalizationSettings } from '../personalization/LazyPersonalizationSettings';

export const OptimizedChatInterface = React.memo(() => {
  const { user } = useAuth();
  const { messages, addMessage, pendingMessages } = useChatMessages();
  const { generateResponseWithProvider, isGenerating } = useLazyMultiProviderBotResponses();
  const { checkMemoryPressure } = useMemoryManagement();
  
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
    if (!inputValue.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    addMessage(userMessage, true);
    const messageText = inputValue;
    setInputValue('');

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
      
      // Trigger memory pressure check after adding messages
      checkMemoryPressure();
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
        <WelcomeMessage isEnhanced={true} />

        <LazyAIProviderSelector
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onProviderChange={setSelectedProvider}
          onModelChange={setSelectedModel}
          disabled={!user || isGenerating}
        />

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
          
          {isConnected && (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Real-time Connected
            </div>
          )}
        </div>
        
        <VirtualizedMessageList 
          messages={messages} 
          pendingMessages={pendingMessages}
          maxMessagesInView={100}
        />

        <MessageInput
          value={inputValue}
          onChange={setInputValue}
          onSend={sendMessage}
          disabled={!user || isGenerating}
          placeholder="Ask about quantum computing..."
        />

        <QuickActions 
          onActionClick={handleQuickAction}
          disabled={!user || isGenerating}
        />
      </Card>

      {/* Memory Management Controls */}
      {showMemoryControls && (
        <React.Suspense fallback={<div>Loading memory controls...</div>}>
          <MemoryManagementControls />
        </React.Suspense>
      )}

      {/* Personalization Settings */}
      {showPersonalization && (
        <React.Suspense fallback={<div>Loading personalization...</div>}>
          <LazyPersonalizationSettings />
        </React.Suspense>
      )}
    </div>
  );
});

OptimizedChatInterface.displayName = 'OptimizedChatInterface';
