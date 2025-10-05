import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FileUploader } from '../../components/ui/FileUploader';
import { organizationService } from '../../services/organizationService';
import { mockApi } from '../../services/mockApi';
import { Organization, OrganizationStatus } from '../../types';
import { 
  BuildingOfficeIcon,
  PhotoIcon,
  SwatchIcon,
  EnvelopeIcon,
  CogIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  KeyIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export function OrganizationSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationCodes, setOrganizationCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    programs: 0
  });

  const [orgData, setOrgData] = useState({
    name: '',
    description: '',
    primaryColor: '#3B82F6',
    emailCopyBranding: '',
    logo: ''
  });

  const [requiredFields, setRequiredFields] = useState({
    birthday: true,
    country: true,
    gender: true,
    levelOfEducation: true
  });

  const tabs = [
    { id: 'general', name: 'General', icon: BuildingOfficeIcon },
    { id: 'branding', name: 'Branding', icon: SwatchIcon },
    { id: 'email', name: 'Email Settings', icon: EnvelopeIcon },
    { id: 'user-fields', name: 'User Fields', icon: CogIcon },
    { id: 'org-codes', name: 'Organization Codes', icon: KeyIcon },
    { id: 'my-orgs', name: 'My Organizations', icon: UserGroupIcon }
  ];

  const colorPresets = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' }
  ];

  useEffect(() => {
    loadOrganizationData();
  }, [user]);

  const loadOrganizationData = async () => {
    if (!user) {
      // If no user, we're done loading
      setLoading(false);
      return;
    }
    
    try {
      // For admin users, they are typically associated with one organization
      // Load only the organization they belong to
      if (user.organizationId) {
        const orgData = await mockApi.getOrganizationById(user.organizationId);
        if (orgData) {
          setOrganizations([orgData]);
        }
      }
      
      // Load current organization if user has one
      if (user?.organizationId) {
        const orgData = await mockApi.getOrganizationById(user.organizationId);
        if (orgData) {
          setOrganization(orgData);
          setOrgData({
            name: orgData.name,
            description: orgData.description,
            primaryColor: orgData.primaryColor,
            emailCopyBranding: orgData.emailCopyBranding || '',
            logo: orgData.logo || ''
          });
          
          // Load organization codes
          const codes = await mockApi.getOrganizationCodes(user.organizationId);
          setOrganizationCodes(codes);
        }
        
        // Load stats for current organization
        loadOrganizationStats(user.organizationId);
      }
    } catch (error) {
      console.error('Failed to load organization data:', error);
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationStats = async (orgId: string) => {
    try {
      // Mock stats data - in a real implementation, this would come from an API
      setStats({
        users: Math.floor(Math.random() * 1000) + 100,
        courses: Math.floor(Math.random() * 100) + 10,
        programs: Math.floor(Math.random() * 50) + 5
      });
    } catch (error) {
      console.error('Failed to load organization stats:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // If we have an organization, update it with the new data
      if (organization) {
        const updatedOrgData = {
          ...organization,
          name: orgData.name,
          description: orgData.description,
          primaryColor: orgData.primaryColor,
          emailCopyBranding: orgData.emailCopyBranding,
          logo: orgData.logo
        };
        
        // In a real implementation, you would call an API to save this
        // await organizationService.updateOrganization(organization.id, updatedOrgData);
        
        // For now, just update the local state
        setOrganization(updatedOrgData);
        toast.success('Organization settings saved successfully');
      } else {
        // Simulate save for new organization
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Organization settings saved successfully');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRequiredFieldChange = (field: string, required: boolean) => {
    setRequiredFields(prev => ({ ...prev, [field]: required }));
  };

  const getStatusBadge = (status: OrganizationStatus) => {
    const statusConfig = {
      draft: { text: 'Draft', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200' },
      live: { text: 'Live', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' },
      active: { text: 'Active', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' },
      suspended: { text: 'Suspended', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <Input
              label="Organization Name"
              value={orgData.name}
              onChange={(e) => setOrgData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter organization name"
              required
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={orgData.description}
                onChange={(e) => setOrgData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your organization's mission and goals"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Organization Status
              </label>
              <select className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Organization Logo
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                {orgData.logo ? (
                  <div className="space-y-4">
                    <img 
                      src={orgData.logo} 
                      alt="Organization Logo" 
                      className="mx-auto h-32 w-32 object-contain"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // Remove logo
                        setOrgData(prev => ({ ...prev, logo: '' }));
                      }}
                    >
                      Remove Logo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Upload your organization logo
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                      Recommended size: 200x200px, PNG or JPG
                    </p>
                    <FileUploader
                      accept="image/*"
                      maxSize={5 * 1024 * 1024} // 5MB
                      maxFiles={1}
                      legacyMode={false}
                      onUpload={(files) => {
                        if (Array.isArray(files) && files.length > 0) {
                          const file = files[0];
                          if (file && (file.url || file.publicUrl)) {
                            // Use publicUrl if available, otherwise fallback to url
                            const logoUrl = file.publicUrl || file.url;
                            // Update organization data with new logo
                            setOrgData(prev => ({ ...prev, logo: logoUrl }));
                            toast.success('Logo uploaded successfully');
                          }
                        }
                      }}
                      dropzoneText="Drop logo here or click to browse"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Primary Color
              </label>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={orgData.primaryColor}
                    onChange={(e) => setOrgData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                  />
                  <Input
                    value={orgData.primaryColor}
                    onChange={(e) => setOrgData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Or choose from presets:
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {colorPresets.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setOrgData(prev => ({ ...prev, primaryColor: color.value }))}
                        className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                          orgData.primaryColor === color.value
                            ? 'border-gray-400 bg-gray-50 dark:bg-gray-700'
                            : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Copy Branding
              </label>
              <textarea
                value={orgData.emailCopyBranding}
                onChange={(e) => setOrgData(prev => ({ ...prev, emailCopyBranding: e.target.value }))}
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder={`Best regards,\nThe {{organizationName}} Team`}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Available variables: {'{'}{'{'}organizationName{'}'}{'}'}
              </p>
            </div>
          </div>
        );

      case 'user-fields':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Required User Profile Fields
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Select which fields users must complete when registering or updating their profile.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Birthday
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Date of birth
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiredFields.birthday}
                      onChange={(e) => handleRequiredFieldChange('birthday', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Country
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      User's country of residence
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiredFields.country}
                      onChange={(e) => handleRequiredFieldChange('country', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Gender
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      User's gender identity
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiredFields.gender}
                      onChange={(e) => handleRequiredFieldChange('gender', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Level of Education
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      User's highest level of education
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requiredFields.levelOfEducation}
                      onChange={(e) => handleRequiredFieldChange('levelOfEducation', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'org-codes':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Organization Codes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage and view organization join codes
                </p>
              </div>
              <Button 
                onClick={() => {
                  // TODO: Implement generate new code functionality
                  toast.success('Feature coming soon: Generate new organization code');
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Generate New Code
              </Button>
            </div>
            
            {organizationCodes.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">
                        Code
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Expiry Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Usage
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    {organizationCodes.map((code) => {
                      const isExpired = new Date() > new Date(code.expiry);
                      const isFull = code.usedCount >= code.maxUses;
                      const isActive = !isExpired && !isFull;
                      
                      return (
                        <tr key={code.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono font-bold text-gray-900 dark:text-white sm:pl-6">
                            {code.code}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(code.expiry).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {code.usedCount} / {code.maxUses}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isActive 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : isExpired
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {isActive ? 'Active' : isExpired ? 'Expired' : 'Full'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(code.code);
                                toast.success('Code copied to clipboard');
                              }}
                            >
                              Copy
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <KeyIcon className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No Organization Codes
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Generate your first organization code to allow users to join your organization.
                </p>
                <div className="mt-6">
                  <Button 
                    onClick={() => {
                      // TODO: Implement generate new code functionality
                      toast.success('Feature coming soon: Generate new organization code');
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Generate First Code
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'my-orgs':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  My Organization
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organization you are administrating
                </p>
              </div>
            </div>

            {organizations.length > 0 ? (
              <div className="max-w-3xl mx-auto">
                {organizations.slice(0, 1).map((org) => (
                  <div 
                    key={org.id} 
                    className="border rounded-lg p-6 transition-all border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: org.primaryColor }}
                        >
                          <BuildingOfficeIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {org.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(org.status)}
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              Current
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                      {org.description}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {stats.users}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Users
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {stats.courses}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Courses
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {stats.programs}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Programs
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          // Navigate to analytics page for this organization
                          navigate(`/admin/analytics/${org.id}`);
                        }}
                      >
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        View Analytics
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          // Set this organization as active and navigate to general settings
                          setOrganization(org);
                          setOrgData({
                            name: org.name,
                            description: org.description,
                            primaryColor: org.primaryColor,
                            emailCopyBranding: org.emailCopyBranding || '',
                            logo: org.logo || ''
                          });
                          setActiveTab('general');
                        }}
                      >
                        <CogIcon className="h-4 w-4 mr-1" />
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                  No Organizations
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  You don't have access to any organizations yet.
                </p>
                <div className="mt-6">
                  <Button>
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    Create Your First Organization
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organization Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your organization's configuration and branding
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
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
          <Card>
            <CardContent className="p-6">
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}