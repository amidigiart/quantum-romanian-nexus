
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, Clock, TrendingUp, User } from 'lucide-react';

interface ResponseMetrics {
  responseTime: number;
  cacheHit: boolean;
  qualityScore: number;
  contextRelevance: number;
  userSatisfactionPrediction: number;
}

interface ConversationContext {
  recentMessages: string[];
  topics: string[];
  userPreferences: string[];
  conversationFlow: Array<{ question: string; response: string; timestamp: Date }>;
  userExpertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredResponseStyle: 'detailed' | 'concise' | 'technical';
}

interface ResponseQualityIndicatorProps {
  metrics: ResponseMetrics | null;
  context: ConversationContext;
  isVisible?: boolean;
}

export const ResponseQualityIndicator: React.FC<ResponseQualityIndicatorProps> = ({
  metrics,
  context,
  isVisible = false
}) => {
  if (!isVisible || !metrics) return null;

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400 border-green-400/50';
    if (score >= 0.6) return 'text-yellow-400 border-yellow-400/50';
    return 'text-red-400 border-red-400/50';
  };

  const getExpertiseColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-cyan-400" />
        <span className="text-sm font-medium text-white">Context & Quality Analytics</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Target className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Quality</span>
          </div>
          <div className={`text-sm font-medium ${getQualityColor(metrics.qualityScore)}`}>
            {Math.round(metrics.qualityScore * 100)}%
          </div>
          <Progress value={metrics.qualityScore * 100} className="h-1" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Context</span>
          </div>
          <div className={`text-sm font-medium ${getQualityColor(metrics.contextRelevance)}`}>
            {Math.round(metrics.contextRelevance * 100)}%
          </div>
          <Progress value={metrics.contextRelevance * 100} className="h-1" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Speed</span>
          </div>
          <div className="text-sm font-medium text-cyan-400">
            {Math.round(metrics.responseTime)}ms
          </div>
          <Badge variant="outline" className={metrics.cacheHit ? 'border-green-400/50 text-green-400' : 'border-yellow-400/50 text-yellow-400'}>
            {metrics.cacheHit ? 'Cached' : 'Generated'}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">Satisfaction</span>
          </div>
          <div className={`text-sm font-medium ${getQualityColor(metrics.userSatisfactionPrediction)}`}>
            {Math.round(metrics.userSatisfactionPrediction * 100)}%
          </div>
          <Progress value={metrics.userSatisfactionP prediction * 100} className="h-1" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className={getExpertiseColor(context.userExpertiseLevel)}>
          {context.userExpertiseLevel}
        </Badge>
        <Badge variant="outline" className="border-purple-400/50 text-purple-400">
          {context.preferredResponseStyle}
        </Badge>
        {context.topics.slice(-3).map((topic, index) => (
          <Badge key={index} variant="outline" className="border-cyan-400/50 text-cyan-400 text-xs">
            {topic}
          </Badge>
        ))}
        <Badge variant="outline" className="border-gray-400/50 text-gray-400 text-xs">
          {context.conversationFlow.length} interactions
        </Badge>
      </div>
    </div>
  );
};
