
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Bot, User, Clock } from 'lucide-react';
import { ChatMessage } from '@/hooks/useChat';

interface VirtualizedMessageListProps {
  messages: ChatMessage[];
  pendingMessages?: Set<string>;
}

const MESSAGE_HEIGHT = 100; // Approximate height per message in pixels
const BUFFER_SIZE = 5; // Number of extra messages to render outside viewport

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({ 
  messages, 
  pendingMessages = new Set() 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(256); // Default height

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
  }, [messages.length]);

  // Calculate which messages should be visible
  const startIndex = Math.max(0, Math.floor(scrollTop / MESSAGE_HEIGHT) - BUFFER_SIZE);
  const endIndex = Math.min(
    messages.length,
    Math.ceil((scrollTop + containerHeight) / MESSAGE_HEIGHT) + BUFFER_SIZE
  );

  const visibleMessages = messages.slice(startIndex, endIndex);
  const totalHeight = messages.length * MESSAGE_HEIGHT;
  const offsetY = startIndex * MESSAGE_HEIGHT;

  const renderMessage = (message: ChatMessage, index: number) => {
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

  return (
    <div 
      ref={containerRef}
      className="h-64 overflow-y-auto mb-4 p-4 bg-black/20 rounded-lg"
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleMessages.map((message, index) => renderMessage(message, startIndex + index))}
        </div>
      </div>
    </div>
  );
};
