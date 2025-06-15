
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain, Sparkles } from 'lucide-react';

interface WelcomeMessageProps {
  isEnhanced: boolean;
  newsContext?: string;
}

export const WelcomeMessage = React.memo<WelcomeMessageProps>(({ 
  isEnhanced, 
  newsContext 
}) => {
  return (
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
      {newsContext && (
        <Badge variant="outline" className="border-cyan-400 text-cyan-400 text-xs">
          News Updated
        </Badge>
      )}
    </div>
  );
});

WelcomeMessage.displayName = 'WelcomeMessage';
