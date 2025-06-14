
-- Create user preferences table for quantum settings
CREATE TABLE public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  quantum_algorithm_preference TEXT DEFAULT 'grover',
  preferred_qubit_count INTEGER DEFAULT 8,
  quantum_simulation_mode TEXT DEFAULT 'standard',
  encryption_protocol TEXT DEFAULT 'bb84',
  ml_model_preference TEXT DEFAULT 'qnn',
  notification_settings JSONB DEFAULT '{"chat_notifications": true, "system_alerts": true}',
  theme_preference TEXT DEFAULT 'quantum',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own preferences" 
  ON public.user_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
  ON public.user_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
  ON public.user_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" 
  ON public.user_preferences 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create unique constraint to ensure one preference record per user
ALTER TABLE public.user_preferences ADD CONSTRAINT unique_user_preferences UNIQUE (user_id);

-- Create function to automatically create default preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create preferences when user signs up
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_preferences();
