import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RegisterForm } from '../../types';
import { mockApi } from '../../services/mockApi';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterForm>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'student'
  });
  const [orgCode, setOrgCode] = useState('');
  const [orgCodeValid, setOrgCodeValid] = useState(false);
  const [orgCodeError, setOrgCodeError] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterForm & { confirmPassword: string }>>({});
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm & { confirmPassword: string }> = {};

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

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

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!orgCode) {
      setOrgCodeError('Organization code is required');
      return false;
    }

    if (!orgCodeValid) {
      setOrgCodeError('Please validate your organization code');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOrgCode = async () => {
    if (!orgCode.trim()) {
      setOrgCodeError('Organization code is required');
      return;
    }

    setValidatingCode(true);
    try {
      const result = await mockApi.validateOrganizationCode(orgCode);
      if (result.valid) {
        setOrgCodeValid(true);
        setOrgCodeError('');
      } else {
        setOrgCodeValid(false);
        setOrgCodeError('Invalid or expired code. Contact your organization.');
      }
    } catch (error) {
      setOrgCodeValid(false);
      setOrgCodeError('Failed to validate code. Please try again.');
    } finally {
      setValidatingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Validate organization code again before submission
      const validationResult = await mockApi.validateOrganizationCode(orgCode);
      if (!validationResult.valid) {
        setOrgCodeError('Invalid or expired code. Contact your organization.');
        return;
      }

      // Create provisional user
      const provisionalUser = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'student', // Default role, will be overridden by requestedRole
        requestedRole: formData.role,
        tempOrgId: validationResult.orgId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save provisional user to API
      await mockApi.createProvisionalUser(provisionalUser);
      
      // Show success message
      alert(`Your ${formData.role} signup for ${validationResult.orgName} is pending approval. Check back soon!`);
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      // Error is already handled in AuthContext
      console.error('Registration error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="firstName"
            type="text"
            label="First name"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            autoComplete="given-name"
            placeholder="First name"
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
        />

        <Input
          name="orgCode"
          type="text"
          label="Organization Code"
          value={orgCode}
          onChange={(e) => {
            setOrgCode(e.target.value);
            setOrgCodeError('');
          }}
          error={orgCodeError}
          placeholder="Enter your organization code"
          helpText="Enter the code provided by your organization"
          onBlur={() => validateOrgCode()}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Account Type
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        <Input
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
          placeholder="Create a password"
          helpText="Must be at least 8 characters"
        />

        <Input
          name="confirmPassword"
          type="password"
          label="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
          placeholder="Confirm your password"
        />

        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Create account
        </Button>
      </form>
    </div>
  );
};