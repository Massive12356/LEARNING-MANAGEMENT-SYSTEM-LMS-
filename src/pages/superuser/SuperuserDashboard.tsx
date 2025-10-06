import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  BookOpenIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export function SuperuserDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalOrganizations: 0,
    activeOrganizations: 0,
    totalUsers: 0,
    totalCourses: 0,
    systemHealth: 'healthy' as 'healthy' | 'warning' | 'critical',
    recentOrganizations: [] as any[],
    systemAlerts: [] as any[],
    platformStats: {
      uptime: '99.9%',
      responseTime: '120ms',
      activeUsers: 0,
      storageUsed: '2.4TB'
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with real API calls
      const mockData = {
        totalOrganizations: 24,
        activeOrganizations: 22,
        totalUsers: 5847,
        totalCourses: 342,
        systemHealth: 'healthy' as const,
        recentOrganizations: [
          { id: '1', name: 'TechEd Academy', status: 'active', users: 1247, createdAt: new Date('2024-01-15') },
          { id: '2', name: 'Business Skills Institute', status: 'active', users: 892, createdAt: new Date('2024-01-12') },
          { id: '3', name: 'Creative Learning Hub', status: 'active', users: 634, createdAt: new Date('2024-01-10') },
          { id: '4', name: 'Healthcare Training Center', status: 'suspended', users: 445, createdAt: new Date('2024-01-08') }
        ],
        systemAlerts: [
          { type: 'info', message: 'Scheduled maintenance this weekend', time: '2 hours ago' },
          { type: 'warning', message: 'High storage usage detected', time: '1 day ago' }
        ],
        platformStats: {
          uptime: '99.9%',
          responseTime: '120ms',
          activeUsers: 3421,
          storageUsed: '2.4TB'
        }
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Organizations',
      value: dashboardData.totalOrganizations.toString(),
      subValue: `${dashboardData.activeOrganizations} active`,
      icon: BuildingOfficeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      href: '/superuser/organizations'
    },
    {
      name: 'Total Users',
      value: dashboardData.totalUsers.toLocaleString(),
      subValue: `${dashboardData.platformStats.activeUsers} active`,
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      href: '/superuser/reports'
    },
    {
      name: 'Total Courses',
      value: dashboardData.totalCourses.toString(),
      subValue: 'Across all orgs',
      icon: BookOpenIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      href: '/superuser/reports'
    },
    {
      name: 'System Health',
      value: dashboardData.systemHealth === 'healthy' ? 'Healthy' : 'Issues',
      subValue: `${dashboardData.platformStats.uptime} uptime`,
      icon: dashboardData.systemHealth === 'healthy' ? CheckCircleIcon : ExclamationTriangleIcon,
      color: dashboardData.systemHealth === 'healthy' ? 'text-green-600' : 'text-yellow-600',
      bgColor: dashboardData.systemHealth === 'healthy' ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900',
      href: '/superuser/settings'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with Global View Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Overview
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor and manage the entire LMS platform
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <GlobeAltIcon className="h-4 w-4 mr-1" />
            <span>Global View - All Organizations</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/superuser/organizations">
            <Button variant="outline">
              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
              Manage Organizations
            </Button>
          </Link>
          <Link to="/superuser/reports">
            <Button>
              <ChartBarIcon className="h-4 w-4 mr-2" />
              System Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* System Alerts */}
      {dashboardData.systemAlerts.length > 0 && (
        <div className="space-y-3">
          {dashboardData.systemAlerts.map((alert, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              alert.type === 'warning' 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-center">
                <ExclamationTriangleIcon className={`h-5 w-5 mr-3 ${
                  alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    alert.type === 'warning' 
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {alert.message}
                  </p>
                  <p className={`text-xs mt-1 ${
                    alert.type === 'warning'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} to={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.subValue}
                    </p>
                    <p className="text-xs font-medium text-gray-900 dark:text-white mt-1">
                      {stat.name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Organizations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Organizations
            </h2>
            <Link to="/superuser/organizations" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData.recentOrganizations.map((org) => (
              <div 
                key={org.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {org.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {org.users} users
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    org.status === 'active' 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {org.status}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Created {org.createdAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Platform Statistics
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.platformStats.uptime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Uptime
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.platformStats.responseTime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Response Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.platformStats.activeUsers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.platformStats.storageUsed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Storage Used
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Platform Management
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/superuser/organizations">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <BuildingOfficeIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">Manage Organizations</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Create and configure organizations
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/superuser/reports">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <ChartBarIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">System Reports</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    View platform-wide analytics
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/superuser/settings">
              <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <div className="text-center">
                  <GlobeAltIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <h3 className="font-medium text-gray-900 dark:text-white">System Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Configure global platform settings
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