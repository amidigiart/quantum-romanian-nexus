
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Info, Atom, Microchip, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Bună ziua! Sunt asistentul dvs. cuantic. Cum vă pot ajuta astăzi cu simulările cuantice sau monitorizarea senzorilor IoT?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('status') || lowerMessage.includes('stare')) {
      return 'Sistemul cuantic funcționează optimal cu 8 qubits activi și o coerență de 94.7%. Toate senzorii IoT sunt conectați și transmit date în timp real. Performanțele sunt excelente!';
    } else if (lowerMessage.includes('cuantic') || lowerMessage.includes('quantum')) {
      return 'Am inițializat o simulare cuantică cu 4 qubits în superpoziție. Circuitul curent folosește porți Hadamard și CNOT pentru a crea entanglement cuantic. Probabilitățile de măsurare sunt distribuite uniform.';
    } else if (lowerMessage.includes('senzor') || lowerMessage.includes('iot')) {
      return 'Senzorii IoT raportează: Temperatură 22.3°C (normal), Umiditate 65.8% (optimal), Presiune 1013 hPa (stabil), Mișcare detectată (activă). Toate parametrii sunt în limite normale.';
    } else if (lowerMessage.includes('algoritm') || lowerMessage.includes('ai')) {
      return 'Algoritmii de inteligență artificială cuantică utilizează superpozitia și entanglement-ul pentru a procesa informația exponențial mai rapid decât computerele clasice. Implementăm algoritmi Grover și Shor optimizați.';
    } else if (lowerMessage.includes('securitate') || lowerMessage.includes('siguranta')) {
      return 'Sistemul folosește criptografie cuantică pentru securitate maximă. Distribuirea cheilor cuantice și detectarea automată a interceptărilor asigură confidențialitatea datelor IoT.';
    } else if (lowerMessage.includes('simulare') || lowerMessage.includes('circuit')) {
      return 'Simulatorul de circuite cuantice suportă toate porțile cuantice standard: Hadamard, Pauli-X/Y/Z, CNOT, Toffoli. Puteți construi circuite cu până la 16 qubits și vizualiza rezultatele în timp real.';
    }
    
    return 'Înțeleg întrebarea dvs. despre computarea cuantică și IoT. Sistemul nostru combină algoritmi cuantici cu monitorizarea în timp real a senzorilor pentru analize avansate. Cu ce anume vă pot ajuta?';
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response delay
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const quickActions = [
    { text: 'Status Sistem', action: 'Care este statusul sistemului cuantic?' },
    { text: 'Simulare Cuantică', action: 'Inițiază o simulare cuantică nouă' },
    { text: 'Raport Senzori', action: 'Afișează raportul senzorilor IoT' }
  ];

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    setTimeout(() => sendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 quantum-glow">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-6 h-6 text-green-400" />
        <h2 className="text-2xl font-bold text-white">Asistent Cuantic</h2>
        <Badge variant="outline" className="border-green-400 text-green-400 ml-auto">
          Online
        </Badge>
      </div>
      
      {/* Chat Messages */}
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
                  <p className="text-sm leading-relaxed">{message.text}</p>
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

      {/* Chat Input */}
      <div className="flex gap-2 mb-4">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Întrebați despre computarea cuantică, senzori IoT..."
          className="bg-white/20 border-white/30 text-white placeholder-gray-300 focus:ring-cyan-400"
        />
        <Button 
          onClick={sendMessage}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction(action.action)}
            className="border-white/30 text-white hover:bg-white/20 transition-all hover:scale-105"
          >
            {index === 0 && <Info className="w-3 h-3 mr-1" />}
            {index === 1 && <Atom className="w-3 h-3 mr-1" />}
            {index === 2 && <Microchip className="w-3 h-3 mr-1" />}
            {action.text}
          </Button>
        ))}
      </div>
    </Card>
  );
};
