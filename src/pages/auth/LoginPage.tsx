import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoginForm } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { useUI } from '../../hooks/useUI';

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false, // keep for UI only
  });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});

  const { login} = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false)
  const [showPassword,setShowPassword]=useState(false);
  const from = (location.state as any)?.from?.pathname || '/';
  const { theme, toggleTheme } = useUI();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginForm> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true)
      const payload = {
        email: formData.email,
        password: formData.password,
      };
      console.log('Submitting login:', payload); // debug log
      await login(payload);
      toast.success('Login successful');
      console.log('Login successful');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Login error');
      console.error('Login error:', error.message);
    } finally{
      setLoading(false)
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof LoginForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
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
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign in to your account</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Or{' '}
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  create a new account
                </Link>
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                name="email"
                type="email"
                label="Email address"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
                placeholder="Enter your email"
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full" loading={loading} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};