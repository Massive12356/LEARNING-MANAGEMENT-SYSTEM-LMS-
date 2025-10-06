# Zustand Stores

This directory contains the Zustand stores for the LMS application, replacing the previous React Context API implementation.

## Why Zustand?

Zustand offers several advantages over React Context API:

1. **Simpler API** - No need for Providers or complex Context setup
2. **Better Performance** - More granular re-renders than Context
3. **Easier Testing** - No need to wrap components in Providers for tests
4. **Less Boilerplate** - Significantly less code than Context API
5. **Built-in Persistence** - Easy state persistence with middleware
6. **TypeScript Support** - Excellent TypeScript integration

## Stores

### [authStore.ts](file:///Users/wealth/Desktop/LMS5/src/stores/authStore.ts)
Manages authentication state including:
- User authentication status
- Login/logout functionality
- User registration
- User profile updates
- "View as user" functionality for admins

### [uiStore.ts](file:///Users/wealth/Desktop/LMS5/src/stores/uiStore.ts)
Manages UI state including:
- Theme (light/dark mode)
- Sidebar collapsed state
- Global loading state

### [notificationStore.ts](file:///Users/wealth/Desktop/LMS5/src/stores/notificationStore.ts)
Manages notification state including:
- User notifications
- Unread notification count
- Notification actions (mark as read, archive, delete)

## Hooks

To maintain compatibility with existing components, we've created hooks that match the interface of the previous Context hooks:

- [useAuth.ts](file:///Users/wealth/Desktop/LMS5/src/hooks/useAuth.ts) - Replaces [useAuth](file:///Users/wealth/Desktop/LMS5/src/contexts/AuthContext.tsx#L176-L180) from AuthContext
- [useUI.ts](file:///Users/wealth/Desktop/LMS5/src/hooks/useUI.ts) - Replaces [useUI](file:///Users/wealth/Desktop/LMS5/src/contexts/UIContext.tsx#L80-L84) from UIContext
- [useNotifications.ts](file:///Users/wealth/Desktop/LMS5/src/hooks/useNotifications.ts) - Replaces [useNotifications](file:///Users/wealth/Desktop/LMS5/src/contexts/NotificationContext.tsx#L159-L163) from NotificationContext

## Migration

See [MIGRATION_GUIDE.md](file:///Users/wealth/Desktop/LMS5/MIGRATION_GUIDE.md) for details on how to migrate from Context API to Zustand.

## Usage

```typescript
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { useNotifications } from '../hooks/useNotifications';

const MyComponent = () => {
  const { user, login, logout } = useAuth();
  const { theme, toggleTheme } = useUI();
  const { notifications, markAsRead } = useNotifications();
  
  // Component implementation
};
```

## Persistence

UI and Auth stores use Zustand's `persist` middleware to automatically save state to localStorage:

- UI store persists theme and sidebar state
- Auth store persists user authentication state

## Performance

Zustand provides better performance than Context API because:
1. Components only re-render when the specific state they're using changes
2. No unnecessary re-renders when unrelated state changes
3. More efficient subscription model