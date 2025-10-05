import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockApi } from '../../services/mockApi';
import { 
  UserPlusIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CreateAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organizationId: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [organizations, setOrganizations] = useState<any[]>([]);

  React.useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const orgsData = await mockApi.getOrganizations();
      setOrganizations(orgsData);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!adminData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!adminData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!adminData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(adminData.email)) newErrors.email = 'Email is invalid';
    if (!adminData.organizationId) newErrors.organizationId = 'Organization is required';
    if (!adminData.password) newErrors.password = 'Password is required';
    else if (adminData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (adminData.password !== adminData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Replace with real API call to POST /api/users
      const newAdmin = {
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        email: adminData.email,
        role: 'admin' as const,
        organizationId: adminData.organizationId,
        password: adminData.password
      };

      await mockApi.register(newAdmin);
      toast.success('Admin user created successfully');
      navigate('/superuser/organizations');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/superuser/organizations')}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Admin User
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create a new administrator for an organization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Admin Account Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This user will have administrative privileges for the selected organization
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                name="firstName"
                label="First Name"
                value={adminData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                placeholder="John"
                required
              />
              <Input
                name="lastName"
                label="Last Name"
                value={adminData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                placeholder="Doe"
                required
              />
            </div>

            <Input
              name="email"
              type="email"
              label="Email Address"
              value={adminData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="admin@organization.com"
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Organization
              </label>
              <select
                name="organizationId"
                value={adminData.organizationId}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.organizationId ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                }`}
                required
              >
                <option value="">Select an organization</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
              {errors.organizationId && (
                <p className="text-sm text-red-600">{errors.organizationId}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                name="password"
                type="password"
                label="Password"
                value={adminData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Create a secure password"
                helpText="Must be at least 8 characters"
                required
              />
              <Input
                name="confirmPassword"
                type="password"
                label="Confirm Password"
                value={adminData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm the password"
                required
              />
            </div>

            {/* Admin Permissions Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start">
                <ShieldCheckIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    Admin Permissions
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    This user will be able to manage users, courses, programs, and organization settings 
                    for the selected organization. They will not have access to other organizations.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/superuser/organizations')}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Create Admin User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}