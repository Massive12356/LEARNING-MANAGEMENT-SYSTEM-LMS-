import { create } from 'zustand';
import { notificationService } from '../services/notificationService';
import { Notification,CreateNotificationResponse } from '../types';
import toast from 'react-hot-toast';


interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loadNotifications: (userId: string) => void;
  markAsRead: (id: string) => void;
  markMultipleAsRead: (ids: string[]) => void;
  archiveNotification: (id: string) => void;
  unarchiveNotification: (id: string) => void;
  deleteNotification: (id: string) => void;
  createNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'status'>
  ) => Promise<CreateNotificationResponse>;
  refreshNotifications: (userId: string) => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,

  loadNotifications: (userId: string) => {
    const userNotifications = notificationService.getNotifications(userId);
    set({
      notifications: userNotifications,
      unreadCount: userNotifications.filter(n => n.status === 'unread').length,
    });
  },

  markAsRead: (id: string) => {
    const success = notificationService.markAsRead(id);
    if (success) {
      set(state => ({
        notifications: state.notifications.map(notification =>
          notification.id === id
            ? { ...notification, status: 'read', readAt: new Date() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    }
  },

  markMultipleAsRead: (ids: string[]) => {
    const success = notificationService.markMultipleAsRead(ids);
    if (success) {
      set(state => ({
        notifications: state.notifications.map(notification =>
          ids.includes(notification.id)
            ? { ...notification, status: 'read', readAt: new Date() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - ids.length),
      }));
    }
  },

  archiveNotification: (id: string) => {
    const success = notificationService.archiveNotification(id);
    if (success) {
      set(state => {
        const archivedNotification = state.notifications.find(n => n.id === id);
        const unreadAdjustment =
          archivedNotification && archivedNotification.status === 'unread' ? 1 : 0;

        return {
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, status: 'archived' } : notification
          ),
          unreadCount: Math.max(0, state.unreadCount - unreadAdjustment),
        };
      });
    }
  },

  unarchiveNotification: (id: string) => {
    const success = notificationService.unarchiveNotification(id);
    if (success) {
      set(state => {
        const notification = state.notifications.find(n => n.id === id);
        if (!notification) return state;

        // If it was previously read, keep it as read, otherwise mark as unread
        const previousStatus = notification.status;
        const newStatus = previousStatus === 'read' ? 'read' : 'unread';

        const unreadAdjustment = notification.status !== 'read' ? 1 : 0;

        return {
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, status: newStatus } : n
          ),
          unreadCount: state.unreadCount + unreadAdjustment,
        };
      });
    }
  },

  deleteNotification: (id: string) => {
    const success = notificationService.deleteNotification(id);
    if (success) {
      set(state => {
        const deletedNotification = state.notifications.find(n => n.id === id);
        const unreadAdjustment =
          deletedNotification && deletedNotification.status === 'unread' ? 1 : 0;

        return {
          notifications: state.notifications.filter(notification => notification.id !== id),
          unreadCount: Math.max(0, state.unreadCount - unreadAdjustment),
        };
      });
    }
  },

  createNotification: async (
    notification: Omit<Notification, 'id' | 'createdAt' | 'status'> // ✅ properly typed input
  ): Promise<CreateNotificationResponse> => {
    // ✅ correct return type
    try {
      const newNotification = await notificationService.createNotification(notification);

      set(state => ({
        notifications: [newNotification, ...state.notifications],
        unreadCount:
          newNotification.status === 'unread' ? state.unreadCount + 1 : state.unreadCount,
      }));

      return { success: true, data: newNotification }; // ✅ success case
    } catch (error: any) {
      console.error('Failed to create notification:', error?.message);
      return { success: false, error: error?.message || 'Unknown error' }; // ✅ error case
    }
  },

  refreshNotifications: (userId: string) => {
    get().loadNotifications(userId);
  },
}));