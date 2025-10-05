import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { settingsService, NotificationPreferences } from '../../services/settingsService';
import { User, Organization } from '../../types';
import { 
  UserIcon, 
  BuildingOfficeIcon,
  KeyIcon,
  BellIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ProfilePictureUpload } from '../../components/ui/ProfilePictureUpload';

export const StudentSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    birthday: user?.birthday || '',
    country: user?.country || '',
    gender: user?.gender || '',
    levelOfEducation: user?.levelOfEducation || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false
  });

  useEffect(() => {
    // Initialize profile data when user is available
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        birthday: user.birthday || '',
        country: user.country || '',
        gender: user.gender || '',
        levelOfEducation: user.levelOfEducation || ''
      });
      
      // Load notification preferences
      const preferences = settingsService.getNotificationPreferences(user.id);
      console.log('Loaded notification preferences:', preferences);
      setNotificationPreferences(preferences);
    }
    
    loadOrganization();
  }, [user]);

  const loadOrganization = async () => {
    if (!user?.organizationId) {
      // If user has no organization, we're done loading
      setOrganization(null);
      setLoading(false);
      return;
    }
    
    try {
      const orgData = await organizationService.getOrganizationById(user.organizationId);
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      await updateUser(profileData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    // In a real app, you would call an API to update the password
    toast.success('Password updated successfully');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNotificationPreferencesUpdate = (preference: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;
    
    const updatedPreferences = {
      ...notificationPreferences,
      [preference]: value
    };
    
    console.log('Updating notification preference:', preference, 'to', value);
    console.log('Previous preferences:', notificationPreferences);
    console.log('New preferences:', updatedPreferences);
    
    setNotificationPreferences(updatedPreferences);
    settingsService.saveNotificationPreferences(user.id, updatedPreferences);
    toast.success('Notification preferences updated');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'organization', name: 'Organization', icon: BuildingOfficeIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
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
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update your personal information
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <ProfilePictureUpload
                    currentImageUrl={user?.profileImage}
                    onImageUpdate={(imageUrl) => {
                      if (user) {
                        updateUser({ profileImage: imageUrl || undefined });
                      }
                    }}
                  />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Click on the profile picture to upload a new one
                  </p>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                    disabled
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Birthday"
                      type="date"
                      value={profileData.birthday}
                      onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                    />
                    <Input
                      label="Country"
                      value={profileData.country}
                      onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Gender
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Level of Education
                      </label>
                      <select
                        value={profileData.levelOfEducation}
                        onChange={(e) => setProfileData({ ...profileData, levelOfEducation: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select level</option>
                        <option value="high-school">High School</option>
                        <option value="associate">Associate Degree</option>
                        <option value="bachelor">Bachelor's Degree</option>
                        <option value="master">Master's Degree</option>
                        <option value="phd">PhD</option>
                      </select>
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

          {/* Organization Tab */}
          {activeTab === 'organization' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Organization Information
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Details about your enrolled organization
                </p>
              </CardHeader>
              <CardContent>
                {organization ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-16 h-16 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: organization.primaryColor }}
                      >
                        <BuildingOfficeIcon className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {organization.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {organization.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          organization.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : organization.status === 'suspended'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {organization.status}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Enrolled Since
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {user?.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Admin
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        For organization-related issues, contact your administrator.
                      </p>
                    </div>

                    {/* Dev Reset Button - Only shown in development */}
                    {import.meta.env.DEV && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            // Reset organization to default (Tech Academy)
                            setOrganization(null);
                            setTimeout(() => loadOrganization(), 500);
                            toast.success('Organization data refreshed');
                          }}
                        >
                          Refresh Organization Data (Dev Only)
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BuildingOfficeIcon className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                      No Organization Enrollment
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      You are not currently enrolled in any organization. Contact your administrator for enrollment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Security Settings
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Update your password and security preferences
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    helpText="Must be at least 8 characters"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />

                  <div className="flex justify-end">
                    <Button type="submit">
                      Update Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Notification Preferences
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Choose how you want to be notified
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <Button 
                      variant={notificationPreferences.emailNotifications ? "primary" : "outline"} 
                      size="sm"
                      onClick={() => handleNotificationPreferencesUpdate('emailNotifications', !notificationPreferences.emailNotifications)}
                    >
                      {notificationPreferences.emailNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive push notifications on your devices
                      </p>
                    </div>
                    <Button 
                      variant={notificationPreferences.pushNotifications ? "primary" : "outline"} 
                      size="sm"
                      onClick={() => handleNotificationPreferencesUpdate('pushNotifications', !notificationPreferences.pushNotifications)}
                    >
                      {notificationPreferences.pushNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        SMS Notifications
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive text messages for important updates
                      </p>
                    </div>
                    <Button 
                      variant={notificationPreferences.smsNotifications ? "primary" : "outline"} 
                      size="sm"
                      onClick={() => handleNotificationPreferencesUpdate('smsNotifications', !notificationPreferences.smsNotifications)}
                    >
                      {notificationPreferences.smsNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;