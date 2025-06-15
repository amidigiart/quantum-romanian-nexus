
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useConversationContext } from './useConversationContext';
import { useEnhancedResponseGeneration } from './useEnhancedResponseGeneration';

export const usePersonalizedResponses = () => {
  const { user } = useAuth();
  const { conversationContext } = useConversationContext();
  const { generateEnhancedBotResponse } = useEnhancedResponseGeneration();

  const generatePersonalizedResponse = async (message: string): Promise<string> => {
    // Get user preferences from database and context
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    const personalizedContext = {
      ...conversationContext,
      userPreferences: preferences ? [
        preferences.quantum_algorithm_preference,
        preferences.ml_model_preference,
        preferences.theme_preference
      ].filter(Boolean) : conversationContext.userPreferences
    };

    // Update context temporarily for this request
    const response = await generateEnhancedBotResponse(message);
    return response;
  };

  return {
    generatePersonalizedResponse
  };
};
