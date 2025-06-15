
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LazyAIProviderSelector } from './LazyAIProviderSelector';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { MessageInput } from './MessageInput';
import { QuickActions } from './QuickActions';
import { WelcomeMessage } from './WelcomeMessage';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useLazyMultiProviderBotResponses } from '@/hooks/chat/useLazyMultiProviderBotResponses';
import { ChatMessage } from '@/hooks/useChat';

export const OptimizedChatInterface = React.memo(() => {
  const { user } = useAuth();
  const { messages, addMessage, pendingMessages } = useChatMessages();
  const { generateResponseWithProvider, isGenerating } = useLazyMultiProviderBotResponses();
  
  const [inputValue, setInputValue] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-2025-04-14');
  const [showPersonalization, setShowPersonalization] = useState(false);

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
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  };

  const loadPersonalizationSettings = async () => {
    const { LazyPersonalizationSettings } = await import('../personalization/LazyPersonalizationSettings');
    setShowPersonalization(true);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
        <WelcomeMessage />

        <LazyAIProviderSelector
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onProviderChange={setSelectedProvider}
          onModelChange={setSelectedModel}
          disabled={!user || isGenerating}
        />

        <div className="flex justify-end mb-4">
          <Button
            onClick={loadPersonalizationSettings}
            variant="outline"
            size="sm"
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
          >
            🧠 Personalization
          </Button>
        </div>
        
        <VirtualizedMessageList 
          messages={messages} 
          pendingMessages={pendingMessages}
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

      {showPersonalization && (
        <React.Suspense fallback={<div>Loading personalization...</div>}>
          {React.lazy(() => import('../personalization/LazyPersonalizationSettings').then(m => ({ default: m.LazyPersonalizationSettings })))()}
        </React.Suspense>
      )}
    </div>
  );
});

OptimizedChatInterface.displayName = 'OptimizedChatInterface';
