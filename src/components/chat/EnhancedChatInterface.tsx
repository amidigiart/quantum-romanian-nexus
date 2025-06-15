import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Atom, Zap, Brain, Sparkles } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useAnalytics } from '@/hooks/useAnalytics';
import { VirtualizedMessageList } from '@/components/chat/VirtualizedMessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { QuickActions } from '@/components/chat/QuickActions';
import { AIProviderSelector, AI_PROVIDERS } from '@/components/chat/AIProviderSelector';
import { useMultiProviderBotResponses } from '@/hooks/chat/useMultiProviderBotResponses';

export const EnhancedChatInterface = () => {
  const { user } = useAuth();
  const { 
    saveMessage, 
    currentConversation,
    loading 
  } = useChat();
  
  const { 
    generateResponseWithProvider,
    isGenerating,
    newsContext
  } = useMultiProviderBotResponses();
  
  const { 
    messages, 
    addMessage, 
    initializeWithWelcome, 
    markMessageAsSaved, 
    updateMessageOnError,
    pendingMessages 
  } = useChatMessages();
  
  const [inputValue, setInputValue] = useState('');
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isEnhancedMode, setIsEnhancedMode] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-2025-04-14');

  const { trackEvent } = useAnalytics({
    component: 'EnhancedChatInterface',
    trackClicks: true,
    trackPageViews: true
  });

  // Initialize with enhanced welcome message
  useEffect(() => {
    if (!currentConversation && messages.length === 0 && user) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        text: `🌟 Bună ziua! Sunt asistentul dvs. cuantic avansat cu AI îmbunătățit. Offer răspunsuri contextualizate, personalizate și inteligente pentru 10 funcții cuantice hibride.\n\n🧠 Funcții AI avansate:\n• Răspunsuri contextuale bazate pe conversație\n• Personalizare automată\n• Cache inteligent pentru performanță\n• Streaming în timp real\n\n${newsContext ? `📰 ${newsContext}` : ''}\n\nCu ce vă pot ajuta astăzi?`,
        isBot: true,
        timestamp: new Date()
      };
      initializeWithWelcome(welcomeMessage);
    }
  }, [currentConversation, user, messages.length, newsContext]);

  const sendEnhancedMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    addMessage(userMessage, true);
    const messageToProcess = inputValue;
    setInputValue('');

    // Save user message
    saveMessage(
      userMessage, 
      currentConversation?.id,
      () => markMessageAsSaved(userMessage.id),
      (error) => updateMessageOnError(userMessage.id, 'Failed to send message')
    );

    // Generate AI response with selected provider
    setTimeout(async () => {
      try {
        const botResponseText = await generateResponseWithProvider(
          messageToProcess,
          { provider: selectedProvider, model: selectedModel },
          currentConversation?.id
        );
        
        const finalBotMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          isBot: true,
          timestamp: new Date()
        };
        
        addMessage(finalBotMessage, true);
        markMessageAsSaved(finalBotMessage.id);
      } catch (error) {
        console.error('Enhanced response error:', error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `🔧 Sistemul AI ${selectedProvider} întâmpină dificultăți tehnice. Vă rugăm să încercați cu alt provider sau să verificați configurația.`,
          isBot: true,
          timestamp: new Date()
        };
        addMessage(errorMessage, false);
      }
    }, 300);
  };

  const handleQuickAction = (action: string) => {
    trackEvent('enhanced_quick_action', { action, enhanced_mode: isEnhancedMode });
    setInputValue(action);
    setTimeout(() => sendEnhancedMessage(), 100);
  };

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Brain className="w-8 h-8 text-cyan-400 animate-pulse" />
            <p className="text-white">Se încarcă sistemul AI avansat...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Asistent Cuantic AI Avansat</h2>
        <Badge variant="outline" className="border-green-400 text-green-400">
          <Brain className="w-3 h-3 mr-1" />
          AI Enhanced
        </Badge>
        <Badge variant="outline" className="border-purple-400 text-purple-400">
          <Sparkles className="w-3 h-3 mr-1" />
          Contextual
        </Badge>
        {/* {conversationContext.topics.length > 0 && (
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            Context: {conversationContext.topics.slice(-2).join(', ')}
          </Badge>
        )}
        {isStreaming && (
          <Badge variant="outline" className="border-yellow-400 text-yellow-400 animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            Streaming
          </Badge>
        )} */}
      </div>

      <AIProviderSelector
        selectedProvider={selectedProvider}
        selectedModel={selectedModel}
        onProviderChange={setSelectedProvider}
        onModelChange={setSelectedModel}
        disabled={!user || isGenerating}
      />

      <div className="flex items-center gap-2 mb-4">
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input 
            type="checkbox" 
            checked={isEnhancedMode}
            onChange={(e) => setIsEnhancedMode(e.target.checked)}
            className="rounded"
          />
          Mod AI Avansat
        </label>
        {/* <span className="text-xs text-gray-400">
          Context: {conversationContext.recentMessages.length} mesaje | 
          Topicuri: {conversationContext.topics.length}
        </span> */}
      </div>
      
      <VirtualizedMessageList 
        messages={messages} 
        pendingMessages={pendingMessages}
        streamingMessage={streamingMessage}
      />

      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={sendEnhancedMessage}
        disabled={!user || isGenerating}
        placeholder={isEnhancedMode ? 
          "Întrebați cu context avansat despre quantum computing..." : 
          "Întrebați despre quantum computing..."
        }
      />

      <QuickActions 
        onActionClick={handleQuickAction}
        disabled={!user || isGenerating}
        enhanced={isEnhancedMode}
      />
    </Card>
  );
};
