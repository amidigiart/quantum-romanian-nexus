
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot, Newspaper, Zap, Sparkles } from 'lucide-react';

interface ChatHeaderProps {
  useEnhancedMode: boolean;
  cacheHitRate: number;
  lastUpdated?: Date;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  useEnhancedMode,
  cacheHitRate,
  lastUpdated
}) => {
  return (
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
      {useEnhancedMode && (
        <Badge variant="outline" className="border-cyan-400 text-cyan-400">
          <Sparkles className="w-3 h-3 mr-1" />
          AI Enhanced
        </Badge>
      )}
      {cacheHitRate > 0 && (
        <Badge variant="outline" className="border-purple-400 text-purple-400">
          <Zap className="w-3 h-3 mr-1" />
          Cache: {cacheHitRate.toFixed(0)}%
        </Badge>
      )}
      {lastUpdated && (
        <Badge variant="outline" className="border-cyan-400 text-cyan-400 ml-auto">
          <Newspaper className="w-3 h-3 mr-1" />
          Știri: {lastUpdated.toLocaleTimeString('ro-RO')}
        </Badge>
      )}
    </div>
  );
};
