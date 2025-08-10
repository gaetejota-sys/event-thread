import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export const useDirectMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMessages = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching direct messages', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (receiverId: string, content: string) => {
    if (!user || !content.trim()) return { success: false };
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({ sender_id: user.id, receiver_id: receiverId, content: content.trim() })
        .select('*')
        .single();
      if (error) throw error;
      setMessages(prev => [...prev, data]);
      return { success: true };
    } catch (err) {
      console.error('Error sending direct message', err);
      return { success: false };
    }
  };

  const markAsRead = async (messageId: string) => {
    if (!user) return { success: false };
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .select('id, read_at')
        .single();
      if (error) throw error;
      setMessages(prev => prev.map(m => (m.id === messageId ? { ...m, read_at: data.read_at } : m)));
      return { success: true };
    } catch (err) {
      console.error('Error marking message as read', err);
      return { success: false };
    }
  };

  const conversations = useMemo(() => {
    if (!user) return [] as { partnerId: string; lastMessage: DirectMessage | null; unreadCount: number }[];
    const groups: Record<string, DirectMessage[]> = {};
    for (const m of messages) {
      const partnerId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      if (!groups[partnerId]) groups[partnerId] = [];
      groups[partnerId].push(m);
    }
    return Object.entries(groups).map(([partnerId, msgs]) => {
      const lastMessage = msgs[msgs.length - 1] || null;
      const unreadCount = msgs.filter(m => m.receiver_id === user.id && !m.read_at).length;
      return { partnerId, lastMessage, unreadCount };
    });
  }, [messages, user?.id]);

  useEffect(() => {
    fetchMessages();
    if (!user) return;
    const channel = supabase
      .channel('direct_messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { messages, loading, conversations, fetchMessages, sendMessage, markAsRead };
};


