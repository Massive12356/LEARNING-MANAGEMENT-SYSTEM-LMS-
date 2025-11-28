import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { organizationService } from '../../services/organizationService';
import { Organization } from '../../types';
import {
  BuildingOfficeIcon,
  PhotoIcon,
  UserGroupIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ActiveOrganizationStats } from '../../types';
import { useOrganizationStore } from '../../stores/organizationStore';

export function OrganizationSettings() {
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [updatingOrgs, setUpdatingOrgs] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const { updateOrganizationStore, refetchOrganization } = useOrganizationStore();

  const [orgData, setOrgData] = useState({
    name: '',
    description: '',
    logo: null as File | string | null, // Can be File (during upload), string (URL), or null
    primaryColor: '#3b82f6',
    emailCopyBranding: '',
  });

  // Extract organization ID from query parameters for superuser access
  const urlParams = new URLSearchParams(location.search);
  const orgIdFromQuery = urlParams.get('organizationId');

  console.log('Loaded user:', user);
  console.log('Query param orgId:', orgIdFromQuery);

  useEffect(() => {
    loadOrganization();
  }, [user, orgIdFromQuery]);

  const loadOrganization = async () => {
    if (!orgId) return;

    try {
      const orgDataResult = await organizationService.getOrganizationById(orgId);

      if (!orgDataResult) {
        toast.error('Organization not found');
        return;
      }

      setOrganization(orgDataResult);
      setOrgData({
        name: orgDataResult.name,
        description: orgDataResult.description || '',
        logo: orgDataResult.logo || null, // Use the actual logo from organization data
        primaryColor: orgDataResult.primaryColor || '#3b82f6',
        emailCopyBranding: orgDataResult.emailCopyBranding || '',
      });
    } catch (error) {
      toast.error('Failed to load organization settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orgId) return toast.error('No valid organization ID');

    try {
      setUpdatingOrgs(true);

      if (orgData.logo instanceof File) {
        // Use FormData for logo uploads
        const formData = new FormData();
        formData.append('name', orgData.name);
        formData.append('description', orgData.description);
        formData.append('primaryColor', orgData.primaryColor);
        formData.append('emailCopyBranding', orgData.emailCopyBranding);
        formData.append('logo', orgData.logo);

        const updatedOrg = await organizationService.updateOrganizationWithLogo(orgId, formData);
        setOrganization(updatedOrg);
        await refetchOrganization(orgId)
      } else if (orgData.logo === null) {
        // Explicitly remove logo by sending a special value
        const formData = new FormData();
        formData.append('name', orgData.name);
        formData.append('description', orgData.description);
        formData.append('primaryColor', orgData.primaryColor);
        formData.append('emailCopyBranding', orgData.emailCopyBranding);
        formData.append('logo', ''); // Empty string to indicate logo removal

        const updatedOrg = await organizationService.updateOrganizationWithLogo(orgId, formData);
        setOrganization(updatedOrg);
        await refetchOrganization(orgId)
      } else {
        // No logo change, send JSON data
        const { logo, ...jsonOrgData } = orgData;

        const updatedOrg = await organizationService.updateOrganizationData(orgId, jsonOrgData);
        setOrganization(updatedOrg);
        await refetchOrganization(orgId)
      }

      toast.success('Organization settings updated successfully');
    } catch (error) {
      toast.error('Failed to update organization settings');
    } finally {
      setUpdatingOrgs(false);
    }
  };

  // First: Set the orgId when user or URL param changes
  useEffect(() => {
    const idToLoad =
      user?.role === 'superuser' && orgIdFromQuery ? orgIdFromQuery : user?.organizationDetails?.id;

    if (idToLoad) {
      setOrgId(String(idToLoad));
    } else {
      toast.error('No organization specified');
    }
  }, [user, orgIdFromQuery]);

  // Second: When orgId is set, load the organization
  useEffect(() => {
    if (orgId) {
      loadOrganization();
    }
  }, [orgId]);

  const tabs = [
    { id: 'general', name: 'General', icon: BuildingOfficeIcon },
    { id: 'branding', name: 'Branding', icon: PhotoIcon },
    { id: 'members', name: 'Members', icon: UserGroupIcon },
    { id: 'communication', name: 'Communication', icon: EnvelopeIcon },
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
          No Organization Found
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The specified organization could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Organization Settings
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your organization's settings and branding
            </p>
          </div>
          {user?.role === 'superuser' && (
            <Button variant="outline" onClick={() => navigate('/superuser/organizations')}>
              Back to Organizations
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <nav className="space-y-1">
            {tabs.map(tab => {
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
                    onChange={e => setOrgData({ ...orgData, name: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={orgData.description}
                      onChange={e => setOrgData({ ...orgData, description: e.target.value })}
                      rows={4}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of your organization"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" loading={updatingOrgs} disabled={updatingOrgs}>
                      {updatingOrgs ? ' Saving' : 'Save Changes'}
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Branding</h2>
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
                      {orgData.logo instanceof File ? (
                        <img
                          src={URL.createObjectURL(orgData.logo)}
                          alt="Preview Logo"
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : typeof orgData.logo === 'string' && orgData.logo ? (
                        <img
                          src={orgData.logo}
                          alt="Organization Logo"
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div 
                          className="h-16 w-16 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: orgData.primaryColor }}
                        >
                          <BuildingOfficeIcon className="h-8 w-8 text-white" />
                        </div>
                      )}
                      
                      {/* Logo Controls */}
                      <div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('logoUpload')?.click()}
                          >
                            Upload Logo
                          </Button>
                          
                          {/* Show Remove Logo button only when there's a logo */}
                          {(orgData.logo instanceof File || (typeof orgData.logo === 'string' && orgData.logo)) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOrgData({ ...orgData, logo: null })}
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-900/20"
                            >
                              Remove Logo
                            </Button>
                          )}
                        </div>
                        
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          JPG, PNG, or GIF. Max 2MB.
                        </p>

                        {/* Hidden Input */}
                        <input
                          id="logoUpload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setOrgData({ ...orgData, logo: file }); // Save file object
                            }
                          }}
                        />
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
                        onChange={e => setOrgData({ ...orgData, primaryColor: e.target.value })}
                        className="h-10 w-16 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <Input
                        value={orgData.primaryColor}
                        onChange={e => setOrgData({ ...orgData, primaryColor: e.target.value })}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" loading={updatingOrgs} disabled={updatingOrgs}>
                      {updatingOrgs ? ' Saving' : 'Save Changes'}
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
                          {user?.firstName?.charAt(0)}
                          {user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
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
                      onChange={e => setOrgData({ ...orgData, emailCopyBranding: e.target.value })}
                      rows={6}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add your organization's email signature or branding here..."
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      This text will be appended to all system-generated emails.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" loading={updatingOrgs} disabled={updatingOrgs}>
                      {updatingOrgs ? ' Saving' : 'Save Changes'}
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
