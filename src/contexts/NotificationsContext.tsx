import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/storageKeys';

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
  const removeNotification = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead, removeNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};


