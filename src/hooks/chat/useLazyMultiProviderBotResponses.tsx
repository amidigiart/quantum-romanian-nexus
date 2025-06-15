
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface AIProviderConfig {
  provider: string;
  model: string;
}

export const useLazyMultiProviderBotResponses = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateResponseWithProvider = useCallback(async (
    message: string,
    config: AIProviderConfig,
    conversationId?: string
  ): Promise<string> => {
    setIsGenerating(true);
    
    try {
      // Lazy load the multi-provider hook only when needed
      const { useMultiProviderBotResponses } = await import('./useMultiProviderBotResponses');
      
      // This is a simplified version - in practice you'd want to implement the core logic here
      // without importing the full hook to avoid circular dependencies
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          provider: config.provider,
          model: config.model,
          conversationId,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();
      return data.response || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Lazy multi-provider response error:', error);
      return `Error generating response with ${config.provider}: ${error}`;
    } finally {
      setIsGenerating(false);
    }
  }, [user]);

  return {
    generateResponseWithProvider,
    isGenerating
  };
};
