import { useUI } from '../hooks/useUI';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useUI();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
};