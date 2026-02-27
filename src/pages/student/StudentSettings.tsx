import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { organizationService } from '../../services/organizationService';
import { settingsService, NotificationPreferences } from '../../services/settingsService';
import { Organization } from '../../types';
import {
  UserIcon,
  BuildingOfficeIcon,
  KeyIcon,
  BellIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ProfilePictureUpload } from '../../components/ui/ProfilePictureUpload';

export const StudentSettings: React.FC = () => {
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
    if (!user?.organizationDetails?.id) {
      // If user has no organization, we're done loading
      setOrganization(null);
      setLoading(false);
      return;
    }

    try {
      const orgData = await organizationService.getOrganizationById(user?.organizationDetails?.id.toString());
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
    <div className="space-y-10 pb-12">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-200 text-sm font-medium">
                <Cog6ToothIcon className="h-4 w-4 mr-2" />
                <span>Account Preferences</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Settings
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Manage your account settings, security, and notification preferences.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="text-white text-xs font-bold leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="sticky top-8 bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group w-full flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all ${isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 translate-x-1'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-xl mr-3 transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700/50 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                        }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {tab.name}
                    </div>
                    {isActive && <ArrowRightIcon className="h-4 w-4 text-white/70" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <UserCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Profile Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Update your personal details and public profile.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center mb-10 pb-10 border-b border-gray-100 dark:border-gray-700">
                <ProfilePictureUpload
                  currentImageUrl={user?.images || undefined}
                  onFileSelect={(file) => {
                    // Internal handling
                  }}
                  onRemove={() => {
                    if (user) {
                      updateUser({ ...user, images: undefined });
                    }
                  }}
                />
                <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
                  Profile Photo
                </p>
                {user?.images && (
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        updateUser({ ...user, images: undefined });
                      }
                    }}
                    className="mt-4 text-xs font-bold text-red-500 hover:text-red-600 transition-colors uppercase tracking-widest"
                  >
                    Remove Picture
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="First Name"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                  <Input
                    label="Last Name"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                  disabled
                  className="rounded-xl bg-gray-50 dark:bg-gray-900/50"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="Birthday"
                    type="date"
                    value={profileData.birthday}
                    onChange={(e) => setProfileData({ ...profileData, birthday: e.target.value })}
                    className="rounded-xl"
                  />
                  <Input
                    label="Country"
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Gender
                    </label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                      Level of Education
                    </label>
                    <select
                      value={profileData.levelOfEducation}
                      onChange={(e) => setProfileData({ ...profileData, levelOfEducation: e.target.value })}
                      className="block w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
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
                  <Button type="submit" className="h-12 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/25 transition-all">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Organization Tab */}
          {activeTab === 'organization' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                  <BuildingOfficeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Organization Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    View information about your primary institution.
                  </p>
                </div>
              </div>

              {organization?.id ? (
                <div className="space-y-10">
                  <div className="flex items-start gap-6 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3"
                      style={{ backgroundColor: organization?.primaryColor || '#4F46E5' }}
                    >
                      <BuildingOfficeIcon className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {organization?.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-2xl">
                        {organization?.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                          Current Status
                        </p>
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${organization.status === 'active'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                          {organization?.status}
                        </span>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                          Join Date
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <UserCircleIcon className="h-4 w-4 text-gray-400" />
                          {user?.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                          Administrative Support
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                          Need help with your enrollment? Contact your system administrator for priority support.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dev Reset Button - Only shown in development */}
                  {import.meta.env.DEV && (
                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold text-xs h-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        onClick={() => {
                          setOrganization(null);
                          setTimeout(() => loadOrganization(), 500);
                          toast.success('Refreshed');
                        }}
                      >
                        Dev: Refresh Org Data
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit mx-auto mb-6">
                    <BuildingOfficeIcon className="h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No Active Enrollment
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
                    You are not currently associated with an academic institution. Please contact your administrator.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-xl">
                  <KeyIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Security Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Update your account password and security preferences.
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-8">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="rounded-xl"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="New Password"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    helpText="Must be at least 8 characters"
                    className="rounded-xl"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="h-12 px-8 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold shadow-lg transition-all">
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                  <BellIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Manage how you receive updates and announcements.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via your registered email.', color: 'blue' },
                  { id: 'pushNotifications', label: 'Push Notifications', desc: 'Real-time alerts on your browser or device.', color: 'purple' },
                  { id: 'smsNotifications', label: 'SMS Notifications', desc: 'Important alerts sent directly to your phone.', color: 'green' }
                ].map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/20 transition-all">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        {pref.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {pref.desc}
                      </p>
                    </div>
                    <Button
                      variant={(notificationPreferences as any)[pref.id] ? "primary" : "outline"}
                      size="sm"
                      className={`rounded-xl px-6 font-bold h-10 ${(notificationPreferences as any)[pref.id] ? 'bg-blue-600 text-white' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'}`}
                      onClick={() => handleNotificationPreferencesUpdate(pref.id as any, !(notificationPreferences as any)[pref.id])}
                    >
                      {(notificationPreferences as any)[pref.id] ? 'Active' : 'Muted'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;