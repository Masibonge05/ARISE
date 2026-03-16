import { useState, useEffect, useCallback, useRef } from "react";
import api from "../services/api";

export function useMessages(threadId = null) {
  const [threads, setThreads]   = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const bottomRef = useRef(null);

  // Load threads
  useEffect(() => {
    api.get("/messages/")
      .then(r => setThreads(r.data.threads || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load messages for active thread
  useEffect(() => {
    if (!threadId) return;
    api.get(`/messages/${threadId}`)
      .then(r => setMessages(r.data.messages || []))
      .catch(() => {});
  }, [threadId]);

  const sendMessage = useCallback(async (text, recipientId) => {
    if (!text.trim() || sending) return;
    setSending(true);
    const tempMsg = { id: Date.now(), from: "me", text: text.trim(), ts: new Date().toISOString() };
    setMessages(m => [...m, tempMsg]);
    try {
      await api.post("/messages/", { thread_id: threadId, text, recipient_id: recipientId });
    } catch {}
    finally { setSending(false); }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [threadId, sending]);

  const unreadCount = threads.reduce((s, t) => s + (t.unread || 0), 0);

  return { threads, messages, loading, sending, unreadCount, sendMessage, bottomRef, setThreads };
}

export default useMessages;