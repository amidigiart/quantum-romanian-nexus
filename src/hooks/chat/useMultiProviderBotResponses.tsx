
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuantumNews } from '@/hooks/useQuantumNews';
import { advancedCacheService } from '@/services/advancedCacheService';

export interface AIProviderConfig {
  provider: string;
  model: string;
}

interface EnhancedContext {
  recentMessages: string[];
  topics: string[];
  userPreferences: string[];
  userExpertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredResponseStyle: 'detailed' | 'concise' | 'technical';
}

export const useMultiProviderBotResponses = () => {
  const { user } = useAuth();
  const { getNewsResponse, newsContext } = useQuantumNews();
  const [isGenerating, setIsGenerating] = useState(false);
  const [contextualResponses, setContextualResponses] = useState<Map<string, string>>(new Map());

  const generateResponseWithProvider = useCallback(async (
    message: string,
    config: AIProviderConfig,
    conversationId?: string,
    enhancedContext?: EnhancedContext
  ): Promise<string> => {
    setIsGenerating(true);
    
    try {
      // Enhanced cache key that includes provider, model, and context
      const contextKey = generateEnhancedCacheKey(message, config, enhancedContext);
      const cachedResponse = await advancedCacheService.get<string>(
        contextKey,
        ['chat-response', 'multi-provider', config.provider, enhancedContext?.userExpertiseLevel || 'intermediate']
      );

      if (cachedResponse) {
        setIsGenerating(false);
        return cachedResponse;
      }

      // Check for news responses first (local processing)
      const newsResponse = getNewsResponse(message);
      if (newsResponse && config.provider !== 'perplexity') {
        const enhancedNewsResponse = enhanceNewsWithContext(newsResponse, enhancedContext);
        setIsGenerating(false);
        return enhancedNewsResponse;
      }

      // Call the multi-provider edge function with enhanced context
      const { data, error } = await supabase.functions.invoke('multi-provider-chat', {
        body: {
          message,
          provider: config.provider,
          model: config.model,
          conversationId,
          userId: user?.id,
          enhancedContext: enhancedContext || null,
          contextualHints: generateContextualHints(message, enhancedContext)
        }
      });

      if (error) {
        console.error(`Error with ${config.provider}:`, error);
        return generateContextualFallbackResponse(message, config, enhancedContext);
      }

      const response = data.response;
      
      // Enhanced post-processing based on context
      const finalResponse = await postProcessResponse(response, enhancedContext, config);
      
      // Cache with enhanced context tags
      const cacheTags = [
        'chat-response', 
        'multi-provider', 
        config.provider,
        enhancedContext?.userExpertiseLevel || 'intermediate',
        enhancedContext?.preferredResponseStyle || 'detailed'
      ];
      
      await advancedCacheService.set(
        contextKey,
        finalResponse,
        12 * 60 * 1000, // 12 minutes
        cacheTags,
        'medium'
      );

      // Store in contextual responses for learning
      setContextualResponses(prev => new Map(prev.set(message.substring(0, 50), finalResponse)));

      setIsGenerating(false);
      return finalResponse;
    } catch (error) {
      console.error('Multi-provider response error:', error);
      setIsGenerating(false);
      return generateContextualFallbackResponse(message, config, enhancedContext);
    }
  }, [user, getNewsResponse]);

  const generateContextualFallbackResponse = (
    message: string, 
    config: AIProviderConfig, 
    context?: EnhancedContext
  ): string => {
    const lowerMessage = message.toLowerCase();
    const expertise = context?.userExpertiseLevel || 'intermediate';
    const style = context?.preferredResponseStyle || 'detailed';
    
    let baseResponse = '';
    
    if (lowerMessage.includes('algoritm') || lowerMessage.includes('quantum')) {
      if (expertise === 'beginner') {
        baseResponse = `Sistemul cuantic implementează algoritmi accesibili începătorilor folosind ${config.provider} ${config.model}. Grover ajută la căutări rapide, Shor la securitate, iar QAOA la găsirea soluțiilor optime.`;
      } else if (expertise === 'advanced') {
        baseResponse = `Platformă cuantică avansată cu ${config.provider} ${config.model}: implementări Grover O(√N), Shor cu QFT optimizat, QAOA variațional, VQE pentru sisteme moleculare, plus QML cu quantum advantage demonstrabil.`;
      } else {
        baseResponse = `Sistemul cuantic implementează 10 algoritmi folosind ${config.provider} ${config.model}. Grover pentru căutare O(√N), Shor pentru factorizare, QAOA pentru optimizare, și multe altele.`;
      }
    } else {
      baseResponse = `Înțeleg întrebarea dvs. despre computarea cuantică. Sistemul folosește ${config.provider} cu modelul ${config.model} pentru răspunsuri de înaltă calitate.`;
    }
    
    // Adjust for response style
    if (style === 'concise') {
      baseResponse = baseResponse.split('.')[0] + '.';
    } else if (style === 'technical' && expertise === 'advanced') {
      baseResponse += '\n\nDetalii tehnice: Implementarea include optimizări pentru reducerea erorii cuantice și maximizarea fidelității gate-urilor.';
    }
    
    // Add contextual topics if available
    if (context?.topics.length) {
      const recentTopics = context.topics.slice(-2).join(' și ');
      baseResponse += `\n\nContinuând tematica ${recentTopics}, cu ce aspect vă pot ajuta în continuare?`;
    } else {
      baseResponse += '\n\nCu ce anume vă pot ajuta?';
    }
    
    return baseResponse;
  };

  return {
    generateResponseWithProvider,
    isGenerating,
    newsContext,
    contextualResponses
  };
};

// Helper functions
function generateEnhancedCacheKey(
  message: string, 
  config: AIProviderConfig, 
  context?: EnhancedContext
): string {
  const messageHash = message.toLowerCase().substring(0, 50);
  const providerKey = `${config.provider}-${config.model}`;
  const contextHash = context ? 
    `${context.userExpertiseLevel}-${context.preferredResponseStyle}-${context.topics.slice(-2).join('-')}` : 
    'default';
  
  return `multi-provider:${providerKey}:${messageHash}:${contextHash}`;
}

function enhanceNewsWithContext(newsResponse: string, context?: EnhancedContext): string {
  if (!context) return newsResponse;
  
  let enhanced = newsResponse;
  
  // Add expertise-appropriate context
  if (context.userExpertiseLevel === 'beginner') {
    enhanced += '\n\n💡 Pentru începători: Aceste dezvoltări demonstrează progresul rapid în quantum computing.';
  } else if (context.userExpertiseLevel === 'advanced') {
    enhanced += '\n\n🔬 Perspective avansate: Aceste breakthroughs au implicații directe pentru scalabilitatea sistemelor cuantice.';
  }
  
  // Adjust for response style
  if (context.preferredResponseStyle === 'concise') {
    enhanced = enhanced.split('\n\n')[0]; // Keep only main content
  }
  
  return enhanced;
}

function generateContextualHints(message: string, context?: EnhancedContext): string[] {
  const hints: string[] = [];
  
  if (context) {
    hints.push(`User expertise: ${context.userExpertiseLevel}`);
    hints.push(`Preferred style: ${context.preferredResponseStyle}`);
    
    if (context.topics.length > 0) {
      hints.push(`Recent topics: ${context.topics.slice(-3).join(', ')}`);
    }
    
    if (context.userPreferences.length > 0) {
      hints.push(`User preferences: ${context.userPreferences.slice(-2).join(', ')}`);
    }
  }
  
  return hints;
}

async function postProcessResponse(
  response: string, 
  context?: EnhancedContext, 
  config?: AIProviderConfig
): Promise<string> {
  if (!context) return response;
  
  let processed = response;
  
  // Add provider-specific enhancements
  if (config?.provider === 'perplexity' && !processed.includes('🔗')) {
    processed += '\n\n🔗 Informații actualizate din surse web recente.';
  }
  
  // Add contextual learning indicators
  if (context.userExpertiseLevel === 'beginner' && processed.length > 300) {
    processed += '\n\n📚 Recomand să explorați aceste concepte pas cu pas pentru o înțelegere optimă.';
  }
  
  return processed;
}
