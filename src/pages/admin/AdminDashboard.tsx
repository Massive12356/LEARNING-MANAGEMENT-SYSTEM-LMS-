import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AnnouncementForm } from '../../components/admin/AnnouncementForm';
import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { Organization } from '../../types';
import {
  UserGroupIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(true);
  const [orgLoading, setOrgLoading] = useState(true);

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
      const [usersData, coursesData, programsData] = await Promise.all([
        mockApi.getUsers({ organizationId: user?.organizationId }),
        mockApi.getCourses({ organizationId: user?.organizationId }),
        mockApi.getPrograms({ organizationId: user?.organizationId }),
      ]);

      // Mock recent activity and alerts
      const mockRecentUsers = usersData.data.slice(0, 5);
      const mockRecentActivity = [
        { type: 'enrollment', user: 'John Doe', course: 'React Basics', time: '2 hours ago' },
        {
          type: 'completion',
          user: 'Jane Smith',
          course: 'TypeScript Advanced',
          time: '4 hours ago',
        },
        { type: 'registration', user: 'Mike Johnson', time: '6 hours ago' },
        {
          type: 'course_created',
          user: 'Sarah Wilson',
          course: 'JavaScript Fundamentals',
          time: '1 day ago',
        },
      ];
      const mockSystemAlerts = [
        {
          type: 'warning',
          message: 'Server maintenance scheduled for this weekend',
          time: '1 hour ago',
        },
        { type: 'info', message: '5 new user registrations pending approval', time: '3 hours ago' },
      ];

      setDashboardData({
        totalUsers: usersData.data.length,
        totalCourses: coursesData.length,
        totalPrograms: programsData.length,
        activeEnrollments: 89, // Mock data
        recentUsers: mockRecentUsers,
        recentActivity: mockRecentActivity,
        systemAlerts: mockSystemAlerts,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadOrganization();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  const stats = [
    {
      name: 'Total Users',
      value: dashboardData.totalUsers.toString(),
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      href: '/admin/users',
    },
    {
      name: 'Total Courses',
      value: dashboardData.totalCourses.toString(),
      icon: BookOpenIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      href: '/admin/courses',
    },
    {
      name: 'Programs',
      value: dashboardData.totalPrograms.toString(),
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      href: '/admin/programs',
    },
    {
      name: 'Active Enrollments',
      value: dashboardData.activeEnrollments.toString(),
      icon: ChartBarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      href: '/admin/reports',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with Organization Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your organization's learning platform
          </p>
          {orgLoading ? (
            <div className="mt-2 h-4 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          ) : organization?.id ? (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400 group relative">
              {organization?.logo ? (
                <img
                  src={organization?.logo}
                  alt={organization?.name}
                  className="w-7 h-7 object-cover center mr-1 rounded-full"
                />
              ) : (
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              )}
              <span className="uppercase">{organization?.name ?? 'N/A'}</span>
              <span className="ml-3 text-zinc-900 dark:text-yellow-500 font-medium">
                {organization?.organizationCode ?? 'N/A'}
              </span>
              <button
                className="ml-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleCopy(organization.organizationCode ?? 'N/A')}
                title="Copy organization code"
              >
                <ClipboardDocumentIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </button>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No organization found</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/admin/users">
            <Button variant="outline">
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button>
              <ChartBarIcon className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* System Alerts */}
      {dashboardData.systemAlerts.length > 0 && (
        <div className="space-y-3">
          {dashboardData.systemAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                alert.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon
                  className={`h-5 w-5 mr-3 ${
                    alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`}
                />
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      alert.type === 'warning'
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    {alert.message}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      alert.type === 'warning'
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
            <Link key={stat.name} to={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity and Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </CardHeader>
          <CardContent>
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
                      {activity.user}{' '}
                      {activity.type === 'enrollment'
                        ? 'enrolled in'
                        : activity.type === 'completion'
                        ? 'completed'
                        : activity.type === 'registration'
                        ? 'registered'
                        : 'created'}{' '}
                      {activity.course || ''}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Users</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentUsers.map(user => (
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
                    className={`px-2 py-1 text-xs rounded-full capitalize ${
                      user.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                        : user.role === 'teacher'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
