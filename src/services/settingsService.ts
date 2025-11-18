import { AxiosError } from 'axios';
import apiClient from './apiClient';
import { NotificationPayload } from '../types';

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
}

export const settingsService = new SettingsService();
