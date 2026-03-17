import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import api from "../services/api";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.get("/users/me/notifications");
      const notifs = res.data.notifications || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.is_read).length);
    } catch { /* fail silently */ }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = useCallback(async (id) => {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
    try { await api.patch(`/users/me/notifications/${id}/read`); } catch {}
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(ns => ns.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      markRead, markAllRead, refetch: fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be inside <NotificationProvider>");
  return ctx;
}

export default NotificationContext;