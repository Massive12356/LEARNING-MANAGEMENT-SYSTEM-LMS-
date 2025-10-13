import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { useNotifications } from '../hooks/useNotifications';
import { organizationService } from '../services/organizationService';
import { Organization } from '../types';
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
  EnvelopeIcon,
  PencilSquareIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { NotificationBell } from '../components/ui/NotificationBell';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isViewingAs, exitViewAs, originalUser } = useAuthStore();
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useUIStore();
  const { unreadCount } = useNotifications(); // We only need unreadCount since NotificationBell uses it
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
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
      if (!user?.organizationId) {
        setLoadingOrg(false);
        return;
      }

      try {
        const orgData = await organizationService.getOrganizationById(user.organizationId);
        setOrganization(orgData);
      } catch (error) {
        console.error('Failed to load organization:', error);
        toast.error('Failed to load organization data');
      } finally {
        setLoadingOrg(false);
      }
    };

    loadOrganization();
  }, [user]);

  const handleLogout = async () => {
    console.log('handleLogout called');
    try {
      await logout();
      navigate('/login');
    } catch (error) {
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
      case 'student': return 'Student';
      case 'teacher': return 'Teacher';
      case 'admin': return 'Admin';
      case 'superuser': return 'Superuser';
      default: return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'teacher': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'superuser': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getProfileMenuItems = () => {
    const baseItems = [
      { name: 'Profile', href: `/${user?.role}/settings`, icon: UserIcon }
    ];

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
          { name: 'Notifications', href: '/student/notifications', icon: BellIcon }
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', href: '/teacher/dashboard', icon: HomeIcon },
          { name: 'Courses', href: '/teacher/courses', icon: BookOpenIcon },
          { name: 'Certificates', href: '/teacher/certificates', icon: DocumentTextIcon },
          { name: 'Notifications', href: '/teacher/notifications', icon: BellIcon },
          { name: 'Reports', href: '/teacher/reports', icon: ChartBarIcon }
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
          { name: 'Reports', href: '/admin/reports', icon: PresentationChartLineIcon }
        ];
      case 'superuser':
        return [
          { name: 'Dashboard', href: '/superuser/dashboard', icon: HomeIcon },
          { name: 'Organizations', href: '/superuser/organizations', icon: BuildingOfficeIcon },
          { name: 'Users', href: '/superuser/users', icon: UserGroupIcon },
          { name: 'Reports', href: '/superuser/reports', icon: ChartBarIcon },
          { name: 'Settings', href: '/superuser/settings', icon: CogIcon }
        ];
      default:
        return [
          { name: 'Dashboard', href: `/${user.role}/dashboard`, icon: HomeIcon }
        ];
    }
  };

  const navigation = getNavigationItems();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-800 transform transition-all duration-300 ease-in-out 
        lg:translate-x-0 lg:static lg:inset-0 shadow-xl`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to={`/${user.role}/dashboard`} className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                LMS Platform
              </span>
            )}
          </Link>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hidden lg:block"
            >
              {sidebarCollapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronLeftIcon className="h-5 w-5" />
              )}
            </button>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Organization Info */}
          {user.role !== 'teacher' && !loadingOrg && organization && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {organization.logo ? (
                  <img 
                    src={organization.logo} 
                    alt={organization.name} 
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {organization.name}
                    </p>
                  </div>
                )}
              </div>
              
              {isViewingAs && originalUser && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <EyeIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      {!sidebarCollapsed && (
                        <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                          Viewing as {user.firstName} {user.lastName}
                        </span>
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <button
                        onClick={handleViewAsExit}
                        className="text-xs text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 flex items-center space-x-1"
                      >
                        <ArrowUturnLeftIcon className="h-3 w-3" />
                        <span>Exit</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActiveItem = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'space-x-3 px-3'} py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActiveItem
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Menu */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleTheme}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'space-x-3 px-3'} py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              title={sidebarCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
            >
              {theme === 'light' ? (
                <>
                  <MoonIcon className="h-5 w-5" />
                  {!sidebarCollapsed && <span>Dark Mode</span>}
                </>
              ) : (
                <>
                  <SunIcon className="h-5 w-5" />
                  {!sidebarCollapsed && <span>Light Mode</span>}
                </>
              )}
            </button>
            
            <button
              onClick={handleLogoutClick}
              className={`flex items-center ${sidebarCollapsed ? 'justify-center px-3' : 'space-x-3 px-3'} py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors`}
              title={sidebarCollapsed ? 'Sign Out' : undefined}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex-1 flex items-center">
              {/* Organization Badge in Header for non-teachers */}
              {user.role !== 'teacher' && !loadingOrg && organization && (
                <div className="hidden lg:flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1">
                  {organization.logo ? (
                    <img 
                      src={organization.logo} 
                      alt={organization.name} 
                      className="h-6 w-6 rounded object-cover"
                    />
                  ) : (
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {organization.name}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <NotificationBell />
              
              {/* User Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-label="User profile"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="h-9 w-9 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      {/* Account Type Badge */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleBadgeClass(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {getProfileMenuItems().map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <item.icon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      
                      {/* Theme Toggle */}
                      <button
                        onClick={toggleTheme}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {theme === 'light' ? (
                          <>
                            <MoonIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                            <span>Dark Mode</span>
                          </>
                        ) : (
                          <>
                            <SunIcon className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                            <span>Light Mode</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                      <button
                        onClick={handleLogoutClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
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