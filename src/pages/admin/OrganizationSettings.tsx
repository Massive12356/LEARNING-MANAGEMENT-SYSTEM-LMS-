import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { Organization } from '../../types';
import { 
  BuildingOfficeIcon,
  PhotoIcon,
  UserGroupIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function OrganizationSettings() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  const [orgData, setOrgData] = useState({
    name: '',
    description: '',
    logo: '',
    primaryColor: '#3b82f6',
    emailCopyBranding: ''
  });

  useEffect(() => {
    loadOrganization();
  }, [user]);

  const loadOrganization = async () => {
    if (!user?.organizationId) {
      toast.error('No organization assigned to your account');
      setLoading(false);
      return;
    }
    
    try {
      const orgDataResult = await organizationService.getOrganizationById(user.organizationId);
      setOrganization(orgDataResult);
      setOrgData({
        name: orgDataResult.name,
        description: orgDataResult.description || '',
        logo: orgDataResult.logo || '',
        primaryColor: orgDataResult.primaryColor || '#3b82f6',
        emailCopyBranding: orgDataResult.emailCopyBranding || ''
      });
    } catch (error) {
      console.error('Failed to load organization:', error);
      toast.error('Failed to load organization settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organization) return;
    
    try {
      const updatedOrg = await organizationService.updateOrganization(organization.id, orgData);
      setOrganization(updatedOrg);
      toast.success('Organization settings updated successfully');
    } catch (error) {
      toast.error('Failed to update organization settings');
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: BuildingOfficeIcon },
    { id: 'branding', name: 'Branding', icon: PhotoIcon },
    { id: 'members', name: 'Members', icon: UserGroupIcon },
    { id: 'communication', name: 'Communication', icon: EnvelopeIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No Organization Assigned
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          You don't have an organization assigned to your account. Contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Organization Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your organization's settings and branding
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* General Tab */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  General Information
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update your organization's basic information
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <Input
                    label="Organization Name"
                    value={orgData.name}
                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={orgData.description}
                      onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of your organization"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Branding Tab */}
          {activeTab === 'branding' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Branding
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Customize your organization's appearance
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      {orgData.logo ? (
                        <img
                          src={orgData.logo}
                          alt="Organization Logo"
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <Button variant="outline" size="sm">
                          Upload Logo
                        </Button>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          JPG, PNG, or GIF. Max 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={orgData.primaryColor}
                        onChange={(e) => setOrgData({ ...orgData, primaryColor: e.target.value })}
                        className="h-10 w-16 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <Input
                        value={orgData.primaryColor}
                        onChange={(e) => setOrgData({ ...orgData, primaryColor: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Organization Members
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage members and their roles
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      Admin
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Communication Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Configure email and notification settings
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Copy Branding
                    </label>
                    <textarea
                      value={orgData.emailCopyBranding}
                      onChange={(e) => setOrgData({ ...orgData, emailCopyBranding: e.target.value })}
                      rows={6}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add your organization's email signature or branding here..."
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      This text will be appended to all system-generated emails.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}