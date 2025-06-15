import { useState } from 'react';
import { usePersonalization } from '@/contexts/PersonalizationContext';
import { useEnhancedBotResponses } from './useEnhancedBotResponses';
import { useConversationContext } from './useConversationContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePersonalizedBotResponses = () => {
  const { user } = useAuth();
  const { personalizationData, getPersonalizedResponse, trackInteraction } = usePersonalization();
  const { generateEnhancedBotResponse } = useEnhancedBotResponses();
  const { conversationContext } = useConversationContext();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePersonalizedResponse = async (
    message: string,
    conversationId?: string
  ): Promise<string> => {
    setIsGenerating(true);
    trackInteraction('personalized_response');

    try {
      // Generate base response using enhanced bot
      let baseResponse = await generateEnhancedBotResponse(message, conversationId);

      // Apply personalization based on user settings
      baseResponse = applyPersonalizationFilters(baseResponse, message);

      // Get final personalized response
      const personalizedResponse = getPersonalizedResponse(baseResponse, message);

      // Save personalized interaction data
      if (conversationId && user) {
        await savePersonalizedInteraction(message, personalizedResponse, conversationId);
      }

      return personalizedResponse;
    } catch (error) {
      console.error('Error generating personalized response:', error);
      return 'Sorry, I encountered an issue while personalizing your response. Please try again.';
    } finally {
      setIsGenerating(false);
    }
  };

  const applyPersonalizationFilters = (response: string, userMessage: string): string => {
    let filteredResponse = response;

    // Adjust response length based on preference
    switch (personalizationData.responseLength) {
      case 'concise':
        // Truncate to first paragraph and key points
        const sentences = filteredResponse.split('. ');
        filteredResponse = sentences.slice(0, 3).join('. ') + '.';
        break;
      case 'comprehensive':
        // Add additional context and examples
        if (!filteredResponse.includes('exemplu') && personalizationData.adaptiveSettings.personalizeExamples) {
          filteredResponse += '\n\n📝 Exemplu practic: [Contextul va fi personalizat bazat pe preferințele dvs.]';
        }
        break;
      case 'detailed':
        // Keep as is - this is the default
        break;
    }

    // Adjust complexity based on learning level
    if (personalizationData.adaptiveSettings.autoAdjustComplexity) {
      switch (personalizationData.learningLevel) {
        case 'beginner':
          filteredResponse = simplifyTechnicalTerms(filteredResponse);
          break;
        case 'advanced':
          filteredResponse = enhanceWithTechnicalDetails(filteredResponse);
          break;
      }
    }

    // Add related topics suggestions if enabled
    if (personalizationData.adaptiveSettings.suggestRelatedTopics) {
      const relatedTopics = generateRelatedTopics(userMessage, personalizationData.preferredTopics);
      if (relatedTopics.length > 0) {
        filteredResponse += `\n\n🔗 Topicuri conexe: ${relatedTopics.join(', ')}`;
      }
    }

    return filteredResponse;
  };

  const simplifyTechnicalTerms = (response: string): string => {
    const technicalReplacements = {
      'superpoziție cuantică': 'starea în care un qubit poate fi 0 și 1 simultan',
      'entanglement': 'conectarea cuantică între particule',
      'decoerență': 'pierderea proprietăților cuantice',
      'O(√N)': 'complexitate redusă comparativ cu algoritmii clasici',
      'Hamiltonian': 'operatorul energiei în mecanica cuantică'
    };

    let simplifiedResponse = response;
    Object.entries(technicalReplacements).forEach(([term, explanation]) => {
      if (simplifiedResponse.includes(term)) {
        simplifiedResponse = simplifiedResponse.replace(
          new RegExp(term, 'g'),
          `${term} (${explanation})`
        );
      }
    });

    return simplifiedResponse;
  };

  const enhanceWithTechnicalDetails = (response: string): string => {
    let enhancedResponse = response;

    // Add mathematical notation and precise complexity
    if (response.includes('Grover')) {
      enhancedResponse += '\n\n🔬 Detalii tehnice: Complexitatea O(√N) vs O(N) pentru căutarea clasică.';
    }

    if (response.includes('criptograf')) {
      enhancedResponse += '\n\n🔐 Protocol BB84: Utilizează 4 stări cuantice pentru transmisia sigură a cheilor.';
    }

    return enhancedResponse;
  };

  const generateRelatedTopics = (message: string, preferredTopics: string[]): string[] => {
    const topicMap: Record<string, string[]> = {
      'grover': ['Shor algorithm', 'Quantum search', 'Database queries'],
      'shor': ['RSA encryption', 'Grover search', 'Quantum factoring'],
      'cryptography': ['BB84 protocol', 'Quantum key distribution', 'Security'],
      'machine learning': ['QNN', 'QSVM', 'Quantum advantage'],
      'optimization': ['QAOA', 'VQE', 'Combinatorial problems']
    };

    const messageLower = message.toLowerCase();
    const related: string[] = [];

    preferredTopics.forEach(topic => {
      if (topicMap[topic] && messageLower.includes(topic)) {
        related.push(...topicMap[topic]);
      }
    });

    return [...new Set(related)].slice(0, 3);
  };

  const savePersonalizedInteraction = async (
    userMessage: string,
    botResponse: string,
    conversationId: string
  ) => {
    try {
      await supabase
        .from('personalized_interactions')
        .insert({
          user_id: user?.id,
          conversation_id: conversationId,
          user_message: userMessage,
          bot_response: botResponse,
          personalization_applied: {
            communication_style: personalizationData.communicationStyle,
            learning_level: personalizationData.learningLevel,
            response_length: personalizationData.responseLength,
            adaptive_settings: personalizationData.adaptiveSettings
          },
          context_data: {
            conversation_context: conversationContext,
            preferred_topics: personalizationData.preferredTopics
          }
        });
    } catch (error) {
      console.error('Error saving personalized interaction:', error);
    }
  };

  return {
    generatePersonalizedResponse,
    isGenerating,
    personalizationData
  };
};
