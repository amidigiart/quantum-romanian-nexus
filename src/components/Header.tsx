
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Atom, Zap } from 'lucide-react';

export const Header = () => {
  return (
    <header className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="relative">
          <Atom className="w-12 h-12 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-xl animate-pulse" />
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          Chatbot Cuantic Român
        </h1>
      </div>
      <p className="text-xl text-blue-200 mb-2">Inteligență Artificială Cuantică cu Monitorizare IoT</p>
      <Badge variant="outline" className="border-cyan-400 text-cyan-400">
        <Zap className="w-4 h-4 mr-1" />
        Sistem Activ
      </Badge>
    </header>
  );
};
