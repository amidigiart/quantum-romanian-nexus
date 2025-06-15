
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ChatConversation } from '@/hooks/useChat';

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [loading, setLoading] = useState(false);

  const loadConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Optimized query using the new index
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id, title, created_at, updated_at') // Only select needed columns
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50); // Add reasonable limit

      if (error) throw error;

      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca conversațiile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title?: string): Promise<ChatConversation | null> => {
    if (!user) return null;

    try {
      const newConversation = {
        user_id: user.id,
        title: title || `Conversație ${new Date().toLocaleDateString('ro-RO')}`,
      };

      const { data, error } = await supabase
        .from('chat_conversations')
        .insert(newConversation)
        .select('id, title, created_at, updated_at')
        .single();

      if (error) throw error;

      const conversation = data as ChatConversation;
      setConversations(prev => [conversation, ...prev]);
      setCurrentConversation(conversation);

      toast({
        title: "Succes",
        description: "Conversația a fost creată",
      });

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut crea conversația",
        variant: "destructive",
      });
      return null;
    }
  };

  const selectConversation = (conversation: ChatConversation) => {
    setCurrentConversation(conversation);
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      // Delete messages first (cascade should handle this, but being explicit)
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (messagesError) throw messagesError;

      // Delete conversation
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }

      toast({
        title: "Succes",
        description: "Conversația a fost ștearsă",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge conversația",
        variant: "destructive",
      });
    }
  };

  const updateConversationTitle = async (conversationId: string, newTitle: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ 
          title: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: newTitle, updated_at: new Date().toISOString() }
            : conv
        )
      );

      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => 
          prev ? { ...prev, title: newTitle, updated_at: new Date().toISOString() } : null
        );
      }
    } catch (error) {
      console.error('Error updating conversation title:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut actualiza titlul conversației",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  return {
    conversations,
    currentConversation,
    loading,
    createConversation,
    selectConversation,
    deleteConversation,
    updateConversationTitle,
    loadConversations
  };
};
