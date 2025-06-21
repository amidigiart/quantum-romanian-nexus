import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { enhancedRequestDeduplicationService } from '@/services/enhancedRequestDeduplicationService';
import { intelligentRequestCancellationService } from '@/services/intelligentRequestCancellationService';
import { priorityRequestService } from '@/services/priorityRequestService';

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
    conversationId?: string,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal'
  ): Promise<string> => {
    const requestContext = {
      provider: config.provider,
      model: config.model,
      userId: user?.id,
      conversationId,
      userExpertiseLevel: 'intermediate',
      preferredResponseStyle: 'detailed'
    };

    // Use enhanced request deduplication with priority support
    return enhancedRequestDeduplicationService.deduplicateRequestWithPriority(
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
              userId: user?.id,
              priority
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
      priority,
      requestContext,
      user?.id
    );
  }, [user]);

  // Convenience methods for different priorities
  const generateCriticalResponse = useCallback((
    message: string,
    config: AIProviderConfig,
    conversationId?: string
  ) => {
    return generateResponseWithProvider(message, config, conversationId, 'critical');
  }, [generateResponseWithProvider]);

  const generateHighPriorityResponse = useCallback((
    message: string,
    config: AIProviderConfig,
    conversationId?: string
  ) => {
    return generateResponseWithProvider(message, config, conversationId, 'high');
  }, [generateResponseWithProvider]);

  const generateLowPriorityResponse = useCallback((
    message: string,
    config: AIProviderConfig,
    conversationId?: string
  ) => {
    return generateResponseWithProvider(message, config, conversationId, 'low');
  }, [generateResponseWithProvider]);

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

  const cancelAllUserRequests = useCallback(() => {
    if (user?.id) {
      const cancelledCount = enhancedRequestDeduplicationService.cancelUserRequests(user.id);
      console.log(`Cancelled ${cancelledCount} requests for user ${user.id}`);
      return cancelledCount;
    }
    return 0;
  }, [user]);

  const cancelConversationRequests = useCallback((conversationId: string) => {
    const cancelledCount = enhancedRequestDeduplicationService.cancelConversationRequests(conversationId);
    console.log(`Cancelled ${cancelledCount} requests for conversation ${conversationId}`);
    return cancelledCount;
  }, []);

  const getDeduplicationStats = useCallback(() => {
    return enhancedRequestDeduplicationService.getDetailedStats();
  }, []);

  const getCancellationStats = useCallback(() => {
    return intelligentRequestCancellationService.getCancellationStats();
  }, []);

  const getPriorityQueueStats = useCallback(() => {
    return priorityRequestService.getDetailedStats();
  }, []);

  return {
    generateResponseWithProvider,
    generateCriticalResponse,
    generateHighPriorityResponse,
    generateLowPriorityResponse,
    isGenerating,
    isRequestPending,
    cancelRequest,
    cancelAllUserRequests,
    cancelConversationRequests,
    getPendingRequestsCount: () => enhancedRequestDeduplicationService.getPendingRequestsCount(),
    getDeduplicationStats,
    getCancellationStats,
    getPriorityQueueStats
  };
};
