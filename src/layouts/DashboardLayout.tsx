import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
// import { useNotifications } from '../hooks/useNotifications';
import { organizationService } from '../services/organizationService';
// import { Organization } from '../types';
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  EyeIcon,
  ArrowUturnLeftIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BellIcon,
  QueueListIcon,
  DocumentTextIcon,
  // EnvelopeIcon,
  PencilSquareIcon,
  PresentationChartLineIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { NotificationBell } from '../components/ui/NotificationBell';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { useOrganizationStore } from '../stores/organizationStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isViewingAs, exitViewAs, originalUser } = useAuthStore();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useUIStore();
  // const { unreadCount } = useNotifications(); // We only need unreadCount since NotificationBell uses it
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { neworganization: organization, refetchOrganization } = useOrganizationStore();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Load organization data
  useEffect(() => {
    const loadOrganization = async () => {
      // Superusers should not load organization data at all.
      if (user?.role === 'superuser') {
        setLoadingOrg(false);
        return;
      }

      // For other roles (admin, teacher, student),
      // show "No organization found" gracefully if no data exists.
      if (!user?.organizationDetails?.id) {
        //  setOrganization(null); // Explicitly set to null for UI checks
        refetchOrganization(String(user?.organizationDetails?.id));
        toast.error('No organization assigned to your account.');
        setLoadingOrg(false);
        return;
      }

      try {
        await organizationService.getOrganizationById(
          user.organizationDetails.id.toString()
        );
        //  setOrganization(orgData);
        refetchOrganization(String(user.organizationDetails.id));
      } catch (error) {
        console.error('Failed to load organization:', error);
        toast.error('Error loading organization details.');
      } finally {
        setLoadingOrg(false);
      }
    };

    loadOrganization();
  }, [user, refetchOrganization]);


  const handleLogout = async () => {
    console.log('handleLogout called');
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const handleLogoutClick = () => {
    console.log('handleLogoutClick called');
    setShowLogoutConfirm(true);
  };

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleViewAsExit = () => {
    exitViewAs();
    toast.success('Exited view as mode');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'teacher':
        return 'Teacher';
      case 'admin':
        return 'Admin';
      case 'superuser':
        return 'Superuser';
      default:
        return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'teacher':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'superuser':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getProfileMenuItems = () => {
    const baseItems = [{ name: 'Profile', href: `/${user?.role}/settings`, icon: UserIcon }];

    if (user?.role === 'student') {
      baseItems.push(
        { name: 'My Courses', href: '/student/my-courses', icon: BookOpenIcon },
        { name: 'Discover', href: '/student/discover', icon: MagnifyingGlassIcon }
      );
    }

    return baseItems;
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'student':
        return [
          { name: 'Dashboard', href: '/student/dashboard', icon: HomeIcon },
          { name: 'Todo', href: '/student/todo', icon: QueueListIcon },
          { name: 'My Courses', href: '/student/my-courses', icon: BookOpenIcon },
          { name: 'Discover', href: '/student/discover', icon: MagnifyingGlassIcon },
          { name: 'Reports', href: '/student/reports', icon: ChartBarIcon },
          { name: 'Notifications', href: '/student/notifications', icon: BellIcon },
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', href: '/teacher/dashboard', icon: HomeIcon },
          { name: 'Todo', href: '/teacher/todo', icon: QueueListIcon },
          { name: 'Courses', href: '/teacher/courses', icon: BookOpenIcon },
          { name: 'Programs', href: '/teacher/programs', icon: AcademicCapIcon },
          { name: 'Certificates', href: '/teacher/certificates', icon: DocumentTextIcon },
          { name: 'Notifications', href: '/teacher/notifications', icon: BellIcon },
          { name: 'Reports', href: '/teacher/reports', icon: ChartBarIcon },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
          { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
          { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
          { name: 'Programs', href: '/admin/programs', icon: AcademicCapIcon },
          { name: 'Organization', href: '/admin/organization', icon: BuildingOfficeIcon },
          { name: 'Email Templates', href: '/admin/email-templates', icon: PencilSquareIcon },
          { name: 'Notifications', href: '/admin/notifications', icon: BellIcon },
          { name: 'Reports', href: '/admin/reports', icon: PresentationChartLineIcon },
          { name: 'Settings', href: '/admin/settings', icon: CogIcon },
        ];
      case 'superuser':
        return [
          { name: 'Dashboard', href: '/superuser/dashboard', icon: HomeIcon },
          { name: 'Organizations', href: '/superuser/organizations', icon: BuildingOfficeIcon },
          { name: 'Users', href: '/superuser/users', icon: UserGroupIcon },
          { name: 'Reports', href: '/superuser/reports', icon: ChartBarIcon },
          { name: 'Settings', href: '/superuser/settings', icon: CogIcon },
        ];
      default:
        return [{ name: 'Dashboard', href: `/${user.role}/dashboard`, icon: HomeIcon }];
    }
  };

  const navigation = getNavigationItems();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) {
    return null;
  }

  const profileImage = (() => {
    if (!user?.images) return null;

    try {
      const parsed = JSON.parse(user.images);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
    } catch {
      return null;
    }
  })();


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - V2 Bold Redesign */}
      {/* Changed to fixed positioning on desktop */}
      <div
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-72'
          } bg-slate-900 text-white transform transition-all duration-300 ease-in-out 
        lg:translate-x-0 shadow-2xl overflow-hidden`}
      >
        {/* Sidebar Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-600/20 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -mr-32 -mb-32"></div>
        </div>

        <div className="relative flex flex-col h-full">
          {/* Logo Section */}
          <div className={`flex items-center h-20 border-b border-white/10 ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-6'}`}>
            <Link to={`/${user.role}/dashboard`} className={`flex items-center group ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-bold text-white tracking-tight whitespace-nowrap">
                  LMS<span className="text-blue-400">Platform</span>
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-2">
              {!sidebarCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors hidden lg:block"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Toggle button for collapsed state - Centered below logo */}
          {sidebarCollapsed && (
            <div className="flex justify-center py-2 hidden lg:flex">
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
            {/* Organization Info */}
            {user.role !== 'teacher' && user.role !== 'superuser' && !loadingOrg && organization && (
              <div className={`rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm ${sidebarCollapsed ? 'p-2 flex justify-center' : 'p-4'}`}>
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                  {organization.logo ? (
                    <img
                      src={organization?.logo}
                      alt={organization.name}
                      className="w-10 h-10 object-cover rounded-xl shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md flex-shrink-0">
                      <BuildingOfficeIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {!sidebarCollapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {organization.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Workspace
                      </p>
                    </div>
                  )}
                </div>

                {isViewingAs && originalUser && !sidebarCollapsed && (
                  <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-200">
                          Viewing as {user.firstName}
                        </span>
                      </div>
                      <button
                        onClick={handleViewAsExit}
                        className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center space-x-1"
                      >
                        <ArrowUturnLeftIcon className="h-3 w-3" />
                        <span>Exit</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <nav className="space-y-1.5">
              {navigation.map(item => {
                const isActiveItem = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
                      } py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${isActiveItem
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    onClick={() => setSidebarOpen(false)}
                    title={sidebarCollapsed ? item.name : undefined}
                  >
                    {isActiveItem && (
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    )}
                    <item.icon className={`h-6 w-6 flex-shrink-0 transition-transform duration-300 ${isActiveItem ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {!sidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                    {isActiveItem && !sidebarCollapsed && (
                      <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-glow"></div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Menu */}
          <div className="p-4 border-t border-white/10 space-y-2 bg-slate-900/50 backdrop-blur-md">
            <button
              onClick={toggleTheme}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
                } py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 w-full`}
              title={
                sidebarCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined
              }
            >
              {theme === 'light' ? (
                <>
                  <MoonIcon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="whitespace-nowrap">Dark Mode</span>}
                </>
              ) : (
                <>
                  <SunIcon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="whitespace-nowrap">Light Mode</span>}
                </>
              )}
            </button>

            <button
              onClick={handleLogoutClick}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
                } py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 w-full`}
              title={sidebarCollapsed ? 'Sign Out' : undefined}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      {/* Added margin-left to accommodate fixed sidebar */}
      <div className={`flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        {/* Header - V2 Bold Redesign */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex-1 flex items-center">
              {/* Organization Badge in Header for non-teachers */}
              {user.role !== 'teacher' &&
                user.role !== 'superuser' &&
                !loadingOrg &&
                organization && (
                  <div className="hidden lg:flex items-center space-x-3 bg-gray-100 dark:bg-gray-700/50 rounded-full pl-2 pr-4 py-1.5 border border-gray-200 dark:border-gray-600">
                    {organization.logo ? (
                      <img
                        src={organization.logo}
                        alt={organization.name}
                        className="w-8 h-8 object-cover center mr-1 rounded-full shadow-sm"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {organization.name}
                    </span>
                  </div>
                )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50">
                <SparklesIcon className="h-4 w-4 text-blue-500 mr-2" />
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                  {user.role} Workspace
                </span>
              </div>

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

              <NotificationBell />

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-3 focus:outline-none group"
                  aria-label="User profile"
                >
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                      <span className="text-sm font-bold text-white">
                        {user.firstName?.charAt(0).toUpperCase()}
                        {user.lastName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200">
                    {/* User Info Header */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {user.email}
                      </p>
                      {/* Account Type Badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-3 ${getRoleBadgeClass(
                          user.role
                        )}`}
                      >
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {getProfileMenuItems().map(item => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <item.icon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500" />
                          <span>{item.name}</span>
                        </Link>
                      ))}

                      {/* Theme Toggle */}
                      <button
                        onClick={toggleTheme}
                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors"
                      >
                        {theme === 'light' ? (
                          <>
                            <MoonIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <span>Dark Mode</span>
                          </>
                        ) : (
                          <>
                            <SunIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <span>Light Mode</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto custom-scrollbar">
          {/* Adjusted padding to be cleaner and removed max-width for full fluid layout */}
          <div className="p-4 sm:p-6 lg:p-8 w-full">{children}</div>
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You will need to log back in to access your account."
        confirmText="Sign Out"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
};
