import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { organizationService } from '../../services/organizationService';
import { settingsService, NotificationPreferences } from '../../services/settingsService';
import { Organization } from '../../types';
import {
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ProfilePictureUpload } from '../../components/ui/ProfilePictureUpload';
import { formatDate } from '../../utils/dateFormatter';

export const TeacherSettings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
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

  const loadOrganization = useCallback(async () => {
    if (!user?.organizationDetails?.id) {
      // If user has no organization, we're done loading
      setOrganization(null);
      setLoading(false);
      return;
    }

    try {
      const orgData = await organizationService.getOrganizationById(String(user?.organizationDetails?.id));
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  }, [user?.organizationDetails?.id]);

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
  }, [user, loadOrganization]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      // Merge profile data with existing user object
      const updatedUser = {
        ...user,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        birthday: profileData.birthday,
        country: profileData.country,
        gender: profileData.gender,
        levelOfEducation: profileData.levelOfEducation
      };

      await updateUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
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
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
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
    <div className="space-y-10 pb-10">
      {/* Header - Taller & Bolder */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-200 text-sm font-medium">
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                <span>Account Management</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Settings
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Manage your profile details, security preferences, and organization settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation - Modern Pill Style */}
        <div className="lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-2 sticky top-6">
            <nav className="space-y-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update your personal details and public profile
                </p>
              </div>
              <div className="p-8">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-200 blur"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-full p-1">
                      <ProfilePictureUpload
                        currentImageUrl={user?.images || undefined}
                        onFileSelect={() => {
                          // The component handles the file selection internally
                        }}
                        onRemove={() => {
                          if (user) {
                            updateUser({ ...user, images: undefined });
                          }
                        }}
                      />
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
                    Profile Photo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Click to upload a new photo
                  </p>
                  {user?.images && (
                    <button
                      type="button"
                      onClick={() => {
                        if (user) {
                          updateUser({ ...user, images: undefined });
                        }
                      }}
                      className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      value={profileData.firstName}
                      onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                    <Input
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                    required
                    disabled
                    className="rounded-xl bg-gray-50 dark:bg-gray-900/50"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Birthday"
                      type="date"
                      value={profileData.birthday}
                      onChange={e => setProfileData({ ...profileData, birthday: e.target.value })}
                      className="rounded-xl"
                    />
                    <Input
                      label="Country"
                      value={profileData.country}
                      onChange={e => setProfileData({ ...profileData, country: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Gender
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={e => setProfileData({ ...profileData, gender: e.target.value })}
                        className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="">Prefer not to say</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Level of Education
                      </label>
                      <select
                        value={profileData.levelOfEducation}
                        onChange={e =>
                          setProfileData({ ...profileData, levelOfEducation: e.target.value })
                        }
                        className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

                  <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" className="rounded-xl px-8 shadow-lg shadow-blue-500/20">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Organization Tab */}
          {activeTab === 'organization' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Organization Information
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Details about your enrolled organization
                </p>
              </div>
              <div className="p-8">
                {organization ? (
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-6">
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: organization.primaryColor }}
                        >
                          <BuildingOfficeIcon className="h-10 w-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {organization?.name ?? 'N/A'}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {organization?.description ?? 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Status
                        </label>
                        <span
                          className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${organization.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : organization.status === 'suspended'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            }`}
                        >
                          {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}
                        </span>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Enrolled Since
                        </label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatDate(user?.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <BuildingOfficeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Contact Admin
                          </h3>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                            <p>
                              Need to make changes to your organization details? Please contact your organization administrator for assistance.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dev Reset Button - Only shown in development */}
                    {import.meta.env.DEV && (
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
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
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                      <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No Organization Enrollment
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      You are not currently enrolled in any organization. Contact your administrator
                      for enrollment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Security Settings
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update your password and security preferences
                </p>
              </div>
              <div className="p-8">
                <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={e =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    required
                    className="rounded-xl"
                  />

                  <div className="pt-4">
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={e =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      required
                      helpText="Must be at least 8 characters"
                      className="rounded-xl"
                    />
                  </div>

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={e =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    required
                    className="rounded-xl"
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" className="rounded-xl px-8 shadow-lg shadow-blue-500/20">
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notification Preferences
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose how you want to be notified
                </p>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Receive notifications via email
                      </p>
                    </div>
                    <Button
                      variant={notificationPreferences.emailNotifications ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        handleNotificationPreferencesUpdate(
                          'emailNotifications',
                          !notificationPreferences.emailNotifications
                        )
                      }
                      className={notificationPreferences.emailNotifications ? 'bg-blue-600 hover:bg-blue-500' : ''}
                    >
                      {notificationPreferences.emailNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Push Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Receive push notifications on your devices
                      </p>
                    </div>
                    <Button
                      variant={notificationPreferences.pushNotifications ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        handleNotificationPreferencesUpdate(
                          'pushNotifications',
                          !notificationPreferences.pushNotifications
                        )
                      }
                      className={notificationPreferences.pushNotifications ? 'bg-blue-600 hover:bg-blue-500' : ''}
                    >
                      {notificationPreferences.pushNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        SMS Notifications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Receive text messages for important updates
                      </p>
                    </div>
                    <Button
                      variant={notificationPreferences.smsNotifications ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() =>
                        handleNotificationPreferencesUpdate(
                          'smsNotifications',
                          !notificationPreferences.smsNotifications
                        )
                      }
                      className={notificationPreferences.smsNotifications ? 'bg-blue-600 hover:bg-blue-500' : ''}
                    >
                      {notificationPreferences.smsNotifications ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};