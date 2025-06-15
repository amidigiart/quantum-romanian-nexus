
import React from 'react';
import { ChatMessage } from '@/hooks/useChat';
import { LazyAIProviderSelector } from './LazyAIProviderSelector';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { MessageInput } from './MessageInput';
import { QuickActions } from './QuickActions';
import { WelcomeMessage } from './WelcomeMessage';
import { ChatControls } from './ChatControls';
import { ChatErrorBoundary } from './ChatErrorBoundary';

interface OptimizedChatContentProps {
  // Provider props
  selectedProvider: string;
  selectedModel: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
  
  // Message props
  messages: ChatMessage[];
  pendingMessages: Set<string>;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onQuickAction: (action: string) => void;
  
  // Control props
  onPersonalizationClick: () => void;
  onMemoryToggle: () => void;
  showMemoryControls: boolean;
  queueSize: number;
  isConnected: boolean;
  
  // State props
  user: any;
  isGenerating: boolean;
}

export const OptimizedChatContent: React.FC<OptimizedChatContentProps> = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  messages,
  pendingMessages,
  inputValue,
  onInputChange,
  onSendMessage,
  onQuickAction,
  onPersonalizationClick,
  onMemoryToggle,
  showMemoryControls,
  queueSize,
  isConnected,
  user,
  isGenerating
}) => {
  return (
    <>
      <WelcomeMessage isEnhanced={true} />

      <ChatErrorBoundary fallback={
        <div className="p-4 bg-yellow-950/20 border-yellow-500/30 rounded text-yellow-400">
          AI Provider selector temporarily unavailable
        </div>
      }>
        <LazyAIProviderSelector
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onProviderChange={onProviderChange}
          onModelChange={onModelChange}
          disabled={!user || isGenerating}
        />
      </ChatErrorBoundary>

      <ChatControls
        onPersonalizationClick={onPersonalizationClick}
        onMemoryToggle={onMemoryToggle}
        showMemoryControls={showMemoryControls}
        queueSize={queueSize}
        isConnected={isConnected}
      />
      
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
          onChange={onInputChange}
          onSend={onSendMessage}
          disabled={!user || isGenerating}
          placeholder="Ask about quantum computing..."
        />
      </ChatErrorBoundary>

      <ChatErrorBoundary>
        <QuickActions 
          onActionClick={onQuickAction}
          disabled={!user || isGenerating}
        />
      </ChatErrorBoundary>
    </>
  );
};
