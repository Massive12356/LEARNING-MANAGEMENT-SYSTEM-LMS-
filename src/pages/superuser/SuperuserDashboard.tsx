import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
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
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { organizationService } from '../../services/organizationService';
import toast from 'react-hot-toast';
import {
  ActiveOrganizationStats,
  ActiveUserStats,
  SystemHealthStats,
  RecentOrganizationStats,
  PlatformStatsResponse,
} from '../../types';

export function SuperuserDashboard() {
  const { user } = useAuthStore();

  // Independent loading states
  const [userLoading, setUserLoading] = useState(true);
  const [systemHealthLoading, setSystemHealthLoading] = useState(true);
  const [platformLoading, setPlatformLoading] = useState(true);
  const [orgLoading, setOrgLoading] = useState(true);
  const [recentOrgLoading, setRecentOrgLoading] = useState(true);

  // Dashboard data states
  const [userStats, setUsersStats] = useState<ActiveUserStats>({
    activeUsers: 0,
    totalUsers: 0,
    message: '',
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealthStats>({
    message: '',
    readableUptime: '',
    systemHealthPercentage: 0,
    totalUptimeSeconds: 0,
  });
  const [platformHealth, setPlatformHealth] = useState<PlatformStatsResponse>({
    message: '',
    systemHealth: { percentage: 0, readableUptime: '' },
    responseTime: { value: 0, unit: 'ms' },
    userStatistics: {
      activeUsers: 0,
      totalUsers:0,
    },
    storage: {
      nodeProcessMemory: { totalHeap: '', usedHeap: '' },
      systemMemory: { freeSystemMemory: '', totalSystemMemory: '' },
    },
  });
  const [activeOrganization, setActiveOrganization] = useState<ActiveOrganizationStats>({
    totalOrganizations: 0,
    activeOrganizations: 0,
    message: '',
  });
  const [recentOrganizations, setRecentOrganization] = useState<RecentOrganizationStats>({
    count: 0,
    message: '',
    recentOrganizations: [],
  });

  // ---- Fetch Functions ----
   const loadTotalActiveUsers = async () => {
     setUserLoading(true);
     try {
       const response: ActiveUserStats = await adminService.getTotalUsers();
       setUsersStats(response);
     } catch (error) {
       console.log(error);
       toast.error('Failed to load user data');
     } finally {
       setUserLoading(false);
     }
   };

const loadSystemHealth = async () => {
  setSystemHealthLoading(true);
  try {
    const response: SystemHealthStats = await adminService.systemHealthCheck();
    setSystemHealth(response);
  } catch (error) {
    console.log(error);
    toast.error('Failed to load system health data');
  } finally {
    setSystemHealthLoading(false);
  }
};

const loadPlatformHealth = async () => {
  setPlatformLoading(true);
  try {
    const response: PlatformStatsResponse = await adminService.platformStats();
    setPlatformHealth(response);
  } catch (error) {
    console.log(error);
    toast.error('Failed to load platform data');
  } finally {
    setPlatformLoading(false);
  }
};

const loadActiveOrganizations = async () => {
  setOrgLoading(true);
  try {
    const response: ActiveOrganizationStats =
      await organizationService.getTotalOrganizationActiveOnes();
    setActiveOrganization(response);
  } catch (error) {
    console.log(error);
    toast.error('Failed to load organization data');
  } finally {
    setOrgLoading(false);
  }
};

const loadRecentOrganizations = async () => {
  setRecentOrgLoading(true);
  try {
    const response: RecentOrganizationStats = await organizationService.getRecentOrganization();
    setRecentOrganization(response);
  } catch (error) {
    console.log(error);
    toast.error('Failed to load recent organizations');
  } finally {
    setRecentOrgLoading(false);
  }
};


  useEffect(() => {
    loadTotalActiveUsers();
    loadSystemHealth();
    loadPlatformHealth();
    loadActiveOrganizations();
    loadRecentOrganizations();
  }, [user]);

  

  const systemAlerts = [];

  if (systemHealth.systemHealthPercentage < 50) {
    systemAlerts.push({
      type: 'warning',
      message: '⚠️ Critical: System health below 50%. Immediate attention required!',
      time: new Date().toLocaleString(),
    });
  } else if (systemHealth.systemHealthPercentage < 90) {
    systemAlerts.push({
      type: 'warning',
      message: '⚠️ System experiencing moderate instability.',
      time: new Date().toLocaleString(),
    });
  } else if (systemHealth.systemHealthPercentage < 100) {
    systemAlerts.push({
      type: 'info',
      message: '🟡 Minor issues detected. Monitoring performance.',
      time: new Date().toLocaleString(),
    });
  } else {
    systemAlerts.push({
      type: 'info',
      message: '✅ System operating at full health.',
      time: new Date().toLocaleString(),
    });
  }

  const stats = [
    {
      name: 'Organizations',
      value: orgLoading ? '...' : activeOrganization.totalOrganizations.toString(),
      subValue: orgLoading ? 'Loading...' : `${activeOrganization.activeOrganizations} active`,
      icon: BuildingOfficeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
      href: '/superuser/organizations',
    },
    {
      name: 'Total Users',
      value: userLoading ? '...' : userStats.totalUsers.toLocaleString(),
      subValue: userLoading ? 'Loading...' : `${userStats.activeUsers} active`,
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
      href: '/superuser/reports',
    },
    {
      name: 'System Health',
      value: systemHealthLoading
        ? 'Loading...'
        : systemHealth.systemHealthPercentage === 100
        ? 'Healthy'
        : systemHealth.systemHealthPercentage >= 90
        ? 'Minor Issues'
        : 'Critical Issues',
      subValue: systemHealthLoading ? '...' : `${systemHealth.systemHealthPercentage}% uptime`,
      icon: systemHealth.systemHealthPercentage === 100 ? CheckCircleIcon : ExclamationTriangleIcon,
      color:
        systemHealth.systemHealthPercentage === 100
          ? 'text-green-600'
          : systemHealth.systemHealthPercentage >= 90
          ? 'text-yellow-600'
          : 'text-red-600',
      bgColor:
        systemHealth.systemHealthPercentage === 100
          ? 'bg-green-100 dark:bg-green-900'
          : systemHealth.systemHealthPercentage >= 90
          ? 'bg-yellow-100 dark:bg-yellow-900'
          : 'bg-red-100 dark:bg-red-900',
      href: '/superuser/settings',
    },
    // {
    //   name: 'Total Courses',
    //   value: dashboardData.totalCourses.toString(),
    //   subValue: 'Across all orgs',
    //   icon: BookOpenIcon,
    //   color: 'text-purple-600',
    //   bgColor: 'bg-purple-100 dark:bg-purple-900',
    //   href: '/superuser/reports',
    // },

  ];


  return (
    <div className="space-y-8">
      {/* Header with Global View Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Overview</h1>
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
      {systemAlerts.length > 0 && (
        <div className="space-y-3">
          {systemAlerts.map((alert, index) => (
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.subValue}</p>
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
            <Link
              to="/superuser/organizations"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrgLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentOrganizations.recentOrganizations?.map(org => (
                <div
                  key={org.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {org?.name ?? 'N/A'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {org?.registeredUsers ?? 0} users
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Active
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(org?.createdAt ?? 'N/A').toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
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
          {platformLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformHealth.systemHealth?.percentage ?? 'N/A'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformHealth.responseTime?.value ?? 'N/A'}{' '}
                  {platformHealth.responseTime?.unit ?? 'N/A'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformHealth.userStatistics?.activeUsers?.toLocaleString() ?? 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformHealth.storage?.nodeProcessMemory?.usedHeap ?? 'N/A'} /{' '}
                  {platformHealth.storage?.nodeProcessMemory?.totalHeap ?? 'N/A'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Node Memory Usage</div>
              </div>
            </div>
          )}
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
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Manage Organizations
                  </h3>
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
