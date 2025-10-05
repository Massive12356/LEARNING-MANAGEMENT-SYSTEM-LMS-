import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useNotifications } from '../contexts/NotificationContext';
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
  UserIcon
} from '@heroicons/react/24/outline';
import { NotificationBell } from '../components/ui/NotificationBell';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isViewingAs, exitViewAs, originalUser } = useAuth();
  const { theme, toggleTheme } = useUI();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load organization data
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!user) return;
      
      try {
        setLoadingOrg(true);
        
        if (user.role === 'admin' || user.role === 'superuser') {
          // Admins and superusers can see all organizations
          const allOrgs = await organizationService.getOrganizations();
          setOrganizations(allOrgs);
          
          // For admins, also set current organization
          if (user.organizationId && user.role === 'admin') {
            const org = allOrgs.find(o => o.id === user.organizationId) || null;
            setOrganization(org);
          }
        } else if (user.organizationId) {
          // Students and teachers get their specific organization
          const org = await organizationService.getOrganizationById(user.organizationId);
          setOrganization(org);
        }
      } catch (error) {
        console.error('Error loading organization data:', error);
      } finally {
        setLoadingOrg(false);
      }
    };

    loadOrganizationData();
  }, [user]);

  const navigation = React.useMemo(() => {
    if (!user) return [];

    const baseNav = [
      { name: 'Dashboard', href: `/${user.role}/dashboard`, icon: HomeIcon },
    ];

    switch (user.role) {
      case 'student':
        return [
          ...baseNav,
          { name: 'Todo', href: '/student/todo', icon: ChartBarIcon },
          { name: 'My Courses', href: '/student/my-courses', icon: BookOpenIcon },
          { name: 'Discover', href: '/student/discover', icon: MagnifyingGlassIcon },
          { name: 'Notifications', href: '/student/notifications', icon: ChartBarIcon },
          { name: 'Reports', href: '/student/reports', icon: ChartBarIcon },
          { name: 'Settings', href: '/student/settings', icon: CogIcon },
        ];
      case 'teacher':
        return [
          ...baseNav,
          { name: 'Courses', href: '/teacher/courses', icon: BookOpenIcon },
          { name: 'Certificates', href: '/teacher/certificates', icon: AcademicCapIcon },
          { name: 'Notifications', href: '/teacher/notifications', icon: ChartBarIcon },
          { name: 'Reports', href: '/teacher/reports', icon: ChartBarIcon },
        ];
      case 'admin':
        return [
          ...baseNav,
          { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
          { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
          { name: 'Programs', href: '/admin/programs', icon: AcademicCapIcon },
          { name: 'Organization', href: '/admin/organization', icon: BuildingOfficeIcon },
          { name: 'Notifications', href: '/admin/notifications', icon: ChartBarIcon },
          { name: 'Reports', href: '/admin/reports', icon: ChartBarIcon },
          { name: 'Settings', href: '/admin/settings', icon: CogIcon },
        ];
      case 'superuser':
        return [
          ...baseNav,
          { name: 'Organizations', href: '/superuser/organizations', icon: BuildingOfficeIcon },
          { name: 'Users', href: '/superuser/users', icon: UserGroupIcon },
          { name: 'System', href: '/superuser/system', icon: CogIcon },
          { name: 'Reports', href: '/superuser/reports', icon: ChartBarIcon },
        ];
      default:
        return baseNav;
    }
  }, [user]);

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

  // Close dropdown when route changes
  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [location]);

  const renderOrganizationBadge = () => {
    if (!organization || loadingOrg) return null;

    switch (user?.role) {
      case 'student':
        return (
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
            <BuildingOfficeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 truncate max-w-[120px]">
              {organization.name}
            </span>
          </div>
        );
      
      case 'teacher':
        return (
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            <BuildingOfficeIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300 truncate max-w-[120px]">
              Teaching at {organization.name}
            </span>
          </div>
        );
      
      case 'admin':
        return (
          <div 
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 cursor-pointer relative"
            onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
          >
            <BuildingOfficeIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-purple-700 dark:text-purple-300 truncate max-w-[120px]">
              {organization.name}
            </span>
            <ChevronDownIcon className="h-3 w-3 text-purple-600 dark:text-purple-400" />
            
            {orgDropdownOpen && organizations.length > 1 && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Switch Organization</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        // In a real app, this would switch organizations
                        toast.success(`Switched to ${org.name}`);
                        setOrgDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        org.id === organization?.id 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 'superuser':
        // Superusers have a global view, so we simplify the display
        return (
          <span 
            className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
            aria-label="Superuser with global access"
          >
            Global View
          </span>
        );
      
      default:
        return null;
    }
  };

  const handleProfileClick = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
  };

  const handleViewAsExit = () => {
    exitViewAs();
    setProfileDropdownOpen(false);
  };

  const getProfileMenuItems = () => {
    const baseItems = [
      { name: 'Profile', href: `/${user?.role}/settings`, icon: UserIcon },
      { name: 'Settings', href: `/${user?.role}/settings`, icon: CogIcon },
    ];

    if (user?.role === 'student') {
      baseItems.splice(1, 0, { name: 'My Courses', href: '/student/my-courses', icon: BookOpenIcon });
    }

    return baseItems;
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student Account';
      case 'teacher': return 'Teacher Account';
      case 'admin': return 'Administrator';
      case 'superuser': return 'Super User';
      default: return role;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'teacher': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'superuser': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform 
        lg:translate-x-0 lg:static lg:inset-0 shadow-xl`}>
        
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              LMS Platform
            </span>
          </Link>
          
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Organization Info in Sidebar (for mobile) */}
          {user.role !== 'teacher' && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
              {renderOrganizationBadge()}
            </div>
          )}

          {/* View As Banner */}
          {isViewingAs && originalUser && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                    Viewing as {user.firstName} {user.lastName}
                  </span>
                </div>
                <button
                  onClick={handleViewAsExit}
                  className="text-xs text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 flex items-center space-x-1"
                >
                  <ArrowUturnLeftIcon className="h-3 w-3" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <MoonIcon className="h-5 w-5" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <SunIcon className="h-5 w-5" />
                  <span>Light Mode</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Sign Out</span>
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
              {user.role !== 'teacher' && renderOrganizationBadge()}
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
                        onClick={handleLogout}
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
    </div>
  );
};