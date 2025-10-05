class SettingsService {
  private NOTIFICATION_SETTINGS_KEY = 'notification_settings';

  // Get notification preferences for a user
  getNotificationPreferences(userId: string): NotificationPreferences {
    try {
      const settingsStr = localStorage.getItem(`${this.NOTIFICATION_SETTINGS_KEY}_${userId}`);
      console.log(`Loading notification preferences for user ${userId}:`, settingsStr);
      
      if (!settingsStr) {
        // Return default settings if none exist
        const defaultPrefs = this.getDefaultNotificationPreferences();
        console.log(`No preferences found, returning defaults:`, defaultPrefs);
        return defaultPrefs;
      }
      
      const settings = JSON.parse(settingsStr);
      console.log(`Raw settings from localStorage:`, settings);
      
      const normalizedPrefs = {
        emailNotifications: settings.emailNotifications !== false, // Default to true
        pushNotifications: settings.pushNotifications !== false,   // Default to true
        smsNotifications: settings.smsNotifications === true,      // Default to false
      };
      
      console.log(`Normalized preferences:`, normalizedPrefs);
      return normalizedPrefs;
    } catch (error) {
      console.error('Error loading notification settings:', error);
      return this.getDefaultNotificationPreferences();
    }
  }

  // Save notification preferences for a user
  saveNotificationPreferences(userId: string, preferences: NotificationPreferences): void {
    try {
      console.log(`Saving notification preferences for user ${userId}:`, preferences);
      localStorage.setItem(
        `${this.NOTIFICATION_SETTINGS_KEY}_${userId}`, 
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Get default notification preferences
  private getDefaultNotificationPreferences(): NotificationPreferences {
    const defaults = {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    };
    console.log(`Returning default preferences:`, defaults);
    return defaults;
  }
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}

export const settingsService = new SettingsService();