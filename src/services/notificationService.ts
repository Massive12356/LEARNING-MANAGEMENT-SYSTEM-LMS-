import axios, { AxiosError } from 'axios';
import { Notification, NotificationStatus, NotificationType, UserRole } from '../types';
import apiClient from './apiClient';
import { mockApi } from './mockApi';
import { settingsService } from './settingsService';

class NotificationService {
  private STORAGE_KEY = 'lms_notifications';

  // Get all notifications for a user
  getNotifications(userId: string): Notification[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const allNotifications: Notification[] = JSON.parse(stored);
      return allNotifications
        .filter(
          notification =>
            // User-specific notifications
            notification.userId === userId ||
            // Role-based announcements
            (notification.role && this.userHasRole(userId, notification.role)) ||
            // Organization-wide announcements
            (notification.organizationId &&
              this.userInOrganization(userId, notification.organizationId)) ||
            // Global notifications (no specific user, role, or org)
            (!notification.userId && !notification.role && !notification.organizationId)
        )
        .map(notification => ({
          ...notification,
          createdAt: new Date(notification.createdAt),
          readAt: notification.readAt ? new Date(notification.readAt) : undefined,
          expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by newest first
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  // Check if user has a specific role
  private userHasRole(userId: string, role: UserRole): boolean {
    // For mock implementation, we'll assume all role-based notifications are valid
    // In a real implementation, this would check the user's role
    return true;
  }

  // Check if user belongs to an organization
  private userInOrganization(userId: string, organizationId: string): boolean {
    // For mock implementation, we'll assume all org notifications are valid
    // In a real implementation, this would check the user's organization
    return true;
  }

  // Create a new notification
  async createNotification(
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'status'>
  ): Promise<Notification> {
    try {
      const response = await apiClient.post('/notifications-creations', notificationData);
      console.log('[notificationsService]SUCCESS RESPONSE FROM BACKEND', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[notificationService] ERROR RESPONSE FROM BACKEND',
        err.response?.data || err?.message
      );
      throw new Error(err.response?.data?.message || err.message);
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;

      const allNotifications: Notification[] = JSON.parse(stored);
      const notificationIndex = allNotifications.findIndex(n => n.id === notificationId);

      if (notificationIndex === -1) return false;

      allNotifications[notificationIndex] = {
        ...allNotifications[notificationIndex],
        status: 'read',
        readAt: new Date(),
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allNotifications));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark multiple notifications as read
  markMultipleAsRead(notificationIds: string[]): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;

      const allNotifications: Notification[] = JSON.parse(stored);
      let updated = false;

      notificationIds.forEach(id => {
        const notificationIndex = allNotifications.findIndex(n => n.id === id);
        if (notificationIndex !== -1) {
          allNotifications[notificationIndex] = {
            ...allNotifications[notificationIndex],
            status: 'read',
            readAt: new Date(),
          };
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allNotifications));
      }

      return updated;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return false;
    }
  }

  // Archive notification
  archiveNotification(notificationId: string): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;

      const allNotifications: Notification[] = JSON.parse(stored);
      const notificationIndex = allNotifications.findIndex(n => n.id === notificationId);

      if (notificationIndex === -1) return false;

      allNotifications[notificationIndex] = {
        ...allNotifications[notificationIndex],
        status: 'archived',
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allNotifications));
      return true;
    } catch (error) {
      console.error('Error archiving notification:', error);
      return false;
    }
  }

  // Get unread notification count
  getUnreadCount(userId: string): number {
    const notifications = this.getNotifications(userId);
    return notifications.filter(n => n.status === 'unread').length;
  }

  // Private method to save a notification
  private saveNotification(notification: Notification): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const allNotifications: Notification[] = stored ? JSON.parse(stored) : [];

      allNotifications.push(notification);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allNotifications));
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  // Create announcement for all users of a specific role
  createRoleAnnouncement(
    title: string,
    message: string,
    role: UserRole,
    senderId: string,
    senderName: string
  ): Notification {
    return this.createNotification({
      title,
      message,
      type: 'announcement',
      priority: 'medium',
      role,
      senderId,
      senderName,
    });
  }

  // Create notification for a specific user
  createUserNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    senderId?: string,
    senderName?: string
  ): Notification {
    return this.createNotification({
      userId,
      title,
      message,
      type,
      priority,
      senderId,
      senderName,
    });
  }

  // Create course-specific notification
  createCourseNotification(
    courseId: string,
    title: string,
    message: string,
    type: NotificationType,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    senderId: string,
    senderName: string
  ): Notification {
    return this.createNotification({
      courseId,
      title,
      message,
      type,
      priority,
      senderId,
      senderName,
    });
  }

  // Create certificate notification
  createCertificateNotification(
    userId: string,
    certificateId: string,
    courseTitle: string,
    senderId: string,
    senderName: string
  ): Notification {
    return this.createNotification({
      userId,
      title: 'Certificate Earned!',
      message: `Congratulations! You've earned a certificate for completing "${courseTitle}". Click to view and download your certificate.`,
      type: 'success',
      priority: 'high',
      senderId,
      senderName,
    });
  }

  // Create teacher announcement to students
  createTeacherAnnouncement(
    courseId: string,
    title: string,
    message: string,
    senderId: string,
    senderName: string
  ): Notification {
    return this.createNotification({
      courseId,
      title: `Announcement: ${title}`,
      message,
      type: 'announcement',
      priority: 'medium',
      senderId,
      senderName,
    });
  }

  // Create admin announcement to all users or specific roles
  createAdminAnnouncement(
    title: string,
    message: string,
    senderId: string,
    senderName: string,
    role?: UserRole
  ): Notification {
    return this.createNotification({
      title: `System Announcement: ${title}`,
      message,
      type: 'announcement',
      priority: 'high',
      role,
      senderId,
      senderName,
    });
  }

  // Check if a notification should be created based on user settings
  shouldCreateNotification(userId: string, notificationType: string): boolean {
    // Load user's notification settings
    const settings = settingsService.getNotificationPreferences(userId);

    // For different notification types, check corresponding settings
    // For now, we'll use a general approach - in a real app, you might have more specific rules
    switch (notificationType) {
      case 'email':
        return settings.emailNotifications;
      case 'push':
        return settings.pushNotifications;
      case 'sms':
        return settings.smsNotifications;
      default:
        // For other notification types, default to email notification setting
        return settings.emailNotifications;
    }
  }

  // Create a new notification (with preference checking)
  createNotificationWithPreferences(
    userId: string,
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'status'>
  ): Notification | null {
    // Check if we should create this notification based on user preferences
    // For this example, we'll assume it's an email notification by default
    if (!this.shouldCreateNotification(userId, 'email')) {
      return null; // Don't create notification if user has disabled email notifications
    }

    return this.createNotification(notificationData);
  }

  // Delete notification permanently
  deleteNotification(notificationId: string): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;

      const allNotifications: Notification[] = JSON.parse(stored);
      const filteredNotifications = allNotifications.filter(n => n.id !== notificationId);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredNotifications));
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Unarchive notification (restore from archive)
  unarchiveNotification(notificationId: string): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return false;

      const allNotifications: Notification[] = JSON.parse(stored);
      const notificationIndex = allNotifications.findIndex(n => n.id === notificationId);

      if (notificationIndex === -1) return false;

      // If it was previously read, keep it as read, otherwise mark as unread
      const previousStatus = allNotifications[notificationIndex].status;
      const newStatus = previousStatus === 'read' ? 'read' : 'unread';

      allNotifications[notificationIndex] = {
        ...allNotifications[notificationIndex],
        status: newStatus,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allNotifications));
      return true;
    } catch (error) {
      console.error('Error unarchiving notification:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();