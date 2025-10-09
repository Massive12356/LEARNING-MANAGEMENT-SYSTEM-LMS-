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
      toast.error('Login error');
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex items-center justify-center">
            <div className="p-2 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="mt-4 text-center text-2xl font-extrabold text-gray-900 dark:text-white">
            LMS Platform
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-6 px-6 rounded-lg shadow-md">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              name="email"
              type="email"
              label="Email address"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
              placeholder="Enter your email"
              disabled={loading}
            />

            {/* Password Field */}
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-white"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" loading={loading} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};