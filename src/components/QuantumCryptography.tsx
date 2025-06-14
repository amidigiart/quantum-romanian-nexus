
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Key, Lock, Unlock, Eye, EyeOff, Zap } from 'lucide-react';

interface CryptoResult {
  protocol: string;
  keyLength: number;
  security: string;
  eavesdropping: boolean;
  timestamp: Date;
}

export const QuantumCryptography = () => {
  const [message, setMessage] = useState('');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [activeProtocol, setActiveProtocol] = useState<string>('bb84');
  const [cryptoResults, setCryptoResults] = useState<CryptoResult[]>([]);
  const [showKeys, setShowKeys] = useState(false);

  const protocols = [
    {
      id: 'bb84',
      name: 'BB84 Protocol',
      description: 'Protocolul Bennett-Brassard 1984',
      security: '99.9%',
      keyRate: '1 Mbps'
    },
    {
      id: 'sarg04',
      name: 'SARG04',
      description: 'Protocol îmbunătățit pentru distanțe mari',
      security: '99.7%',
      keyRate: '800 Kbps'
    },
    {
      id: 'e91',
      name: 'E91 Entanglement',
      description: 'Protocol bazat pe entanglement cuantic',
      security: '99.95%',
      keyRate: '1.5 Mbps'
    }
  ];

  const generateQuantumKey = () => {
    const protocol = protocols.find(p => p.id === activeProtocol);
    if (!protocol) return;

    const newResult: CryptoResult = {
      protocol: protocol.name,
      keyLength: Math.floor(Math.random() * 512 + 256),
      security: protocol.security,
      eavesdropping: Math.random() < 0.05, // 5% chance of detection
      timestamp: new Date()
    };

    setCryptoResults(prev => [newResult, ...prev.slice(0, 4)]);

    // Simulate key generation delay
    setTimeout(() => {
      if (message) {
        const encrypted = btoa(message).split('').reverse().join('');
        setEncryptedMessage(encrypted);
      }
    }, 1500);
  };

  const quantumEncrypt = () => {
    if (!message.trim()) return;
    
    // Simple demonstration encryption
    const key = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const encrypted = message.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('');
    
    setEncryptedMessage(btoa(encrypted));
    generateQuantumKey();
  };

  const quantumDecrypt = () => {
    if (!encryptedMessage) return;
    
    try {
      const decoded = atob(encryptedMessage);
      // Simple demonstration decryption (reverse of encryption)
      setMessage(decoded);
    } catch {
      setMessage('Eroare la decriptare - cheie incorectă');
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-green-400" />
        <h3 className="text-2xl font-bold text-white">Criptografie Cuantică</h3>
        <Badge variant="outline" className="border-green-400 text-green-400 ml-auto">
          <Zap className="w-3 h-3 mr-1" />
          Securitate Cuantică
        </Badge>
      </div>

      {/* Protocol Selection */}
      <div className="mb-6">
        <h4 className="text-white mb-3">Protocol de Distribuire a Cheilor:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {protocols.map((protocol) => (
            <Button
              key={protocol.id}
              variant={activeProtocol === protocol.id ? "default" : "outline"}
              onClick={() => setActiveProtocol(protocol.id)}
              className={`flex flex-col items-start gap-1 p-4 h-auto ${
                activeProtocol === protocol.id 
                  ? 'bg-gradient-to-r from-green-500 to-blue-500' 
                  : 'border-white/30 text-white hover:bg-white/20'
              }`}
            >
              <span className="font-semibold text-sm">{protocol.name}</span>
              <span className="text-xs opacity-80">{protocol.description}</span>
              <div className="flex justify-between w-full mt-1">
                <span className="text-xs">Securitate: {protocol.security}</span>
                <span className="text-xs">Rate: {protocol.keyRate}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Message Encryption */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-white mb-2">Mesaj Original:</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduceți mesajul pentru criptare cuantică..."
            className="bg-white/20 border-white/30 text-white placeholder-gray-300 min-h-[100px]"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={quantumEncrypt}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Lock className="w-4 h-4 mr-1" />
              Criptează
            </Button>
            <Button
              onClick={() => setMessage('')}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/20"
            >
              Resetează
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-white mb-2">Mesaj Criptat:</label>
          <Textarea
            value={encryptedMessage}
            onChange={(e) => setEncryptedMessage(e.target.value)}
            placeholder="Mesajul criptat va apărea aici..."
            className="bg-black/30 border-white/30 text-green-400 placeholder-gray-500 min-h-[100px] font-mono text-sm"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={quantumDecrypt}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Unlock className="w-4 h-4 mr-1" />
              Decriptează
            </Button>
            <Button
              onClick={() => setShowKeys(!showKeys)}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/20"
            >
              {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Quantum Key Distribution Results */}
      <div className="bg-black/30 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold">Distribuire Chei Cuantice:</h4>
          <Button
            onClick={generateQuantumKey}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Key className="w-3 h-3 mr-1" />
            Generează Cheie
          </Button>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {cryptoResults.length > 0 ? (
            cryptoResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  result.eavesdropping ? 'bg-red-600/20 border border-red-400/30' : 'bg-green-600/20'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-cyan-400 font-medium text-sm">{result.protocol}</span>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs border-green-400 text-green-400"
                    >
                      {result.keyLength} biți
                    </Badge>
                    {result.eavesdropping && (
                      <Badge
                        variant="outline"
                        className="text-xs border-red-400 text-red-400"
                      >
                        Interceptare Detectată!
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-300">
                  <span>Securitate: {result.security}</span>
                  <span>{result.timestamp.toLocaleTimeString()}</span>
                </div>
                {showKeys && (
                  <div className="mt-2 p-2 bg-black/50 rounded text-xs font-mono text-green-400">
                    Cheie: {Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">
              Generați o cheie cuantică pentru a începe...
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
