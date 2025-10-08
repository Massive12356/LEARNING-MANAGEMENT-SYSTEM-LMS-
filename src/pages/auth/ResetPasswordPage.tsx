import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';

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
    </div>
  );
};