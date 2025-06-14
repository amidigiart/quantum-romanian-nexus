
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UserPreferences {
  id?: string;
  quantum_algorithm_preference: string;
  preferred_qubit_count: number;
  quantum_simulation_mode: string;
  encryption_protocol: string;
  ml_model_preference: string;
  notification_settings: {
    chat_notifications: boolean;
    system_alerts: boolean;
  };
  theme_preference: string;
}

const defaultPreferences: UserPreferences = {
  quantum_algorithm_preference: 'grover',
  preferred_qubit_count: 8,
  quantum_simulation_mode: 'standard',
  encryption_protocol: 'bb84',
  ml_model_preference: 'qnn',
  notification_settings: {
    chat_notifications: true,
    system_alerts: true
  },
  theme_preference: 'quantum'
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);

  const loadPreferences = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          id: data.id,
          quantum_algorithm_preference: data.quantum_algorithm_preference,
          preferred_qubit_count: data.preferred_qubit_count,
          quantum_simulation_mode: data.quantum_simulation_mode,
          encryption_protocol: data.encryption_protocol,
          ml_model_preference: data.ml_model_preference,
          notification_settings: data.notification_settings,
          theme_preference: data.theme_preference
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca preferințele",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Partial<UserPreferences>) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          quantum_algorithm_preference: updatedPreferences.quantum_algorithm_preference,
          preferred_qubit_count: updatedPreferences.preferred_qubit_count,
          quantum_simulation_mode: updatedPreferences.quantum_simulation_mode,
          encryption_protocol: updatedPreferences.encryption_protocol,
          ml_model_preference: updatedPreferences.ml_model_preference,
          notification_settings: updatedPreferences.notification_settings,
          theme_preference: updatedPreferences.theme_preference,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setPreferences(updatedPreferences);
      toast({
        title: "Succes",
        description: "Preferințele au fost salvate",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut salva preferințele",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  return {
    preferences,
    loading,
    savePreferences,
    loadPreferences
  };
};
