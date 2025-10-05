import React, { useState, useEffect } from 'react';
import { settingsService, NotificationPreferences } from './services/settingsService';

const NotificationPreferencesTest: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  });
  const testUserId = 'test-user-123';

  useEffect(() => {
    // Load initial preferences
    const loadedPreferences = settingsService.getNotificationPreferences(testUserId);
    setPreferences(loadedPreferences);
  }, []);

  const handlePreferenceChange = (preference: keyof NotificationPreferences, value: boolean) => {
    const updatedPreferences = {
      ...preferences,
      [preference]: value
    };
    
    setPreferences(updatedPreferences);
    settingsService.saveNotificationPreferences(testUserId, updatedPreferences);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Notification Preferences Test</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Current Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications via email
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('emailNotifications', !preferences.emailNotifications)}
              className={`px-4 py-2 rounded-lg font-medium ${
                preferences.emailNotifications
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {preferences.emailNotifications ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Push Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive push notifications on your devices
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('pushNotifications', !preferences.pushNotifications)}
              className={`px-4 py-2 rounded-lg font-medium ${
                preferences.pushNotifications
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {preferences.pushNotifications ? 'Enabled' : 'Disabled'}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">SMS Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive text messages for important updates
              </p>
            </div>
            <button
              onClick={() => handlePreferenceChange('smsNotifications', !preferences.smsNotifications)}
              className={`px-4 py-2 rounded-lg font-medium ${
                preferences.smsNotifications
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {preferences.smsNotifications ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-medium mb-2">Preferences Data:</h3>
          <pre className="text-sm overflow-x-auto">
            {JSON.stringify(preferences, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesTest;