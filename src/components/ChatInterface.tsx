
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Atom, Newspaper, Zap } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useBotResponses } from '@/hooks/chat/useBotResponses';
import { useChatMessages } from '@/hooks/chat/useChatMessages';
import { useRealtimeChat } from '@/hooks/chat/useRealtimeChat';
import { useAnalytics } from '@/hooks/useAnalytics';
import { VirtualizedMessageList } from '@/components/chat/VirtualizedMessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { QuickActions } from '@/components/chat/QuickActions';
import { PresenceIndicator } from '@/components/chat/PresenceIndicator';
import { TypingHandler } from '@/components/chat/TypingHandler';

export const ChatInterface = () => {
  const { user } = useAuth();
  const { 
    saveMessage, 
    currentConversation,
    loading 
  } = useChat();
  const { generateBotResponse, newsContext, lastUpdated, getCacheStats } = useBotResponses();
  const { 
    messages, 
    addMessage, 
    initializeWithWelcome, 
    markMessageAsSaved, 
    updateMessageOnError,
    pendingMessages 
  } = useChatMessages();
  const [inputValue, setInputValue] = useState('');

  // Analytics integration
  const { 
    componentRef, 
    trackEvent, 
    trackUserAction, 
    trackPerformance,
    trackCacheOperation 
  } = useAnalytics({
    component: 'ChatInterface',
    trackClicks: true,
    trackPageViews: true,
    trackErrors: true
  });

  // Real-time features
  const {
    isConnected,
    onlineUsers,
    typingUsers,
    sendTypingIndicator,
    updatePresenceStatus
  } = useRealtimeChat(currentConversation);

  // Get cache stats for display
  const cacheStats = getCacheStats();

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

  // Handle presence status changes
  useEffect(() => {
    if (inputValue.trim()) {
      updatePresenceStatus('typing');
    } else {
      updatePresenceStatus('online');
    }
  }, [inputValue, updatePresenceStatus]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const startTime = performance.now();
    
    // Track user action
    trackUserAction('message_sent', {
      message_length: inputValue.length,
      has_conversation: !!currentConversation
    });

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    // Optimistically add user message to UI
    addMessage(userMessage, true);
    setInputValue('');

    // Stop typing indicator
    sendTypingIndicator(false);

    // Save message to database in background
    saveMessage(
      userMessage, 
      currentConversation?.id,
      () => {
        markMessageAsSaved(userMessage.id);
        trackEvent('message_saved', { message_id: userMessage.id });
      },
      (error) => {
        updateMessageOnError(userMessage.id, 'Failed to send message');
        trackEvent('message_save_error', { error: error.message });
      }
    );

    // Generate and add bot response using edge function
    setTimeout(async () => {
      try {
        const botResponseStartTime = performance.now();
        const botResponseText = await generateBotResponse(inputValue, currentConversation?.id);
        const botResponseTime = performance.now() - botResponseStartTime;
        
        // Track performance
        trackPerformance('bot_response_generation', botResponseTime, {
          input_length: inputValue.length,
          response_length: botResponseText.length
        });

        // Track cache operation based on response time (heuristic)
        if (botResponseTime < 100) {
          trackCacheOperation('hit', inputValue);
        } else {
          trackCacheOperation('miss', inputValue);
        }
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          isBot: true,
          timestamp: new Date()
        };
        
        // Optimistically add bot message to UI
        addMessage(botMessage, true);
        
        // Mark as saved since edge function handles database saving
        markMessageAsSaved(botMessage.id);
        
        // Track successful bot response
        trackEvent('bot_response_received', {
          response_time: botResponseTime,
          message_id: botMessage.id
        });
      } catch (error) {
        console.error('Error generating bot response:', error);
        
        // Track error
        trackEvent('bot_response_error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          input: inputValue.substring(0, 50) // Truncate for privacy
        });
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: 'Ne pare rău, am întâmpinat o problemă tehnică. Vă rugăm să încercați din nou.',
          isBot: true,
          timestamp: new Date()
        };
        addMessage(errorMessage, false);
      }

      // Track total interaction time
      const totalTime = performance.now() - startTime;
      trackPerformance('complete_message_interaction', totalTime);
    }, 500);
  };

  const handleQuickAction = (action: string) => {
    // Track quick action usage
    trackUserAction('quick_action_used', {
      action,
      action_length: action.length
    });
    
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
    <Card 
      ref={componentRef}
      className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow"
    >
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Asistent Cuantic Hibrid</h2>
        <Badge variant="outline" className="border-green-400 text-green-400">
          10 Funcții
        </Badge>
        <Badge variant="outline" className="border-purple-400 text-purple-400">
          <Zap className="w-3 h-3 mr-1" />
          Edge Powered
        </Badge>
        {cacheStats.hitRate > 0 && (
          <Badge variant="outline" className="border-purple-400 text-purple-400">
            <Zap className="w-3 h-3 mr-1" />
            Cache: {cacheStats.hitRate.toFixed(0)}%
          </Badge>
        )}
        {lastUpdated && (
          <Badge variant="outline" className="border-cyan-400 text-cyan-400 ml-auto">
            <Newspaper className="w-3 h-3 mr-1" />
            Știri: {lastUpdated.toLocaleTimeString('ro-RO')}
          </Badge>
        )}
      </div>

      {/* Real-time presence indicator */}
      <PresenceIndicator 
        onlineUsers={onlineUsers}
        typingUsers={typingUsers}
        isConnected={isConnected}
      />
      
      <VirtualizedMessageList messages={messages} pendingMessages={pendingMessages} />

      {/* Typing indicator handler */}
      <TypingHandler
        onTypingChange={sendTypingIndicator}
        inputValue={inputValue}
        isEnabled={isConnected && !!currentConversation}
      />

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
