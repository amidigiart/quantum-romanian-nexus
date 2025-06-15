
import React from 'react';
import { Card } from '@/components/ui/card';
import { VirtualizedMessageList } from '@/components/chat/VirtualizedMessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { QuickActions } from '@/components/chat/QuickActions';
import { AIProviderSelector } from '@/components/chat/AIProviderSelector';
import { WelcomeMessage } from '@/components/chat/WelcomeMessage';
import { EnhancedLoadingState } from '@/components/chat/EnhancedLoadingState';
import { EnhancedModeControl } from '@/components/chat/EnhancedModeControl';
import { useEnhancedChatLogic } from '@/hooks/chat/useEnhancedChatLogic';

export const EnhancedChatInterface = React.memo(() => {
  const {
    inputValue,
    setInputValue,
    streamingMessage,
    isEnhancedMode,
    setIsEnhancedMode,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    messages,
    pendingMessages,
    loading,
    isGenerating,
    user,
    newsContext,
    sendEnhancedMessage,
    handleQuickAction
  } = useEnhancedChatLogic();

  if (loading) {
    return <EnhancedLoadingState />;
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
      <WelcomeMessage 
        isEnhanced={isEnhancedMode}
        newsContext={newsContext}
      />

      <AIProviderSelector
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onProviderChange={setSelectedProvider}
        onModelChange={setSelectedModel}
        disabled={!user || isGenerating}
      />

      <EnhancedModeControl
        isEnhanced={isEnhancedMode}
        onChange={setIsEnhancedMode}
        disabled={!user || isGenerating}
      />
      
      <VirtualizedMessageList 
        messages={messages} 
        pendingMessages={pendingMessages}
        streamingMessage={streamingMessage}
      />

      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={sendEnhancedMessage}
        disabled={!user || isGenerating}
        placeholder={isEnhancedMode ? 
          "Întrebați cu context avansat despre quantum computing..." : 
          "Întrebați despre quantum computing..."
        }
      />

      <QuickActions 
        onActionClick={handleQuickAction}
        disabled={!user || isGenerating}
        enhanced={isEnhancedMode}
      />
    </Card>
  );
});

EnhancedChatInterface.displayName = 'EnhancedChatInterface';
