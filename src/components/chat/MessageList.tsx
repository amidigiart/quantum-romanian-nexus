
import React, { useRef, useEffect } from 'react';
import { Bot, User, Clock } from 'lucide-react';
import { ChatMessage } from '@/hooks/useChat';

interface MessageListProps {
  messages: ChatMessage[];
  pendingMessages?: Set<string>;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  pendingMessages = new Set() 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-64 overflow-y-auto mb-4 p-4 bg-black/20 rounded-lg space-y-3">
      {messages.map((message) => {
        const isPending = pendingMessages.has(message.id);
        const hasError = (message as any).error;
        
        return (
          <div key={message.id} className="animate-in slide-in-from-bottom-2">
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
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
