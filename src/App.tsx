import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { UIProvider } from './contexts/UIContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppRoutes } from './routes';

function App() {
  return (
    <Router>
      <UIProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'dark:bg-gray-800 dark:text-white',
              style: {
                background: 'var(--toast-bg, #ffffff)',
                color: 'var(--toast-color, #374151)',
              },
            }}
          />
        </AuthProvider>
      </UIProvider>
    </Router>
  );
}

export default App;