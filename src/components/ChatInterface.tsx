
import React from 'react';
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
