import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { organizationService } from '../../services/organizationService';
import { Organization } from '../../types';
import {
  UserGroupIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalPrograms: 0,
    activeEnrollments: 0,
    recentUsers: [] as any[],
    recentActivity: [] as any[],
    systemAlerts: [] as any[],
  });
  const [orgLoading, setOrgLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [recentUsersLoading, setRecentUsersLoading] = useState(false);
  const [recentActivityLoading, setRecentActivityLoading] = useState(true);

  const loadOrganization = async () => {
    if (!user?.organizationDetails?.id) return;

    console.log('User from authStore:', user);

    try {
      setOrgLoading(true);
      const orgData = await organizationService.getOrganizationById(
        user.organizationDetails.id.toString()
      );
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
    } finally {
      setOrgLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // loading states
      setStatsLoading(true);
      setRecentUsersLoading(true);
      setRecentActivityLoading(true);

      const [statsResponse, recentUsersResponse, recentActivityResponse] = await Promise.all([
        adminService.getOrganizationStats(),
        adminService.getRecentUsers(),
        adminService.getRecentActivity(),
      ]);

      setDashboardData(prev => ({
        ...prev,
        totalUsers: statsResponse.stats.totalUsers,
        totalCourses: statsResponse.stats.totalCourses,
        totalPrograms: statsResponse.stats.totalPrograms,
        activeEnrollments: statsResponse.stats.activeEnrollments,
        recentUsers: recentUsersResponse.users ?? [],
        recentActivity: recentActivityResponse.activities ?? [],
        systemAlerts: [
          {
            type: 'warning',
            message: 'Server maintenance scheduled for this weekend',
            time: '1 hour ago',
          },
          {
            type: 'info',
            message: '5 new user registrations pending approval',
            time: '3 hours ago',
          },
        ],
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setStatsLoading(false);
      setRecentUsersLoading(false);
      setRecentActivityLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      const res = await navigator.clipboard.writeText(text);
      console.log('text Copied [admin DashBoard]', res);
      toast.success('code copied to clipboard!!');
    } catch (error) {
      console.log('failed to copy code [admin dashboard]', error);
      toast.error('failed to copy text!');
    }
  };

  // function to determine the activity and display a message
  const formatActivityMessage = (activity: any) => {
    switch (activity.type) {
      case 'user_registration':
        return `${activity?.data?.firstName} ${activity?.data?.lastName} registered`;

      case 'course_published':
        return `${activity?.data?.title} course was published`;

      case 'user_enrollment':
        return `${activity.data?.firstName} enrolled in ${activity.data?.courseTitle}.`;

      default:
        return `New Platform Activity`;
    }
  };

  const stats = [
    {
      name: 'Total Users',
      value: statsLoading ? ' Loading Users' : dashboardData.totalUsers.toString(),
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      href: '/admin/users',
    },
    {
      name: 'Total Courses',
      value: statsLoading ? 'Loading Courses' : dashboardData.totalCourses.toString(),
      icon: BookOpenIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      href: '/admin/courses',
    },
    {
      name: 'Programs',
      value: statsLoading ? 'loading Programs' : dashboardData.totalPrograms.toString(),
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      href: '/admin/programs',
    },
    {
      name: 'Active Enrollments',
      value: statsLoading ? ' Loading Enrollments' : dashboardData.activeEnrollments.toString(),
      icon: ChartBarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      href: '/admin/reports',
    },
  ];

  useEffect(() => {
    loadDashboardData();
    loadOrganization();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header with Organization Context */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-200 text-sm font-medium">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  <span className="uppercase">{organization?.name ?? 'Admin Dashboard'}</span>
                </div>
                {organization?.organizationCode && (
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-500/20 text-blue-200 text-sm font-medium">
                    <span className="mr-2 opacity-60">Code:</span>
                    <span className="font-mono">{organization.organizationCode}</span>
                    <button
                      className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
                      onClick={() => handleCopy(organization.organizationCode!)}
                      title="Copy code"
                    >
                      <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Organization Overview
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Manage your organization's learning platform, users, and courses from one central hub.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link to="/admin/users">
                <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 border-none rounded-xl">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* System Alerts */}
      {dashboardData.systemAlerts.length > 0 && (
        <div className="space-y-3">
          {dashboardData.systemAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${alert.type === 'warning'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                }`}
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon
                  className={`h-5 w-5 mr-3 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                    }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${alert.type === 'warning'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-blue-800 dark:text-blue-200'
                      }`}
                  >
                    {alert.message}
                  </p>
                  <p
                    className={`text-xs mt-1 ${alert.type === 'warning'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-blue-600 dark:text-blue-400'
                      }`}
                  >
                    {alert.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} to={stat.href} className="block group">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p
                      className={`${statsLoading ? ' text-sm' : 'text-2xl'
                        } font-bold text-gray-900 dark:text-white`}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity and Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div>
            {recentActivityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="h-14 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            ) : dashboardData.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>

                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatActivityMessage(activity)}
                      </p>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Users</h2>
          </div>
          <div>
            <div className="space-y-4">
              {recentUsersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className="h-14 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"
                    ></div>
                  ))}
                </div>
              ) : dashboardData.recentUsers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent Users activity.
                </p>
              ) : (
                dashboardData.recentUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-shrink-0 h-10 w-10">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {user.firstName.charAt(0)}
                            {user.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${user.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                        : user.role === 'teacher'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}
                    >
                      {user.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/users">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <UserGroupIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Manage Users</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Add or remove users from your organization
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/admin/courses">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <BookOpenIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Manage Courses</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Review and approve courses in your organization
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/admin/organization">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <BuildingOfficeIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Organization Settings
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Configure your organization's branding and settings
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
