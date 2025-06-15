
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
import { ResponseQualityIndicator } from '@/components/chat/ResponseQualityIndicator';
import { PersonalizationSettings } from '@/components/personalization/PersonalizationSettings';
import { AIProviderSelector } from '@/components/chat/AIProviderSelector';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useChatEngine } from '@/hooks/chat/useChatEngine';

export const ChatInterface = () => {
  const { t } = useLanguage();
  const { personalizationData } = usePersonalization();
  const {
    // State
    inputValue,
    useEnhancedMode,
    messages,
    pendingMessages,
    loading,
    user,
    selectedProvider,
    selectedModel,
    showQualityMetrics,
    showPersonalization,
    isGenerating,
    
    // Real-time
    isConnected,
    onlineUsers,
    typingUsers,
    sendTypingIndicator,
    
    // Cache stats
    cacheStats,
    lastUpdated,
    
    // Actions
    setInputValue,
    setUseEnhancedMode,
    setSelectedProvider,
    setSelectedModel,
    toggleQualityMetrics,
    togglePersonalization,
    sendMessage,
    handleQuickAction
  } = useChatEngine();

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
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
              onClick={togglePersonalization}
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
          disabled={!user || isGenerating}
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
              onClick={toggleQualityMetrics}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              {t('analytics.show_hide', { action: showQualityMetrics ? 'Hide' : 'Show' })}
            </button>
          </div>
        </div>

        <ResponseQualityIndicator
          metrics={{
            responseTime: 0,
            cacheHit: false,
            qualityScore: 0,
            contextRelevance: 0,
            userSatisfactionPrediction: 0
          }}
          context={{
            recentMessages: [],
            topics: [],
            userPreferences: [],
            conversationFlow: [],
            userExpertiseLevel: 'intermediate',
            preferredResponseStyle: 'detailed'
          }}
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
          disabled={!user || isGenerating}
          placeholder={useEnhancedMode ? 
            t('chat.placeholder_enhanced') : 
            t('chat.placeholder_basic')
          }
        />

        <QuickActions 
          onActionClick={handleQuickAction}
          disabled={!user || isGenerating}
          enhanced={useEnhancedMode}
        />
      </Card>

      {showPersonalization && (
        <PersonalizationSettings />
      )}
    </div>
  );
};
