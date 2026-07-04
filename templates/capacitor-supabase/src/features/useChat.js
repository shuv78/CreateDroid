import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../db/supabase';
export function useChat(chatId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!chatId) return;
    const sub = supabase.channel(`chat:${chatId}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, payload => { setMessages(prev => [...prev, payload.new]); }).subscribe();
    loadMessages();
    return () => { supabase.removeChannel(sub); };
  }, [chatId]);
  const loadMessages = async () => { const { data } = await supabase.from('messages').select('*').eq('chat_id', chatId).order('created_at'); if (data) setMessages(data); setLoading(false); };
  const sendMessage = async (text, senderId, senderName) => { await supabase.from('messages').insert({ chat_id: chatId, sender_id: senderId, sender_name: senderName, text, created_at: new Date().toISOString() }); };
  return { messages, loading, sendMessage };
}