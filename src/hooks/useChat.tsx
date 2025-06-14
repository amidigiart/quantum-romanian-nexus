
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  quantum_data?: any;
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load conversations when user logs in
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca conversațiile",
        variant: "destructive",
      });
    }
  };

  const createConversation = async (title?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: user.id,
          title: title || 'Conversație nouă',
        })
        .select()
        .single();

      if (error) throw error;

      const newConversation = data as ChatConversation;
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
      
      return newConversation;
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

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const loadedMessages: ChatMessage[] = data.map(msg => ({
        id: msg.id,
        text: msg.content,
        isBot: msg.message_type === 'assistant',
        timestamp: new Date(msg.created_at),
        quantum_data: msg.quantum_data
      }));

      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca mesajele",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMessage = async (message: ChatMessage, conversationId?: string) => {
    if (!user) return;

    let convId = conversationId || currentConversation?.id;
    
    // Create new conversation if none exists
    if (!convId) {
      const newConv = await createConversation();
      convId = newConv?.id;
    }

    if (!convId) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: convId,
          user_id: user.id,
          content: message.text,
          message_type: message.isBot ? 'assistant' : 'user',
          quantum_data: message.quantum_data || null
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', convId);

    } catch (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut salva mesajul",
        variant: "destructive",
      });
    }
  };

  const selectConversation = async (conversation: ChatConversation) => {
    setCurrentConversation(conversation);
    await loadMessages(conversation.id);
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
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

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    createConversation,
    selectConversation,
    deleteConversation,
    saveMessage,
    setMessages,
    loadConversations
  };
};
