
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, Trash2, History } from 'lucide-react';
import { ChatConversation, useChat } from '@/hooks/useChat';

export const ChatSidebar = () => {
  const {
    conversations,
    currentConversation,
    createConversation,
    selectConversation,
    deleteConversation
  } = useChat();

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (confirm('Sigur doriți să ștergeți această conversație?')) {
      deleteConversation(conversationId);
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-4 h-full">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Conversații</h3>
        <Badge variant="outline" className="border-cyan-400 text-cyan-400 ml-auto">
          {conversations.length}
        </Badge>
      </div>

      <Button
        onClick={() => createConversation()}
        className="w-full mb-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
      >
        <Plus className="w-4 h-4 mr-2" />
        Conversație Nouă
      </Button>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => selectConversation(conversation)}
            className={`p-3 rounded-lg cursor-pointer transition-all group ${
              currentConversation?.id === conversation.id
                ? 'bg-cyan-500/20 border border-cyan-400/50'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {conversation.title}
                </p>
                <p className="text-gray-400 text-xs">
                  {new Date(conversation.updated_at).toLocaleDateString('ro-RO')}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => handleDeleteConversation(e, conversation.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1 h-auto"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {conversations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nicio conversație încă</p>
            <p className="text-xs">Creați prima conversație cuantică!</p>
          </div>
        )}
      </div>
    </Card>
  );
};
