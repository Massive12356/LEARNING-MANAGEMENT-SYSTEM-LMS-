import { useNotificationStore } from '../stores/notificationStore';
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markMultipleAsRead: (ids: string[]) => void;
  archiveNotification: (id: string) => void;
  unarchiveNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  refreshNotifications: () => void;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'status'>) => void;
}

// This hook maintains the same interface as the original useNotifications hook
export const useNotifications = (): NotificationContextType => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markMultipleAsRead,
    archiveNotification,
    unarchiveNotification,
    deleteNotification,
    createNotification,
    refreshNotifications: refreshNotificationsStore
  } = useNotificationStore();

  // Load notifications when user changes (similar to useEffect in NotificationContext)
  useEffect(() => {
    if (user) {
      loadNotifications(user.id);
    } else {
      // Reset notifications when user logs out
      useNotificationStore.setState({ notifications: [], unreadCount: 0 });
    }
  }, [user, loadNotifications]);

  const refreshNotifications = () => {
    if (user) {
      refreshNotificationsStore(user.id);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markMultipleAsRead,
    archiveNotification,
    unarchiveNotification,
    deleteNotification,
    refreshNotifications,
    createNotification,
  };
};