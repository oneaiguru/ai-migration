import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type NotificationKind = 'success' | 'error' | 'info';

export interface ForecastingNotification {
  id: string;
  title: string;
  message: string;
  kind: NotificationKind;
  createdAt: string;
  read: boolean;
  downloadHref?: string;
  downloadLabel?: string;
}

interface NotificationCenterValue {
  notifications: ForecastingNotification[];
  unreadCount: number;
  pushNotification: (entry: Omit<ForecastingNotification, 'id' | 'createdAt' | 'read'>) => void;
  pushError: (title: string, message: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  reset: () => void;
}

const NotificationCenterContext = createContext<NotificationCenterValue | null>(null);

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.round(Math.random() * 10_000)}`;

export const NotificationCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ForecastingNotification[]>([]);
  const unreadRef = useRef<Set<string>>(new Set());

  const pushNotification = useCallback<NotificationCenterValue['pushNotification']>((entry) => {
    const id = (entry as ForecastingNotification).id ?? createId('note');
    const next: ForecastingNotification = {
      ...entry,
      id,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [next, ...prev].slice(0, 20));
    unreadRef.current.add(id);
  }, []);

  const pushError = useCallback<NotificationCenterValue['pushError']>((title, message) => {
    pushNotification({ title, message, kind: 'error' });
  }, [pushNotification]);

  const markAllAsRead = useCallback(() => {
    unreadRef.current.clear();
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const clearNotification = useCallback<NotificationCenterValue['clearNotification']>((id) => {
    unreadRef.current.delete(id);
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const reset = useCallback(() => {
    unreadRef.current.clear();
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => unreadRef.current.size, [notifications]);

  const value = useMemo<NotificationCenterValue>(
    () => ({
      notifications,
      unreadCount,
      pushNotification,
      pushError,
      markAllAsRead,
      clearNotification,
      reset,
    }),
    [notifications, unreadCount, pushNotification, pushError, markAllAsRead, clearNotification, reset],
  );

  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
};

export const useNotificationCenter = (): NotificationCenterValue => {
  const ctx = useContext(NotificationCenterContext);
  if (!ctx) {
    throw new Error('useNotificationCenter должен использоваться внутри NotificationCenterProvider');
  }
  return ctx;
};
