import { AxiosError } from 'axios';
import apiClient from './apiClient';
import { NotificationPayload } from '../types';

// Define the NotificationPreferences type
export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

class SettingsService {
  // EMAIL
  async emailNotificationSettings(payload: NotificationPayload) {
    try {
      const response = await apiClient.put('/user/notificationpreferences/email', payload);
      console.log('[settingsService] EMAIL RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const message = err.response?.data?.message || err.message;
      console.error('[settingsService] EMAIL ERROR:', message);
      throw new Error(message);
    }
  }

  // SMS
  async smsNotificationSettings(payload: NotificationPayload) {
    try {
      const response = await apiClient.put('/user/notificationpreferences/sms', payload);
      console.log('[settingsService] SMS RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const message = err.response?.data?.message || err.message;
      console.error('[settingsService] SMS ERROR:', message);
      throw new Error(message);
    }
  }

  // PUSH
  async pushNotificationSettings(payload: NotificationPayload) {
    try {
      const response = await apiClient.put('/user/notificationpreferences/push', payload);
      console.log('[settingsService] PUSH RESPONSE:', response.data);
      return response.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const message = err.response?.data?.message || err.message;
      console.error('[settingsService] PUSH ERROR:', message);
      throw new Error(message);
    }
  }

  // Get notification preferences from localStorage (mock implementation)
  getNotificationPreferences(userId: string): NotificationPreferences {
    try {
      const stored = localStorage.getItem(`notification_preferences_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
    
    // Return default preferences
    return {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false
    };
  }

  // Save notification preferences to localStorage (mock implementation)
  saveNotificationPreferences(userId: string, preferences: NotificationPreferences): void {
    try {
      localStorage.setItem(`notification_preferences_${userId}`, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }
}

export const settingsService = new SettingsService();