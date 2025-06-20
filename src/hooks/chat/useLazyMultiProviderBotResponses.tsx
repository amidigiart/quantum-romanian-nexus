
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { enhancedRequestDeduplicationService } from '@/services/enhancedRequestDeduplicationService';

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
    const requestContext = {
      provider: config.provider,
      model: config.model,
      userId: user?.id,
      conversationId,
      userExpertiseLevel: 'intermediate', // Could be dynamic
      preferredResponseStyle: 'detailed' // Could be dynamic
    };

    // Use enhanced request deduplication with fingerprinting
    return enhancedRequestDeduplicationService.deduplicateRequest(
      message,
      async () => {
        setIsGenerating(true);
        
        try {
          // Simulate API call - in practice this would call your backend
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
          throw new Error(`Error generating response with ${config.provider}: ${error}`);
        } finally {
          setIsGenerating(false);
        }
      },
      requestContext,
      user?.id
    );
  }, [user]);

  const isRequestPending = useCallback((message: string, config: AIProviderConfig, conversationId?: string) => {
    const requestContext = {
      provider: config.provider,
      model: config.model,
      userId: user?.id,
      conversationId,
      userExpertiseLevel: 'intermediate',
      preferredResponseStyle: 'detailed'
    };
    return enhancedRequestDeduplicationService.isRequestPending(message, requestContext, user?.id);
  }, [user]);

  const cancelRequest = useCallback((message: string, config: AIProviderConfig, conversationId?: string) => {
    const requestContext = {
      provider: config.provider,
      model: config.model,
      userId: user?.id,
      conversationId,
      userExpertiseLevel: 'intermediate',
      preferredResponseStyle: 'detailed'
    };
    enhancedRequestDeduplicationService.cancelRequest(message, requestContext, user?.id);
  }, [user]);

  const getDeduplicationStats = useCallback(() => {
    return enhancedRequestDeduplicationService.getDetailedStats();
  }, []);

  return {
    generateResponseWithProvider,
    isGenerating,
    isRequestPending,
    cancelRequest,
    getPendingRequestsCount: () => enhancedRequestDeduplicationService.getPendingRequestsCount(),
    getDeduplicationStats
  };
};
