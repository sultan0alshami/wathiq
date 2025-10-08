import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { supabase } from '@/lib/supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: number; // epoch ms
  read: boolean;
}

interface NotificationsContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  removeNotification: (id: string) => void;
}

const STORAGE_KEY = `${STORAGE_KEYS.DATA_PREFIX}notifications`;

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as NotificationItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Subscribe to Supabase realtime notifications for this user and broadcasts
  useEffect(() => {
    const channel = supabase
      .channel('notifications-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const row = payload.new as any;
        // Accept if broadcast or targeted to current user
        addNotification({
          type: (row.type as NotificationType) || 'info',
          title: row.title || 'إشعار',
          message: row.message || undefined,
        });
      })
      .subscribe();

    return () => {
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const addNotification: NotificationsContextType['addNotification'] = (n) => {
    setNotifications(prev => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        read: false,
        ...n,
      },
      ...prev,
    ]);
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, markRead, removeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};


