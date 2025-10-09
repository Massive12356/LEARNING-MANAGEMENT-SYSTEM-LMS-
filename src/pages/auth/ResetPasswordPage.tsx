import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { useUI } from '../../hooks/useUI';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const { theme, toggleTheme } = useUI();

  // Check if we're coming from the verification flow
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.password = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Reset the password using the mock API
      await authService.resetPassword(email, formData.newPassword);
      
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <div 
          className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke-width="1.5" 
            stroke="currentColor" 
            className="h-5 w-5 text-gray-600 dark:text-gray-300"
          >
            {theme === 'dark' ? (
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" 
              />
            ) : (
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" 
              />
            )}
          </svg>
        </div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LMS Platform</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learning Management System</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset your password</h2>
              {email && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Reset password for <strong>{email}</strong>
                </p>
              )}
              {!email && !token && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Enter your new password below.
                </p>
              )}
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                name="newPassword"
                type="password"
                label="New password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
                placeholder="Enter your new password"
                helpText="Must be at least 8 characters"
              />

              <Input
                name="confirmPassword"
                type="password"
                label="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
                placeholder="Confirm your new password"
              />

              <Button type="submit" className="w-full" loading={loading}>
                Reset password
              </Button>
            </form>
            
            <div className="text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                ← Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};