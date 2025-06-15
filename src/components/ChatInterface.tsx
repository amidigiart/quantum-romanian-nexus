
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Atom, Newspaper } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { QuickActions } from '@/components/chat/QuickActions';

export const ChatInterface = () => {
  const { user } = useAuth();
  const { 
    saveMessage, 
    currentConversation,
    loading 
  } = useChat();
  const { generateBotResponse, newsContext, lastUpdated } = useBotResponses();
  const { messages, addMessage, initializeWithWelcome } = useChatMessages();
  const [inputValue, setInputValue] = useState('');

  // Initialize with enhanced welcome message that includes news context
  useEffect(() => {
    if (!currentConversation && messages.length === 0 && user) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        text: `Bună ziua! Sunt asistentul dvs. cuantic avansat cu acces la ultimele știri din domeniu. Pot să vă ajut cu 10 funcții cuantice hibride: algoritmi Grover/Shor, criptografie cuantică, învățare automată cuantică, optimizare QAOA, simulare VQE, și multe altele.\n\n${newsContext ? `📰 ${newsContext}` : ''}\n\nCu ce vă pot ajuta?`,
        isBot: true,
        timestamp: new Date()
      };
      initializeWithWelcome(welcomeMessage);
    }
  }, [currentConversation, user, messages.length, newsContext]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    // Add user message to UI and save to database
    addMessage(userMessage);
    await saveMessage(userMessage, currentConversation?.id);
    setInputValue('');

    // Simulate bot response delay
    setTimeout(async () => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };
      
      // Add bot message to UI and save to database
      addMessage(botMessage);
      await saveMessage(botMessage, currentConversation?.id);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Atom className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-white">Se încarcă conversația...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Asistent Cuantic Hibrid</h2>
        <Badge variant="outline" className="border-green-400 text-green-400">
          10 Funcții
        </Badge>
        {lastUpdated && (
          <Badge variant="outline" className="border-cyan-400 text-cyan-400 ml-auto">
            <Newspaper className="w-3 h-3 mr-1" />
            Știri: {lastUpdated.toLocaleTimeString('ro-RO')}
          </Badge>
        )}
      </div>
      
      <MessageList messages={messages} />

      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={sendMessage}
        disabled={!user}
        placeholder="Întrebați despre quantum computing, ultimele știri, senzori IoT..."
      />

      <QuickActions 
        onActionClick={handleQuickAction}
        disabled={!user}
      />
    </Card>
  );
};
