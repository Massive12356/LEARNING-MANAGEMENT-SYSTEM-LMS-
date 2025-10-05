import React from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../contexts/UIContext';
import { SunIcon, MoonIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useUI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <MoonIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <SunIcon className="h-5 w-5 text-yellow-400" />
          )}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                LMS Platform
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Learning Management System
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {children}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Demo credentials for testing:
          </p>
          <div className="mt-2 text-xs space-y-1">
            <div>Student: john.student@example.com / password123</div>
            <div>Teacher: jane.teacher@example.com / password123</div>
            <div>Admin: admin@example.com / password123</div>
            <div>Superuser: super@example.com / password123</div>
          </div>
        </div>
      </div>
    </div>
  );
};