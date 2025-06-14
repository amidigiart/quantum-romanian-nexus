
import React from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { ChatSidebar } from '@/components/ChatSidebar';

export const ChatSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      {/* Chat Sidebar */}
      <div className="lg:col-span-1">
        <ChatSidebar />
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <ChatInterface />
      </div>
    </div>
  );
};
