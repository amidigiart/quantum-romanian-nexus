import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Bot, User, Clock } from 'lucide-react';
import { ChatMessage } from '@/hooks/useChat';
import { useMemoryManagement } from '@/hooks/chat/useMemoryManagement';

interface VirtualizedMessageListProps {
  messages: ChatMessage[];
  pendingMessages?: Set<string>;
  streamingMessage?: string;
  maxMessagesInView?: number;
}

const MESSAGE_HEIGHT = 100; // Approximate height per message in pixels

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({ 
  messages, 
  pendingMessages = new Set(),
  streamingMessage = '',
  maxMessagesInView = 100
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(256);
  const { getVirtualizedRange, updateMessageCount } = useMemoryManagement({
    maxMessagesInMemory: maxMessagesInView,
    virtualizationBufferSize: 5
  });

  // Update memory management with current message count
  useEffect(() => {
    updateMessageCount(messages.length);
  }, [messages.length, updateMessageCount]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      setContainerHeight(container.clientHeight);
    }
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    const container = containerRef.current;
    if (container) {
      const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
      if (isAtBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages.length, streamingMessage]);

  // Get virtualized range for performance
  const { startIndex, endIndex, totalHeight, offsetY } = getVirtualizedRange(
    scrollTop,
    containerHeight,
    MESSAGE_HEIGHT,
    messages.length
  );

  // Only render visible messages to optimize memory
  const visibleMessages = messages.slice(startIndex, endIndex);

  const renderMessage = (message: ChatMessage, originalIndex: number) => {
    const isPending = pendingMessages.has(message.id);
    const hasError = (message as any).error;
    
    return (
      <div key={message.id} className="animate-in slide-in-from-bottom-2 mb-3">
        <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
          <div className={`max-w-[80%] rounded-lg p-3 ${
            message.isBot 
              ? 'bg-blue-600/80 text-white' 
              : hasError
                ? 'bg-red-600/80 text-white'
                : isPending
                  ? 'bg-gray-600/60 text-white/80'
                  : 'bg-gray-600/80 text-white'
          }`}>
            <div className="flex items-start gap-2">
              {message.isBot ? (
                <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
              {isPending && (
                <Clock className="w-3 h-3 mt-0.5 flex-shrink-0 animate-pulse" />
              )}
            </div>
            <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
              {message.timestamp.toLocaleTimeString()}
              {isPending && (
                <span className="text-yellow-400">• Trimite...</span>
              )}
              {hasError && (
                <span className="text-red-400">• Eroare</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStreamingMessage = () => {
    if (!streamingMessage) return null;
    
    return (
      <div className="animate-in slide-in-from-bottom-2 mb-3">
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg p-3 bg-blue-600/80 text-white">
            <div className="flex items-start gap-2">
              <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed whitespace-pre-line">{streamingMessage}</p>
              <div className="w-2 h-4 bg-cyan-400 animate-pulse rounded flex-shrink-0 mt-0.5" />
            </div>
            <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
              <span className="text-cyan-400">• Streaming...</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show memory usage indicator for debugging
  const renderMemoryIndicator = () => {
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="text-xs text-gray-400 p-2 bg-black/20 rounded mb-2">
        Rendering {visibleMessages.length} of {messages.length} messages 
        (Range: {startIndex}-{endIndex})
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="h-64 overflow-y-auto mb-4 p-4 bg-black/20 rounded-lg"
      onScroll={handleScroll}
    >
      {renderMemoryIndicator()}
      
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleMessages.map((message, index) => 
            renderMessage(message, startIndex + index)
          )}
        </div>
      </div>
      
      {renderStreamingMessage()}
    </div>
  );
};
