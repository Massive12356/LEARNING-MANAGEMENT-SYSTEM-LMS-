# Notification Preferences Implementation

## Overview
This document explains how the notification preferences system works in the LMS application.

## Components

### 1. Settings Service
The `settingsService` handles storing and retrieving user notification preferences using localStorage.

**Location:** `src/services/settingsService.ts`

**Key Functions:**
- `getNotificationPreferences(userId)`: Retrieves user's notification preferences
- `saveNotificationPreferences(userId, preferences)`: Saves user's notification preferences

**Preferences Structure:**
```typescript
interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
}
```

### 2. Student Settings Page
The Student Settings page includes a Notifications tab that allows users to manage their notification preferences.

**Location:** `src/pages/student/StudentSettings.tsx`

**Features:**
- Toggle switches for each notification type
- Real-time saving of preferences
- Visual indication of enabled/disabled states

### 3. Notification Service Integration
The notification service can check user preferences before creating notifications.

**Location:** `src/services/notificationService.ts`

**Key Function:**
- `shouldCreateNotification(userId, notificationType)`: Checks if a notification should be created based on user preferences

## How It Works

1. **Loading Preferences**: When a user visits the settings page, their notification preferences are loaded from localStorage.

2. **Updating Preferences**: When a user toggles a preference, it's immediately saved to localStorage.

3. **Using Preferences**: Before sending notifications, the system can check the user's preferences to determine if the notification should be sent.

## Testing

A test component is available at `/test/notification-preferences` to verify the functionality.

## Future Enhancements

1. **Backend Integration**: Store preferences in a database instead of localStorage
2. **More Granular Controls**: Allow users to control specific types of notifications
3. **Notification History**: Show users a history of notifications they've received