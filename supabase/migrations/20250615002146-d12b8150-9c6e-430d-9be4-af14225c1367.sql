
-- Add indexes for chat_conversations table
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id_updated_at 
ON public.chat_conversations (user_id, updated_at DESC);

-- Add indexes for chat_messages table
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id_created_at 
ON public.chat_messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id_created_at 
ON public.chat_messages (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_message_type 
ON public.chat_messages (message_type);

-- Add indexes for team_memberships table
CREATE INDEX IF NOT EXISTS idx_team_memberships_user_id 
ON public.team_memberships (user_id);

CREATE INDEX IF NOT EXISTS idx_team_memberships_team_id_role 
ON public.team_memberships (team_id, role);

-- Add indexes for user_roles table
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role 
ON public.user_roles (user_id, role);

-- Add indexes for user_preferences table
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id 
ON public.user_preferences (user_id);

-- Add indexes for teams table
CREATE INDEX IF NOT EXISTS idx_teams_created_by 
ON public.teams (created_by);

CREATE INDEX IF NOT EXISTS idx_teams_updated_at 
ON public.teams (updated_at DESC);

-- Add partial indexes for better performance on specific queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_bot_messages 
ON public.chat_messages (conversation_id, created_at) 
WHERE message_type = 'assistant';

-- Add index for profiles username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username 
ON public.profiles (username) 
WHERE username IS NOT NULL;
