import React, { useState, useEffect, useCallback } from 'react';
import { normalizeUser, useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { organizationService } from '../../services/organizationService';
import { settingsService, NotificationPreferences } from '../../services/settingsService';
import { adminService } from '../../services/adminService';
import { Organization, NotificationPayload } from '../../types';
import {
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  Cog6ToothIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ProfilePictureUpload } from '../../components/ui/ProfilePictureUpload';
import { formatDate, formatDateForInput } from '../../utils/dateFormatter';

export const TeacherSettings: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [notifying, setNotifying] = useState({ email: false, sms: false, push: false });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    country: '',
    gender: '',
    levelOfEducation: '',
    imageFile: null as File | null,
    backendImageUrl: '',
    previewUrl: '',
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    emailNotifications: false,
    pushNotifications: false,
    smsNotifications: false,
  });

  const loadOrganization = useCallback(async () => {
    if (!user?.organizationDetails?.id) {
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
    if (!user) return;

    const normalizedUser = normalizeUser(user);

    let imagesArray: string[] = [];
    try {
      imagesArray = normalizedUser.images ? JSON.parse(normalizedUser.images) : [];
    } catch (error) {
      imagesArray = [];
    }
    const firstImage = imagesArray[0] || '';

    const genderEnumValue: any = (() => {
      switch (normalizedUser.gender?.toLowerCase()) {
        case 'male': return 'Male';
        case 'female': return 'Female';
        case 'other': return 'Other';
        case 'prefer not to say': return 'Prefer not to say';
        default: return '';
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
      backendImageUrl: firstImage,
      previewUrl: firstImage,
    });

    setProfileImage(null);
    setPreviewUrl(firstImage);

    setNotificationPreferences({
      emailNotifications: user.emailNotificationEnabler ?? false,
      smsNotifications: user.smsNotificationEnabler ?? false,
      pushNotifications: user.pushNotificationEnabler ?? false,
    });

    loadOrganization();
  }, [user, loadOrganization]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdatingProfile(true);

    try {
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('email', profileData.email);
      formData.append('role', user.role);
      formData.append('status', 'active');
      formData.append('country', profileData.country);
      if (profileData.gender.trim()) formData.append('gender', profileData.gender);
      formData.append('levelOfEducation', profileData.levelOfEducation);
      formData.append('birthday', profileData.birthday || '');

      formData.append('emailNotificationEnabler', notificationPreferences.emailNotifications ? 'true' : 'false');
      formData.append('smsNotificationEnabler', notificationPreferences.smsNotifications ? 'true' : 'false');
      formData.append('pushNotificationEnabler', notificationPreferences.pushNotifications ? 'true' : 'false');

      if (profileImage) {
        formData.append('images', profileImage);
      }

      await adminService.updateProfileDetailsUser(formData);

      const updatedUser = await adminService.getUserById(user.id);
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

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
      toast.error(error?.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleToggle = async (type: 'email' | 'sms' | 'push', value: boolean) => {
    if (!user) return;
    setNotifying(prev => ({ ...prev, [type]: true }));

    try {
      const payload: NotificationPayload = { enable: value };
      if (type === 'email') await settingsService.emailNotificationSettings(payload);
      if (type === 'sms') await settingsService.smsNotificationSettings(payload);
      if (type === 'push') await settingsService.pushNotificationSettings(payload);

      const updatedUser = await adminService.getUserById(user.id);
      updateUser(updatedUser);

      const typeMap = {
        email: 'emailNotifications',
        sms: 'smsNotifications',
        push: 'pushNotifications',
      } as const;

      setNotificationPreferences(prev => ({ ...prev, [typeMap[type]]: value }));
      toast.success(`${type.toUpperCase()} notifications ${value ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update notification settings');
    } finally {
      setNotifying(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleFileSelect = (file: File | null) => {
    setProfileImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : profileData.backendImageUrl || '');
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
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
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
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Settings</h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Manage your profile details, security preferences, and organization settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
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
                    <Icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4 space-y-6">
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your personal details and public profile</p>
              </div>
              <div className="p-8">
                <div className="flex flex-col items-center mb-8">
                  <ProfilePictureUpload
                    currentImageUrl={previewUrl}
                    onFileSelect={handleFileSelect}
                    onRemove={() => {
                      setProfileImage(null);
                      setPreviewUrl(profileData.backendImageUrl || '');
                    }}
                  />
                  <p className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Profile Photo</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to upload a new photo</p>
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
                      <select
                        value={profileData.gender}
                        onChange={e => setProfileData({ ...profileData, gender: e.target.value })}
                        className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      >
                        <option value="">Prefer not to say</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Level of Education</label>
                      <select
                        value={profileData.levelOfEducation}
                        onChange={e => setProfileData({ ...profileData, levelOfEducation: e.target.value })}
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
                    <Button type="submit" size="lg" disabled={updatingProfile} className="rounded-xl px-8 shadow-lg shadow-blue-500/20">
                      {updatingProfile ? 'Updating...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Organization Information</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Details about your enrolled organization</p>
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
                          {organization.logo ? (
                            <img src={organization.logo} alt={organization.name} className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <BuildingOfficeIcon className="h-10 w-10 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{organization.name}</h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-1">{organization.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${organization.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Enrolled Since</label>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{formatDate(user?.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold">No Organization Enrollment</h3>
                    <p className="text-gray-500">Contact your administrator for enrollment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your password and security preferences</p>
              </div>
              <div className="p-8">
                <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-2xl">
                  <Input
                    label="Current Password"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                  <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg" disabled={updatingPassword} className="rounded-xl px-8 shadow-lg shadow-blue-500/20">
                      {updatingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-8 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose how you want to be notified</p>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  {[
                    { key: 'emailNotificationEnabler', type: 'email', title: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'pushNotificationEnabler', type: 'push', title: 'Push Notifications', desc: 'Receive push notifications on your devices' },
                    { key: 'smsNotificationEnabler', type: 'sms', title: 'SMS Notifications', desc: 'Receive text messages for important updates' }
                  ].map(pref => (
                    <div key={pref.key} className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{pref.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pref.desc}</p>
                      </div>
                      <Switch
                        checked={(notificationPreferences as any)[pref.key]}
                        onChange={val => handleToggle(pref.type as any, val)}
                        disabled={(notifying as any)[pref.type]}
                        loading={(notifying as any)[pref.type]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
