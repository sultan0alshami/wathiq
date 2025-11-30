import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

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
  loading: boolean;
}

const STORAGE_KEY = STORAGE_KEYS.NOTIFICATIONS;

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  // Load notifications from Supabase when user is authenticated
  useEffect(() => {
    const loadNotifications = async () => {
      // Wait for auth to complete
      if (authLoading) {
        console.log('[NotificationsContext] Waiting for authentication...');
        return;
      }

      if (!user) {
        console.log('[NotificationsContext] No user authenticated, skipping notification load');
        setLoading(false);
        return;
      }

      // Try to load from localStorage first for instant display
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const cachedItems = JSON.parse(cached) as NotificationItem[];
          setNotifications(cachedItems);
          console.log('[NotificationsContext] Loaded', cachedItems.length, 'notifications from cache');
          setLoading(false); // Set loading false immediately after cache load
        }
      } catch (err) {
        console.warn('[NotificationsContext] Failed to load from cache:', err);
      }

      // Then fetch from Supabase in background
      try {
        console.log('[NotificationsContext] Loading notifications from Supabase for user:', user.id);

        // Fetch notifications for this user + broadcasts
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('[NotificationsContext] Error loading notifications:', error);
        } else if (data) {
          console.log('[NotificationsContext] Loaded', data.length, 'notifications from Supabase');
          // Convert Supabase format to NotificationItem format
          const items: NotificationItem[] = data.map(n => ({
            id: n.id,
            type: n.type as NotificationType,
            title: n.title,
            message: n.message || undefined,
            createdAt: new Date(n.created_at).getTime(),
            read: !!n.read_at,
          }));
          setNotifications(items);
          
          // Also save to localStorage as backup
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
          } catch {}
        }
      } catch (err) {
        console.error('[NotificationsContext] Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [authLoading, user]);

  // Subscribe to Supabase Realtime for new notifications
  useEffect(() => {
    const setupRealtime = async () => {
      // Wait for auth to complete
      if (authLoading) {
        console.log('[NotificationsContext] Waiting for auth before setting up Realtime...');
        return;
      }

      if (!user) {
        console.log('[NotificationsContext] No user authenticated, skipping Realtime subscription');
        return;
      }

      console.log('[NotificationsContext] Setting up Realtime subscription for user:', user.id);

      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            const row = payload.new as any;
            console.log('[NotificationsContext] New notification received:', row);
            
            // Only add if it's for this user or is broadcast
            if (row.is_broadcast || row.user_id === user.id) {
              const newItem: NotificationItem = {
                id: row.id,
                type: row.type as NotificationType,
                title: row.title,
                message: row.message || undefined,
                createdAt: new Date(row.created_at).getTime(),
                read: false,
              };

              setNotifications(prev => {
                const updated = [newItem, ...prev];
                // Update localStorage
                try {
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('[NotificationsContext] Realtime status:', status);
        });

      return () => {
        console.log('[NotificationsContext] Cleaning up Realtime subscription');
        try {
          supabase.removeChannel(channel);
        } catch {}
      };
    };

    setupRealtime();
  }, [authLoading, user]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const addNotification: NotificationsContextType['addNotification'] = (n) => {
    const newItem: NotificationItem = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      read: false,
      ...n,
    };
    
    setNotifications(prev => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const markAllRead = async () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Also update in Supabase
    if (user) {
      try {
        await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .or(`user_id.eq.${user.id},is_broadcast.eq.true`)
          .is('read_at', null);
        console.log('[NotificationsContext] Marked all notifications as read in database');
      } catch (err) {
        console.error('[NotificationsContext] Error marking all as read:', err);
      }
    }
  };

  const markRead = async (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Also update in Supabase if it's a Supabase notification (not local-)
    if (!id.startsWith('local-')) {
      try {
        await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.error('[NotificationsContext] Error marking notification as read:', err);
      }
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAllRead,
        markRead,
        removeNotification,
        loading,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};


