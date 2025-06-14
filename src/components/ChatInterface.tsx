import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Info, Atom, Microchip, User, Brain, Shield, Calculator } from 'lucide-react';

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
      text: 'Bună ziua! Sunt asistentul dvs. cuantic avansat. Pot să vă ajut cu 10 funcții cuantice hibride: algoritmi Grover/Shor, criptografie cuantică, învățare automată cuantică, optimizare QAOA, simulare VQE, și multe altele. Cu ce vă pot ajuta?',
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
    
    if (lowerMessage.includes('algoritm') || lowerMessage.includes('grover') || lowerMessage.includes('shor')) {
      return 'Am implementat 10 algoritmi cuantici avansați: Grover pentru căutare (O(√N)), Shor pentru factorizare (O((log N)³)), QAOA pentru optimizare, VQE pentru energie, QML pentru învățare automată, QRNG pentru generare aleatoare, QFT pentru transformate, QEC pentru corecția erorilor, simulare cuantică, și optimizare de portofoliu. Care vă interesează?';
    } else if (lowerMessage.includes('criptograf') || lowerMessage.includes('securitate') || lowerMessage.includes('bb84')) {
      return 'Sistemul de criptografie cuantică suportă protocoloale BB84, E91, și SARG04 pentru distribuirea securizată a cheilor. Oferim criptare cuantică cu detectarea automată a interceptărilor și rate de securitate de 99.9%. Toate comunicațiile sunt protejate prin principiile mecanicii cuantice.';
    } else if (lowerMessage.includes('machine learning') || lowerMessage.includes('învățare') || lowerMessage.includes('ml') || lowerMessage.includes('neural')) {
      return 'Quantum Machine Learning include: Variational Quantum Classifier pentru clasificare, Quantum Neural Networks pentru regresie, QSVM pentru vectori suport cuantici, și QGAN pentru generarea datelor. Avantajul cuantic oferă accelerare exponențială pentru anumite probleme de optimizare.';
    } else if (lowerMessage.includes('optimizare') || lowerMessage.includes('qaoa') || lowerMessage.includes('vqe')) {
      return 'Algoritmii de optimizare cuantică includ QAOA pentru probleme combinatoriale și VQE pentru calculul energiei stării fundamentale. Aceștia folosesc circuite cuantice variaționale pentru a găsi soluții optime mai rapid decât metodele clasice.';
    } else if (lowerMessage.includes('simulare') || lowerMessage.includes('hamiltonian')) {
      return 'Simulatorul cuantic poate modela sisteme cuantice complexe: hamiltonieni moleculari, dinamica spină, transportul cuantic, și tranziții de fază. Folosim algoritmi Trotter-Suzuki pentru evoluția temporală și metode Monte Carlo cuantice.';
    } else if (lowerMessage.includes('status') || lowerMessage.includes('stare')) {
      return 'Sistemul cuantic hibrid funcționează la capacitate maximă: 8 qubits activi, coerență 94.7%, toate algoritmii implementați și funcționali. Criptografia cuantică, ML cuantic, și optimizarea sunt operative. Senzorii IoT transmit date în timp real pentru procesarea cuantică.';
    } else if (lowerMessage.includes('error') || lowerMessage.includes('eroare') || lowerMessage.includes('corecție')) {
      return 'Sistemul de corecție a erorilor cuantice (QEC) folosește coduri de suprafață și coduri Shor pentru a detecta și corecta erorile de decoerență. Implementăm sindroame de eroare și recuperare cuantică automată pentru a menține fidelitatea calculelor.';
    } else if (lowerMessage.includes('random') || lowerMessage.includes('aleator') || lowerMessage.includes('qrng')) {
      return 'Generatorul de numere aleatoare cuantice (QRNG) folosește superpoziția cuantică pentru a produce secvențe cu entropie maximă. Spre deosebire de generatorii pseudo-aleatori clasici, QRNG oferă aleatoritate fundamentală bazată pe măsurători cuantice.';
    } else if (lowerMessage.includes('fourier') || lowerMessage.includes('qft') || lowerMessage.includes('transformată')) {
      return 'Transformata Fourier Cuantică (QFT) este implementată pentru analiza frecvențelor cuantice și ca subrutină în algoritmii Shor și de estimare a fazei. QFT oferă accelerare exponențială pentru anumite probleme de procesare a semnalelor.';
    } else if (lowerMessage.includes('hibrid') || lowerMessage.includes('hybrid')) {
      return 'Sistemul nostru hibrid combină procesarea cuantică cu calculul clasic pentru a optimiza performanța. Folosim circuite cuantice variaționale (VQC) care rulează pe hardware cuantic, dar optimizarea parametrilor se face clasic, obținând astfel cel mai bun din ambele lumi.';
    }
    
    return 'Înțeleg întrebarea dvs. despre computarea cuantică avansată. Sistemul nostru implementează 10 funcții cuantice hibride principale: algoritmi de căutare și factorizare, criptografie cuantică, învățare automată cuantică, optimizare, simulare, corecția erorilor, și multe altele. Cu ce anume vă pot ajuta?';
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
    { text: 'Algoritmi Cuantici', action: 'Explică-mi algoritmii Grover și Shor' },
    { text: 'Criptografie Cuantică', action: 'Cum funcționează protocolul BB84?' },
    { text: 'Quantum ML', action: 'Care sunt avantajele învățării automate cuantice?' },
    { text: 'Optimizare QAOA', action: 'Explică algoritmul QAOA pentru optimizare' },
    { text: 'Simulare Cuantică', action: 'Cum simulez sisteme cuantice complexe?' },
    { text: 'Status Sistem', action: 'Care este statusul sistemului cuantic hibrid?' }
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
        <h2 className="text-2xl font-bold text-white">Asistent Cuantic Hibrid</h2>
        <Badge variant="outline" className="border-green-400 text-green-400 ml-auto">
          10 Funcții
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

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuickAction(action.action)}
            className="border-white/30 text-white hover:bg-white/20 transition-all hover:scale-105 text-xs"
          >
            {index === 0 && <Calculator className="w-3 h-3 mr-1" />}
            {index === 1 && <Shield className="w-3 h-3 mr-1" />}
            {index === 2 && <Brain className="w-3 h-3 mr-1" />}
            {index === 3 && <Atom className="w-3 h-3 mr-1" />}
            {index === 4 && <Microchip className="w-3 h-3 mr-1" />}
            {index === 5 && <Info className="w-3 h-3 mr-1" />}
            {action.text}
          </Button>
        ))}
      </div>
    </Card>
  );
};
