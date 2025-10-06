import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../hooks/useUI';
import { useNotifications } from '../hooks/useNotifications';

const ZustandTest: React.FC = () => {
  const { user, login, logout, loading: authLoading } = useAuth();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar, loading: uiLoading } = useUI();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Zustand Test Component</h1>
      
      {/* Auth Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Authentication</h2>
        {authLoading ? (
          <p>Loading...</p>
        ) : user ? (
          <div>
            <p>Welcome, {user.firstName} {user.lastName}!</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <button 
              onClick={logout}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p>Not logged in</p>
            <button 
              onClick={() => login({ email: 'test@example.com', password: 'password' })}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Test Login
            </button>
          </div>
        )}
      </div>

      {/* UI Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">UI State</h2>
        <p>Current theme: {theme}</p>
        <button 
          onClick={toggleTheme}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded mr-2"
        >
          Toggle Theme
        </button>
        
        <p>Sidebar collapsed: {sidebarCollapsed ? 'Yes' : 'No'}</p>
        <button 
          onClick={toggleSidebar}
          className="mt-2 px-4 py-2 bg-purple-500 text-white rounded"
        >
          Toggle Sidebar
        </button>
      </div>

      {/* Notifications Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Notifications</h2>
        <p>Unread notifications: {unreadCount}</p>
        {notifications.length > 0 ? (
          <ul>
            {notifications.map(notification => (
              <li key={notification.id} className="mb-2 p-2 border rounded">
                <p className="font-semibold">{notification.title}</p>
                <p>{notification.message}</p>
                <p>Status: {notification.status}</p>
                {notification.status === 'unread' && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="mt-1 px-2 py-1 bg-yellow-500 text-white text-sm rounded"
                  >
                    Mark as Read
                  </button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No notifications</p>
        )}
      </div>
    </div>
  );
};

export default ZustandTest;