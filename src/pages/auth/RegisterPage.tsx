import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Eye, EyeOff } from 'lucide-react';
import { RegisterForm, RegisterPayload } from '../../types';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterForm & { organizationId: string }>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student',
    organizationId: '',
  });
  const [errors, setErrors] = useState<Partial<RegisterForm & { confirmPassword: string }>>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm & { confirmPassword: string }> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
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
      // ✅ Send orgCode as part of payload
      const payload : RegisterPayload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        organizationId: formData.organizationId, // renamed to match backend convention
      };

      await register(payload);
      toast.success('Registration successful! Please verify your email before logging in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="mt-4 space-y-6">
      <div>
        <h2 className="text-center text-lg font-medium text-gray-900 dark:text-white">Create your account</h2>
        <p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 py-4 px-4 rounded-lg shadow">
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="firstName"
              type="text"
              label="First name"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              autoComplete="given-name"
              placeholder="First name"
              className="text-sm"
            />

            <Input
              name="lastName"
              type="text"
              label="Last name"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              autoComplete="family-name"
              placeholder="Last name"
              className="text-sm"
            />
          </div>

          <Input
            name="email"
            type="email"
            label="Email address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
            placeholder="Enter your email"
            className="text-sm"
          />

          {/* ✅ Organization Code (kept, but no frontend validation) */}
          <Input
            name="organizationId"
            type="text"
            label="Organization Code"
            value={formData.organizationId}
            onChange={handleChange}
            placeholder="Enter your organization code"
            helpText="Enter the code provided by your organization"
            className="text-sm"
          />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Account Type
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

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
              placeholder="Create a password"
              helpText="Must be at least 8 characters"
              className="text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <Input
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              autoComplete="new-password"
              placeholder="Confirm your password"
              className="text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" className="w-full text-sm" loading={loading} size="sm">
            Create account
          </Button>
        </form>
      </div>
    </div>
  );
};