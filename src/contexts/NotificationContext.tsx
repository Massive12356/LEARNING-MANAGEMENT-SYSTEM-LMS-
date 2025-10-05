import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';
import { useAuth } from './AuthContext';

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

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications when user changes
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const loadNotifications = () => {
    if (!user) return;
    
    const userNotifications = notificationService.getNotifications(user.id);
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(n => n.status === 'unread').length);
  };

  const markAsRead = (id: string) => {
    const success = notificationService.markAsRead(id);
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: 'read', readAt: new Date() } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markMultipleAsRead = (ids: string[]) => {
    const success = notificationService.markMultipleAsRead(ids);
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          ids.includes(notification.id) 
            ? { ...notification, status: 'read', readAt: new Date() } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - ids.length));
    }
  };

  const archiveNotification = (id: string) => {
    const success = notificationService.archiveNotification(id);
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: 'archived' } 
            : notification
        )
      );
      // Update unread count if the archived notification was unread
      const archivedNotification = notifications.find(n => n.id === id);
      if (archivedNotification && archivedNotification.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const unarchiveNotification = (id: string) => {
    const success = notificationService.unarchiveNotification(id);
    if (success) {
      setNotifications(prev => {
        const notification = prev.find(n => n.id === id);
        if (!notification) return prev;
        
        // If it was previously read, keep it as read, otherwise mark as unread
        const previousStatus = notification.status;
        const newStatus = previousStatus === 'read' ? 'read' : 'unread';
        
        return prev.map(n => 
          n.id === id 
            ? { ...n, status: newStatus } 
            : n
        );
      });
      // Update unread count if the unarchived notification becomes unread
      const unarchivedNotification = notifications.find(n => n.id === id);
      if (unarchivedNotification && unarchivedNotification.status !== 'read') {
        setUnreadCount(prev => prev + 1);
      }
    }
  };

  const deleteNotification = (id: string) => {
    const success = notificationService.deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification && deletedNotification.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const createNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'status'>) => {
    const newNotification = notificationService.createNotification(notification);
    setNotifications(prev => [newNotification, ...prev]);
    if (newNotification.status === 'unread') {
      setUnreadCount(prev => prev + 1);
    }
  };

  const refreshNotifications = () => {
    loadNotifications();
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markMultipleAsRead,
    archiveNotification,
    unarchiveNotification,
    deleteNotification,
    refreshNotifications,
    createNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};