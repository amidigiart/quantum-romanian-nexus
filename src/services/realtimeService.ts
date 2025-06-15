
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, ChatConversation } from '@/hooks/useChat';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UserPresence {
  user_id: string;
  username?: string;
  avatar_url?: string;
  online_at: string;
  status: 'online' | 'typing' | 'away';
}

export interface RealtimeCallbacks {
  onMessageReceived?: (message: ChatMessage) => void;
  onConversationUpdated?: (conversation: ChatConversation) => void;
  onUserPresenceChange?: (presences: UserPresence[]) => void;
  onTypingIndicator?: (userId: string, isTyping: boolean) => void;
}

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private callbacks: RealtimeCallbacks = {};

  constructor(callbacks: RealtimeCallbacks = {}) {
    this.callbacks = callbacks;
  }

  // Helper method to extract UserPresence from Supabase presence state
  private extractPresences(presenceState: any): UserPresence[] {
    const presences: UserPresence[] = [];
    
    Object.keys(presenceState).forEach(key => {
      const presenceList = presenceState[key];
      if (Array.isArray(presenceList)) {
        presenceList.forEach((presence: any) => {
          // Extract the actual UserPresence data from the presence object
          if (presence && typeof presence === 'object') {
            const userPresence: UserPresence = {
              user_id: presence.user_id || key,
              username: presence.username,
              avatar_url: presence.avatar_url,
              online_at: presence.online_at || new Date().toISOString(),
              status: presence.status || 'online'
            };
            presences.push(userPresence);
          }
        });
      }
    });
    
    return presences;
  }

  // Subscribe to real-time chat messages for a conversation
  subscribeToConversation(conversationId: string) {
    const channelName = `conversation:${conversationId}`;
    
    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage: ChatMessage = {
            id: payload.new.id,
            text: payload.new.content,
            isBot: payload.new.message_type === 'assistant',
            timestamp: new Date(payload.new.created_at),
            quantum_data: payload.new.quantum_data
          };
          this.callbacks.onMessageReceived?.(newMessage);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations',
          filter: `id=eq.${conversationId}`
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          const updatedConversation: ChatConversation = {
            id: payload.new.id,
            title: payload.new.title,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at
          };
          this.callbacks.onConversationUpdated?.(updatedConversation);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    console.log(`Subscribed to conversation: ${conversationId}`);
  }

  // Subscribe to user presence in a conversation
  subscribeToPresence(conversationId: string, userPresence: UserPresence) {
    const channelName = `presence:${conversationId}`;
    
    if (this.channels.has(channelName)) {
      return; // Already subscribed
    }

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const presences = this.extractPresences(presenceState);
        console.log('Presence sync:', presences);
        this.callbacks.onUserPresenceChange?.(presences);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
        const presenceState = channel.presenceState();
        const allPresences = this.extractPresences(presenceState);
        this.callbacks.onUserPresenceChange?.(allPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
        const presenceState = channel.presenceState();
        const allPresences = this.extractPresences(presenceState);
        this.callbacks.onUserPresenceChange?.(allPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Tracking presence for user:', userPresence.user_id);
          await channel.track(userPresence);
        }
      });

    this.channels.set(channelName, channel);
  }

  // Send typing indicator
  sendTypingIndicator(conversationId: string, isTyping: boolean) {
    const channelName = `typing:${conversationId}`;
    let channel = this.channels.get(channelName);

    if (!channel) {
      channel = supabase
        .channel(channelName)
        .on('broadcast', { event: 'typing' }, (payload) => {
          console.log('Typing indicator:', payload);
          this.callbacks.onTypingIndicator?.(payload.payload.user_id, payload.payload.isTyping);
        })
        .subscribe();
      
      this.channels.set(channelName, channel);
    }

    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { isTyping, timestamp: new Date().toISOString() }
    });
  }

  // Update user presence status
  async updatePresenceStatus(conversationId: string, status: 'online' | 'typing' | 'away') {
    const channelName = `presence:${conversationId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      const updatedPresence: Partial<UserPresence> = {
        status,
        online_at: new Date().toISOString()
      };
      await channel.track(updatedPresence);
    }
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelKey: string) {
    const channel = this.channels.get(channelKey);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelKey);
      console.log(`Unsubscribed from: ${channelKey}`);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    this.channels.forEach((channel, key) => {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from: ${key}`);
    });
    this.channels.clear();
  }
}
