import { useUI } from '../hooks/useUI';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggleTheme } = useUI();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};