
import React, { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/hooks/useChat';

interface MessageListProps {
  messages: ChatMessage[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-64 overflow-y-auto mb-4 p-4 bg-black/20 rounded-lg space-y-3">
      {messages.map((message) => (
        <div key={message.id} className="animate-in slide-in-from-bottom-2">
          <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.isBot 
                ? 'bg-blue-600/80 text-white' 
                : 'bg-gray-600/80 text-white'
            }`}>
              <div className="flex items-start gap-2">
                {message.isBot ? (
                  <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
              </div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
