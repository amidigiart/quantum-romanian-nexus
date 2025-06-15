import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { VirtualizedMessageList } from '@/components/chat/VirtualizedMessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { QuickActions } from '@/components/chat/QuickActions';
import { PresenceIndicator } from '@/components/chat/PresenceIndicator';
import { TypingHandler } from '@/components/chat/TypingHandler';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { EnhancedModeToggle } from '@/components/chat/EnhancedModeToggle';
import { LoadingState } from '@/components/chat/LoadingState';
import { useChatHandlers } from '@/components/chat/useChatHandlers';
import { AIProviderSelector, AI_PROVIDERS } from '@/components/chat/AIProviderSelector';
import { useMultiProviderBotResponses } from '@/hooks/chat/useMultiProviderBotResponses';

export const ChatInterface = () => {
  const {
    inputValue,
    setInputValue,
    useEnhancedMode,
    setUseEnhancedMode,
    messages,
    pendingMessages,
    loading,
    user,
    isConnected,
    onlineUsers,
    typingUsers,
    sendTypingIndicator,
    cacheStats,
    lastUpdated,
    sendMessage,
    handleQuickAction,
    componentRef
  } = useChatHandlers();

  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-2025-04-14');
  const { generateResponseWithProvider, isGenerating } = useMultiProviderBotResponses();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <Card 
      ref={componentRef}
      className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow"
    >
      <ChatHeader 
        useEnhancedMode={useEnhancedMode}
        cacheHitRate={cacheStats.hitRate}
        lastUpdated={lastUpdated}
      />

      <AIProviderSelector
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onProviderChange={setSelectedProvider}
        onModelChange={setSelectedModel}
        disabled={!user || isGenerating}
      />

      <EnhancedModeToggle 
        useEnhancedMode={useEnhancedMode}
        onChange={setUseEnhancedMode}
      />

      <PresenceIndicator 
        onlineUsers={onlineUsers}
        typingUsers={typingUsers}
        isConnected={isConnected}
      />
      
      <VirtualizedMessageList messages={messages} pendingMessages={pendingMessages} />

      <TypingHandler
        onTypingChange={sendTypingIndicator}
        inputValue={inputValue}
        isEnabled={isConnected && !!user}
      />

      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={sendMessage}
        disabled={!user}
        placeholder={useEnhancedMode ? 
          "Întrebați cu AI avansat despre quantum computing..." : 
          "Întrebați despre quantum computing, ultimele știri, senzori IoT..."
        }
      />

      <QuickActions 
        onActionClick={handleQuickAction}
        disabled={!user}
        enhanced={useEnhancedMode}
      />
    </Card>
  );
};
