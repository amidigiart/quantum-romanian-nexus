
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserPreferences } from '@/hooks/useUserPreferences';

export interface PersonalizationData {
  communicationStyle: 'formal' | 'casual' | 'technical';
  preferredTopics: string[];
  learningLevel: 'beginner' | 'intermediate' | 'advanced';
  responseLength: 'concise' | 'detailed' | 'comprehensive';
  interactionHistory: {
    totalSessions: number;
    averageSessionLength: number;
    mostUsedFeatures: string[];
    preferredTimeOfDay: string;
  };
  adaptiveSettings: {
    autoAdjustComplexity: boolean;
    rememberContext: boolean;
    personalizeExamples: boolean;
    suggestRelatedTopics: boolean;
  };
}

interface PersonalizationContextType {
  personalizationData: PersonalizationData;
  updatePersonalization: (updates: Partial<PersonalizationData>) => Promise<void>;
  getPersonalizedResponse: (baseResponse: string, context: string) => string;
  trackInteraction: (feature: string, duration?: number) => void;
  resetPersonalization: () => Promise<void>;
  isLoading: boolean;
}

const defaultPersonalization: PersonalizationData = {
  communicationStyle: 'casual',
  preferredTopics: [],
  learningLevel: 'intermediate',
  responseLength: 'detailed',
  interactionHistory: {
    totalSessions: 0,
    averageSessionLength: 0,
    mostUsedFeatures: [],
    preferredTimeOfDay: 'any'
  },
  adaptiveSettings: {
    autoAdjustComplexity: true,
    rememberContext: true,
    personalizeExamples: true,
    suggestRelatedTopics: true
  }
};

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData>(defaultPersonalization);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    if (user) {
      loadPersonalizationData();
    }
  }, [user]);

  useEffect(() => {
    if (preferences) {
      syncWithUserPreferences();
    }
  }, [preferences]);

  const loadPersonalizationData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load from localStorage for now since we don't have the database table
      const stored = localStorage.getItem(`personalization_${user.id}`);
      if (stored) {
        const parsedData = JSON.parse(stored);
        setPersonalizationData({
          ...defaultPersonalization,
          ...parsedData
        });
      }
    } catch (error) {
      console.error('Error loading personalization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithUserPreferences = () => {
    if (!preferences) return;

    setPersonalizationData(prev => ({
      ...prev,
      preferredTopics: [
        preferences.quantum_algorithm_preference,
        preferences.ml_model_preference,
        preferences.encryption_protocol
      ].filter(Boolean),
      learningLevel: preferences.preferred_qubit_count > 12 ? 'advanced' : 
                    preferences.preferred_qubit_count > 8 ? 'intermediate' : 'beginner'
    }));
  };

  const updatePersonalization = async (updates: Partial<PersonalizationData>) => {
    if (!user) return;

    const newData = { ...personalizationData, ...updates };
    setPersonalizationData(newData);

    try {
      // Store in localStorage for now
      localStorage.setItem(`personalization_${user.id}`, JSON.stringify(newData));
    } catch (error) {
      console.error('Error updating personalization:', error);
    }
  };

  const getPersonalizedResponse = (baseResponse: string, context: string): string => {
    if (!personalizationData.adaptiveSettings.personalizeExamples) {
      return baseResponse;
    }

    let personalizedResponse = baseResponse;

    // Adjust for communication style
    switch (personalizationData.communicationStyle) {
      case 'formal':
        personalizedResponse = personalizedResponse.replace(/\b(hi|hey)\b/gi, 'Greetings');
        break;
      case 'casual':
        personalizedResponse = personalizedResponse.replace(/\bGreetings\b/gi, 'Hey');
        break;
      case 'technical':
        // Add more technical terminology when appropriate
        break;
    }

    // Adjust for learning level
    if (personalizationData.learningLevel === 'beginner') {
      personalizedResponse = `💡 Explicație simplă: ${personalizedResponse}`;
    } else if (personalizationData.learningLevel === 'advanced') {
      personalizedResponse = `🔬 Detalii tehnice: ${personalizedResponse}`;
    }

    // Add personalized examples based on preferred topics
    if (personalizationData.preferredTopics.length > 0 && context.includes('example')) {
      const preferredTopic = personalizationData.preferredTopics[0];
      personalizedResponse += `\n\n📚 Exemplu personalizat pentru ${preferredTopic}: [exemplu contextual]`;
    }

    return personalizedResponse;
  };

  const trackInteraction = (feature: string, duration?: number) => {
    const currentTime = new Date().getHours();
    const timeOfDay = currentTime < 12 ? 'morning' : currentTime < 18 ? 'afternoon' : 'evening';

    setPersonalizationData(prev => {
      const updatedHistory = {
        ...prev.interactionHistory,
        totalSessions: prev.interactionHistory.totalSessions + 1,
        mostUsedFeatures: [...prev.interactionHistory.mostUsedFeatures, feature].slice(-10),
        preferredTimeOfDay: timeOfDay
      };

      if (duration) {
        updatedHistory.averageSessionLength = 
          (prev.interactionHistory.averageSessionLength + duration) / 2;
      }

      return {
        ...prev,
        interactionHistory: updatedHistory
      };
    });
  };

  const resetPersonalization = async () => {
    if (!user) return;

    setPersonalizationData(defaultPersonalization);

    try {
      localStorage.removeItem(`personalization_${user.id}`);
    } catch (error) {
      console.error('Error resetting personalization:', error);
    }
  };

  // Track session duration on unmount
  useEffect(() => {
    return () => {
      const sessionDuration = Date.now() - sessionStart;
      if (sessionDuration > 30000) { // Only track sessions longer than 30 seconds
        trackInteraction('session_end', sessionDuration);
      }
    };
  }, []);

  const value: PersonalizationContextType = {
    personalizationData,
    updatePersonalization,
    getPersonalizedResponse,
    trackInteraction,
    resetPersonalization,
    isLoading
  };

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
};
