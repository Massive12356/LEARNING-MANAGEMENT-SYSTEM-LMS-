import React, { useState, useEffect } from 'react';
import { useAuthStore, normalizeUser } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Switch } from '../../components/ui/Switch';
import { organizationService } from '../../services/organizationService';
import { settingsService } from '../../services/settingsService';
import { User, Organization, NotificationPayload, NotificationPreferences } from '../../types';
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
  const [notifying, setNotifying] = useState({ email: false, sms: false, push: false });
  const [updatingProfile, setUpdatingProfile] = useState(false);

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
    emailNotificationEnabler: true,
    pushNotificationEnabler: true,
    smsNotificationEnabler: false,
  });

  // Only allow File or null for the image to send to backend
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // Keep a separate URL for preview
  const [previewUrl, setPreviewUrl] = useState<string>(profileData.backendImageUrl || '');

  // Load user & organization data once
  useEffect(() => {
    if (!user) return;

    const normalizedUser = normalizeUser(user);

    // Parse backend images safely
    let imagesArray: string[] = [];
    try {
      imagesArray = normalizedUser.images ? JSON.parse(normalizedUser.images) : [];
    } catch {
      imagesArray = [];
    }
    const firstImage = imagesArray[0] || '';

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
      backendImageUrl: firstImage,
      previewUrl: firstImage,
    });

    setProfileImage(null); // start with no new file selected
    setPreviewUrl(firstImage);

    setNotificationPreferences({
      emailNotificationEnabler: user.emailNotificationEnabler ?? false,
      smsNotificationEnabler: user.smsNotificationEnabler ?? false,
      pushNotificationEnabler: user.pushNotificationEnabler ?? false,
    });

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

    setUpdatingProfile(true);

    try {
      const formData = new FormData();

      // Append text fields
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('email', profileData.email);
      formData.append('role', user.role);
      formData.append('status', 'active');
      formData.append('country', profileData.country);
      if (profileData.gender.trim()) formData.append('gender', profileData.gender);
      formData.append('levelOfEducation', profileData.levelOfEducation);
      formData.append('birthday', profileData.birthday || '');

      // Append notification preferences
      formData.append(
        'emailNotificationEnabler',
        notificationPreferences.emailNotificationEnabler ? 'true' : 'false'
      );
      formData.append(
        'smsNotificationEnabler',
        notificationPreferences.smsNotificationEnabler ? 'true' : 'false'
      );
      formData.append(
        'pushNotificationEnabler',
        notificationPreferences.pushNotificationEnabler ? 'true' : 'false'
      );

      // Append image if selected
      if (profileImage) {
        formData.append('images', profileImage);
      }

      console.log('images', profileImage);

      await adminService.updateProfileDetails(user.id, formData);

      // Fetch updated user
      const updatedUser = await adminService.getUserById(user.id);
      updateUser(updatedUser);

      // Parse backend images for preview
      let updatedImages: string[] = [];
      try {
        updatedImages = updatedUser.images ? JSON.parse(updatedUser.images) : [];
      } catch { }
      const firstImage = updatedImages[0] || '';

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
        backendImageUrl: firstImage,
        previewUrl: firstImage,
      }));

      setProfileImage(null);
      setPreviewUrl(firstImage);

      toast.success('Profile updated successfully');
    } catch (err: any) {
      console.error(err?.message);
      toast.error(err?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
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

  //  handle notification preferences
  const handleToggle = async (type: 'email' | 'sms' | 'push', value: boolean) => {
    setNotifying(prev => ({ ...prev, [type]: true }));

    const payload: NotificationPayload = { enable: value };

    try {
      // Call backend
      if (type === 'email') await settingsService.emailNotificationSettings(payload);
      if (type === 'sms') await settingsService.smsNotificationSettings(payload);
      if (type === 'push') await settingsService.pushNotificationSettings(payload);

      // Fetch fresh user from backend
      const updatedUser = await adminService.getUserById(user!.id);
      updateUser(updatedUser);

      // Update local state
      const typeMap = {
        email: 'emailNotificationEnabler',
        sms: 'smsNotificationEnabler',
        push: 'pushNotificationEnabler',
      } as const;

      setNotificationPreferences(prev => ({
        ...prev,
        [typeMap[type]]: value,
      }));

      toast.success(`${type.toUpperCase()} notifications ${value ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update notification settings');
    } finally {
      setNotifying(prev => ({ ...prev, [type]: false }));
    }
  };



  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'organization', name: 'Organization', icon: BuildingOfficeIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  const handleFileSelect = (file: File | null) => {
    setProfileImage(file); // only File goes to backend
    setPreviewUrl(file ? URL.createObjectURL(file) : profileData.backendImageUrl || '');
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-200 text-sm font-medium">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                <span>Admin Settings</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Settings & Preferences
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Manage your account, profile, and organization preferences in one central place.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <div className="lg:w-1/4">
          <nav className="space-y-2 sticky top-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-5 py-4 text-sm font-bold rounded-2xl transition-all duration-200 group ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200/50 dark:shadow-none translate-x-1'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-gray-100 dark:border-gray-700'
                    }`}
                >
                  <Icon className={`h-5 w-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                    }`} />
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
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
                <p className="text-gray-500 text-sm mt-1">Manage your personal identity and public profile</p>
              </div>

              <div className="flex flex-col items-center mb-10 pb-10 border-b border-gray-100 dark:border-gray-700">
                <div className="relative group">
                  <ProfilePictureUpload
                    currentImageUrl={previewUrl}
                    onFileSelect={handleFileSelect}
                    onRemove={() => {
                      setProfileImage(null);
                      setPreviewUrl(profileData.backendImageUrl || '');
                    }}
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-600">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="mt-4 text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Profile Photo
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Click the circle to upload a new image
                </p>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="First Name"
                    value={profileData.firstName}
                    onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="rounded-xl border-gray-200 focus:ring-blue-500/20"
                    required
                  />
                  <Input
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="rounded-xl border-gray-200 focus:ring-blue-500/20"
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
                  className="rounded-xl bg-gray-50 cursor-not-allowed border-gray-200 opacity-60"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="Birthday"
                    type="date"
                    value={profileData.birthday}
                    onChange={e => setProfileData({ ...profileData, birthday: e.target.value })}
                    className="rounded-xl border-gray-200"
                  />
                  <Input
                    label="Country"
                    value={profileData.country}
                    onChange={e => setProfileData({ ...profileData, country: e.target.value })}
                    className="rounded-xl border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight ml-1">
                      Gender
                    </label>
                    <select
                      value={profileData.gender}
                      onChange={e => setProfileData({ ...profileData, gender: e.target.value })}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight ml-1">
                      Education
                    </label>
                    <select
                      value={profileData.levelOfEducation}
                      onChange={e =>
                        setProfileData({ ...profileData, levelOfEducation: e.target.value })
                      }
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updatingProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none px-8 py-3 rounded-xl font-bold transition-all"
                  >
                    {updatingProfile ? 'Updating...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Organization Tab */}
          {activeTab === 'organization' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Details</h2>
                <p className="text-gray-500 text-sm mt-1">Information about your connected institution</p>
              </div>

              {organization ? (
                <div className="space-y-10">
                  <div className="flex flex-col md:flex-row md:items-center p-8 rounded-3xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 gap-8">
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0"
                      style={{
                        backgroundColor: organization.logo ? 'transparent' : organization.primaryColor,
                      }}
                    >
                      {organization.logo ? (
                        <img
                          src={organization.logo}
                          alt={organization.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BuildingOfficeIcon className="h-10 w-10 text-white" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {organization?.name ?? 'N/A'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-lg">
                        {organization?.description ?? 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                        Network Status
                      </label>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full uppercase tracking-tighter ${organization.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                            : organization.status === 'suspended'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 ${organization.status === 'active' ? 'bg-green-600' : organization.status === 'suspended' ? 'bg-red-600' : 'bg-yellow-600'}`} />
                          {organization.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                        Member Since
                      </label>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatDate(user?.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="p-8 rounded-3xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">Administrator Support</h4>
                    <p className="text-sm text-blue-800/70 dark:text-blue-400/70 leading-relaxed">
                      For organization-level configuration, billing, or technical issues, please contact your system administrator or the IT help desk.
                    </p>
                  </div>

                  {import.meta.env.DEV && (
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOrganization(null);
                          setTimeout(() => loadOrganization(), 500);
                          toast.success('Organization data refreshed');
                        }}
                        className="rounded-xl border-dashed"
                      >
                        Refresh Metadata (Dev)
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                  <BuildingOfficeIcon className="h-16 w-16 mx-auto text-gray-300 mb-6" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    No Organization Linked
                  </h3>
                  <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                    Your account is not currently associated with an active organization.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
                <p className="text-gray-500 text-sm mt-1">Protect your account with a strong password</p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-8">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={e =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                  className="rounded-xl border-gray-200"
                />

                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={e =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  helpText="Must be at least 8 characters with a mix of letters and numbers"
                  className="rounded-xl border-gray-200"
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={e =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                  className="rounded-xl border-gray-200"
                />

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <Button
                    type="submit"
                    disabled={updatingPassword}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                  >
                    {updatingPassword ? 'Updating ...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>
          )}
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                <p className="text-gray-500 text-sm mt-1">Control how and when you receive updates</p>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {(
                  [
                    'emailNotificationEnabler',
                    'pushNotificationEnabler',
                    'smsNotificationEnabler',
                  ] as const
                ).map(pref => {
                  const titles = {
                    emailNotificationEnabler: 'Email Notifications',
                    pushNotificationEnabler: 'Push Notifications',
                    smsNotificationEnabler: 'SMS Notifications',
                  };
                  const descriptions = {
                    emailNotificationEnabler: 'Get important updates and reports delivered to your inbox.',
                    pushNotificationEnabler: 'Real-time alerts on your browser and mobile devices.',
                    smsNotificationEnabler: 'Direct text messages for critical urgent system alerts.',
                  };

                  const typeMap = {
                    emailNotificationEnabler: 'email',
                    pushNotificationEnabler: 'push',
                    smsNotificationEnabler: 'sms',
                  } as const;

                  return (
                    <div key={pref} className="flex items-center justify-between py-8 first:pt-0 last:pb-0">
                      <div className="max-w-md">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                          {titles[pref]}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
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
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
