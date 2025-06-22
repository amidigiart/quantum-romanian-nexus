import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { enhancedRequestDeduplicationService } from '@/services/enhancedRequestDeduplicationService';
import { intelligentRequestCancellationService } from '@/services/intelligentRequestCancellationService';
import { priorityRequestService } from '@/services/priorityRequestService';
import { circuitBreakerManager } from '@/services/circuitBreaker';

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

    // Check if circuit breaker is open for this provider
    const circuitBreakerName = `${config.provider}-${config.model}`;
    if (circuitBreakerManager.isCircuitOpen(circuitBreakerName)) {
      throw new Error(`${config.provider} service is temporarily unavailable. Please try a different provider or wait a moment.`);
    }

    // Use priority request service with circuit breaker support
    return priorityRequestService.submitRequest(
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
            throw new Error(`HTTP ${response.status}: Failed to generate response`);
          }

          const data = await response.json();
          return data.response || 'Sorry, I could not generate a response.';
        } catch (error) {
          console.error('Lazy multi-provider response error:', error);
          throw error;
        } finally {
          setIsGenerating(false);
        }
      },
      {
        priority,
        userId: user?.id,
        conversationId,
        context: requestContext,
        useDeduplication: true,
        useCircuitBreaker: true,
        circuitBreakerName
      }
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

  const getCircuitBreakerStats = useCallback(() => {
    return circuitBreakerManager.getAllStats();
  }, []);

  const getProviderCircuitStatus = useCallback((config: AIProviderConfig) => {
    const circuitBreakerName = `${config.provider}-${config.model}`;
    return {
      name: circuitBreakerName,
      isOpen: circuitBreakerManager.isCircuitOpen(circuitBreakerName),
      stats: circuitBreakerManager.getCircuitBreakerStats(circuitBreakerName)
    };
  }, []);

  const resetCircuitBreaker = useCallback((config: AIProviderConfig) => {
    const circuitBreakerName = `${config.provider}-${config.model}`;
    circuitBreakerManager.removeCircuitBreaker(circuitBreakerName);
    console.log(`Reset circuit breaker for ${circuitBreakerName}`);
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
    getPriorityQueueStats,
    getCircuitBreakerStats,
    getProviderCircuitStatus,
    resetCircuitBreaker
  };
};
