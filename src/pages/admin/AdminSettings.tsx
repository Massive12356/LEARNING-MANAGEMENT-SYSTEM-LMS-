import React, { useState, useEffect } from 'react';
import { useAuthStore, normalizeUser } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { organizationService } from '../../services/organizationService';
import { settingsService, NotificationPreferences } from '../../services/settingsService';
import { User, Organization,NotificationPayload } from '../../types';
import { UserIcon, BuildingOfficeIcon, KeyIcon, BellIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ProfilePictureUpload } from '../../components/ui/ProfilePictureUpload';
import { formatDate, formatDateForInput } from '../../utils/dateFormatter';
import { adminService } from '../../services/adminService';

export const AdminSettings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [notifying, setNotifying] = useState ({email: false, sms: false, push:false});

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    country: '',
    gender: '',
    levelOfEducation: '',
    imageFile: null as File | null,
    backendImageUrl: '', // image from backend
    previewUrl: '', // current preview (objectURL or backend)
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });

  const [profileImage, setProfileImage] = useState<File | string | null>(null);

  // Load user & organization data once
  useEffect(() => {
    if (!user) return;

    const normalizedUser = normalizeUser(user);

    const genderEnumValue: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | '' = (() => {
      switch (normalizedUser.gender?.toLowerCase()) {
        case 'male':
          return 'Male';
        case 'female':
          return 'Female';
        case 'other':
          return 'Other';
        case 'prefer not to say':
          return 'Prefer not to say';
        default:
          return '';
      }
    })();

    setProfileData({
      firstName: normalizedUser.firstName || '',
      lastName: normalizedUser.lastName || '',
      email: normalizedUser.email || '',
      birthday: formatDateForInput(normalizedUser.birthday),
      country: normalizedUser.country || '',
      gender: genderEnumValue,
      levelOfEducation: normalizedUser.levelOfEducation || '',
      imageFile: null,
      backendImageUrl: normalizedUser.images || '',
      previewUrl: normalizedUser.images || '',
    });
    setProfileImage(normalizedUser.images || null);

    (async () => {
      try {
        const prefs = await settingsService.getNotificationPreferences(normalizedUser.id);
        setNotificationPreferences(prefs);
      } catch (err) {
        console.error('Failed to load notification preferences:', err);
      }
    })();

    loadOrganization();
  }, [user]);

  const loadOrganization = async () => {
    if (!user?.organizationDetails?.id) {
      setOrganization(null);
      setLoading(false);
      return;
    }

    try {
      const orgData = await organizationService.getOrganizationById(
        user.organizationDetails.id.toString()
      );
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
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('email', profileData.email);
      formData.append('role', user.role); // keep current role
      formData.append('status', 'active'); // or pull from user.status
      formData.append('country', profileData.country);
      if (profileData.gender.trim()) {
        formData.append('gender', profileData.gender);
      }
      formData.append('levelOfEducation', profileData.levelOfEducation);
      formData.append('birthday', profileData.birthday ? profileData.birthday : '');

      // Notification preferences
      formData.append(
        'emailNotificationEnabler',
        notificationPreferences.emailNotifications ? 'true' : 'false'
      );
      formData.append(
        'smsNotificationEnabler',
        notificationPreferences.smsNotifications ? 'true' : 'false'
      );
      formData.append(
        'pushNotificationEnabler',
        notificationPreferences.pushNotifications ? 'true' : 'false'
      );

      if (profileImage instanceof File) {
        formData.append('images', profileImage); // new upload
      } else if (typeof profileImage === 'string') {
        formData.append('images', profileImage); // keep existing image
      } else {
        formData.append('images', ''); // user removed image
      }

      console.log('PAYLOAD TO SERVER:', formData);
      // Send FormData to backend
      await adminService.updateProfileDetails(user.id, formData);
      const updatedUser = await adminService.getUserById(user.id);
      console.log('DATA FROM BACKEND', updatedUser);
      // Update store with normalized User object
      updateUser(updatedUser);

      // Sync local form state
      const genderEnumValue: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | '' = (() => {
        switch (updatedUser.gender?.toLowerCase()) {
          case 'male':
            return 'Male';
          case 'female':
            return 'Female';
          case 'other':
            return 'Other';
          case 'prefer not to say':
            return 'Prefer not to say';
          default:
            return '';
        }
      })();

      // Update local state
      setProfileData(prev => ({
        ...prev,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        email: updatedUser.email || '',
        birthday: formatDateForInput(updatedUser.birthday),
        country: updatedUser.country || '',
        gender: updatedUser.gender
          ? updatedUser.gender.charAt(0).toUpperCase() + updatedUser.gender.slice(1)
          : '',
        levelOfEducation: updatedUser.levelOfEducation || '',
        imageFile: null,
        backendImageUrl: updatedUser.images || '',
        previewUrl: updatedUser.images || '',
      }));

      // In handleProfileUpdate, after successful save:
      if (profileImage instanceof File) {
        formData.append('images', profileImage);
      } else if (typeof profileImage === 'string' && profileImage.trim() !== '') {
        formData.append('images', profileImage);
      } else {
        formData.append('images', "");
      }
      setProfileImage(updatedUser.images || null);

      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to update profile');
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!user) return;

    try {
      setUpdatingPassword(true);
      const payload = {
        oldPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      };
      await adminService.passwordChange(payload as any);
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to Update Password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  // const handleNotificationPreferencesUpdate = (
  //   preference: keyof NotificationPreferences,
  //   value: boolean
  // ) => {
  //   if (!user) return;

  //   const updatedPreferences = {
  //     ...notificationPreferences,
  //     [preference]: value,
  //   };

  //   setNotificationPreferences(updatedPreferences);
  //   // await adminService.notificationSettings(user.id, updatedPreferences);
  //   toast.success('Notification preferences updated');
  // };

  //  handle notification preferences
 const handleToggle = async (type: 'email' | 'sms' | 'push', value: boolean) => {
   setNotifying((prev:any) => ({ ...prev, [type]: true }));

   const payload: NotificationPayload = {
     enable: value ,
   };

   try {
     if (type === 'email') {
       await settingsService.emailNotificationSettings(payload);
     }
     if (type === 'sms') {
       await settingsService.smsNotificationSettings(payload);
     }
     if (type === 'push') {
       await settingsService.pushNotificationSettings(payload);
     }

     const map = {
       email: 'emailNotifications',
       sms: 'smsNotifications',
       push: 'pushNotifications',
     } as const;

     setNotificationPreferences((prev:any) => ({
       ...prev,
       [map[type]]: value,
     }));

     toast.success(`${type.toUpperCase()} notifications ${value ? 'enabled' : 'disabled'}`);
   } catch (error: any) {
     toast.error(error?.message || 'Failed to update notification settings');
   } finally {
     setNotifying((prev:any) => ({ ...prev, [type]: false }));
   }
 };


  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'organization', name: 'Organization', icon: BuildingOfficeIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  const handleFileSelect = (file: File | null) => {
    if (file) {
      // preview locally before saving
      const previewUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        previewUrl,
        imageFile: file,
      }));
      setProfileImage(file); // keep in sync with backend upload
    } else {
      // user removed image
      setProfileData(prev => ({
        ...prev,
        previewUrl: '',
        imageFile: null,
      }));
      setProfileImage(null);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
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

        {/* Main Panel */}
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
                    currentImageUrl={profileData.previewUrl || profileData.backendImageUrl}
                    onFileSelect={handleFileSelect}
                    onRemove={() => {
                      setProfileData(prev => ({ ...prev, previewUrl: '', imageFile: null }));
                      setProfileImage(null);
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
                      onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                    required
                    disabled
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Birthday"
                      type="date"
                      value={profileData.birthday}
                      onChange={e => setProfileData({ ...profileData, birthday: e.target.value })}
                    />
                    <Input
                      label="Country"
                      value={profileData.country}
                      onChange={e => setProfileData({ ...profileData, country: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Gender
                      </label>
                      <select
                        value={profileData.gender}
                        onChange={e => setProfileData({ ...profileData, gender: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Level of Education
                      </label>
                      <select
                        value={profileData.levelOfEducation}
                        onChange={e =>
                          setProfileData({ ...profileData, levelOfEducation: e.target.value })
                        }
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
                    <Button type="submit">Save Changes</Button>
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
                        className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden"
                        style={{
                          backgroundColor: organization.logo
                            ? 'transparent'
                            : organization.primaryColor,
                        }}
                      >
                        {organization.logo ? (
                          <img
                            src={organization.logo}
                            alt={organization.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BuildingOfficeIcon className="h-8 w-8 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {organization?.name ?? 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {organization?.description ?? 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            organization.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : organization.status === 'suspended'
                              ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          }`}
                        >
                          {organization.status}
                        </span>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Enrolled Since
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {formatDate(user?.createdAt)}
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

                    {import.meta.env.DEV && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
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
                      You are not currently enrolled in any organization. Contact your administrator
                      for enrollment.
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
                    onChange={e =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    required
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={e =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    required
                    helpText="Must be at least 8 characters"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={e =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    required
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updatingPassword}>
                      {updatingPassword ? 'Updating ...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
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
                  {(['emailNotifications', 'pushNotifications', 'smsNotifications'] as const).map(
                    pref => {
                      const titles = {
                        emailNotifications: 'Email Notifications',
                        pushNotifications: 'Push Notifications',
                        smsNotifications: 'SMS Notifications',
                      };
                      const descriptions = {
                        emailNotifications: 'Receive notifications via email',
                        pushNotifications: 'Receive push notifications on your devices',
                        smsNotifications: 'Receive text messages for important updates',
                      };

                      // Map the pref to the type used in handleToggle
                      const typeMap = {
                        emailNotifications: 'email',
                        pushNotifications: 'push',
                        smsNotifications: 'sms',
                      } as const;

                      return (
                        <div key={pref} className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {titles[pref]}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {descriptions[pref]}
                            </p>
                          </div>

                          <Switch
                            checked={notificationPreferences[pref]}
                            onChange={value => handleToggle(typeMap[pref], value)}
                            disabled={notifying[typeMap[pref]]}
                            loading={notifying[typeMap[pref]]}
                            size="md"
                          />
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
