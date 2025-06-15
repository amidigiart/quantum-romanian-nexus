
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
import { ResponseQualityIndicator } from '@/components/chat/ResponseQualityIndicator';
import { PersonalizationSettings } from '@/components/personalization/PersonalizationSettings';
import { useChatHandlers } from '@/components/chat/useChatHandlers';
import { AIProviderSelector, AI_PROVIDERS } from '@/components/chat/AIProviderSelector';
import { useMultiProviderBotResponses } from '@/hooks/chat/useMultiProviderBotResponses';
import { useEnhancedBotResponses } from '@/hooks/chat/useEnhancedBotResponses';
import { usePersonalizedBotResponses } from '@/hooks/chat/usePersonalizedBotResponses';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';

export const ChatInterface = () => {
  const { t } = useLanguage();
  const { personalizationData } = usePersonalization();
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
  const [showQualityMetrics, setShowQualityMetrics] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  
  const { generateResponseWithProvider, isGenerating } = useMultiProviderBotResponses();
  const { conversationContext, responseMetrics } = useEnhancedBotResponses();
  const { generatePersonalizedResponse, isGenerating: isPersonalizing } = usePersonalizedBotResponses();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <Card 
        ref={componentRef}
        className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <ChatHeader 
              useEnhancedMode={useEnhancedMode}
              cacheHitRate={cacheStats.hitRate}
              lastUpdated={lastUpdated}
            />
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <button
              onClick={() => setShowPersonalization(!showPersonalization)}
              className="text-xs text-cyan-400 hover:text-white transition-colors flex items-center gap-1"
            >
              🧠 {showPersonalization ? 'Hide' : 'Show'} Personalization
            </button>
          </div>
        </div>

        <AIProviderSelector
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onProviderChange={setSelectedProvider}
          onModelChange={setSelectedModel}
          disabled={!user || isGenerating || isPersonalizing}
        />

        <div className="flex items-center justify-between mb-4">
          <EnhancedModeToggle 
            useEnhancedMode={useEnhancedMode}
            onChange={setUseEnhancedMode}
          />
          
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-400">
              Style: {personalizationData.communicationStyle} | 
              Level: {personalizationData.learningLevel}
            </div>
            <button
              onClick={() => setShowQualityMetrics(!showQualityMetrics)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              {t('analytics.show_hide', { action: showQualityMetrics ? 'Hide' : 'Show' })}
            </button>
          </div>
        </div>

        <ResponseQualityIndicator
          metrics={responseMetrics}
          context={conversationContext}
          isVisible={showQualityMetrics && useEnhancedMode}
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
          disabled={!user || isGenerating || isPersonalizing}
          placeholder={useEnhancedMode ? 
            t('chat.placeholder_enhanced') : 
            t('chat.placeholder_basic')
          }
        />

        <QuickActions 
          onActionClick={handleQuickAction}
          disabled={!user || isGenerating || isPersonalizing}
          enhanced={useEnhancedMode}
        />
      </Card>

      {showPersonalization && (
        <PersonalizationSettings />
      )}
    </div>
  );
};
