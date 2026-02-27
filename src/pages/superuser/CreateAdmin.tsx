import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockApi } from '../../services/mockApi';
import {
  UserPlusIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  BuildingOfficeIcon
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
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-white/10 -ml-2 mb-2"
                onClick={() => navigate('/superuser/organizations')}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Organizations
              </Button>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-200 text-sm font-medium">
                <UserPlusIcon className="h-4 w-4 mr-2" />
                <span>User Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Create Admin
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Set up a new administrator account for an organization.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Admin Account Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This user will have administrative privileges for the selected organization
              </p>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Info Section */}
              <div className="space-y-6">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="firstName"
                    label="First Name"
                    value={adminData.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    placeholder="John"
                    required
                    className="rounded-xl"
                  />
                  <Input
                    name="lastName"
                    label="Last Name"
                    value={adminData.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    placeholder="Doe"
                    required
                    className="rounded-xl"
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
                  className="rounded-xl"
                />
              </div>

              {/* Organization Section */}
              <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold">Organization Assignment</h3>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Organization
                  </label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="organizationId"
                      value={adminData.organizationId}
                      onChange={handleChange}
                      className={`block w-full pl-11 pr-4 py-3 border rounded-xl shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${errors.organizationId ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'
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
                  </div>
                  {errors.organizationId && (
                    <p className="mt-1 text-sm text-red-600">{errors.organizationId}</p>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 font-bold">Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="rounded-xl"
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
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Admin Permissions Info */}
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-start">
                  <ShieldCheckIcon className="h-6 w-6 text-blue-600 mt-0.5 mr-4 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                      Admin Permissions
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                      This user will be able to manage users, courses, programs, and organization settings
                      for the selected organization. They will not have access to other organizations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/superuser/organizations')}
                  className="rounded-xl px-6"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  className="rounded-xl px-8 shadow-lg shadow-blue-500/20"
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Create Admin User
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}