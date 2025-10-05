import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ChartBarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BookOpenIcon,
  ArrowDownTrayIcon,
  GlobeAltIcon,
  ServerIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export  function SystemReports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState({
    platformOverview: {
      totalOrganizations: 24,
      totalUsers: 5847,
      totalCourses: 342,
      totalEnrollments: 12456,
      certificatesIssued: 2134,
      storageUsed: '2.4TB',
      bandwidthUsed: '1.2TB',
      uptime: '99.9%'
    },
    organizationComparison: [
      { name: 'TechEd Academy', users: 1247, courses: 45, completions: 892, growth: '+12%' },
      { name: 'Business Skills Institute', users: 892, courses: 32, completions: 634, growth: '+8%' },
      { name: 'Creative Learning Hub', users: 634, courses: 28, completions: 445, growth: '+15%' },
      { name: 'Healthcare Training', users: 445, courses: 22, completions: 312, growth: '+5%' }
    ],
    systemMetrics: {
      avgResponseTime: '120ms',
      errorRate: '0.02%',
      activeConnections: 3421,
      peakConcurrentUsers: 1892,
      databaseSize: '45GB',
      backupStatus: 'Healthy'
    },
    usagePatterns: {
      peakHours: '2-4 PM',
      mostActiveDay: 'Wednesday',
      avgSessionDuration: '24 minutes',
      mobileUsage: '42%'
    }
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      // Mock data loading - replace with real API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Data is already set in state initialization
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    // TODO: Implement system report export
    console.log(`Exporting system report as ${format}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const platformStats = [
    {
      name: 'Organizations',
      value: reportData.platformOverview.totalOrganizations.toString(),
      icon: BuildingOfficeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      name: 'Total Users',
      value: reportData.platformOverview.totalUsers.toLocaleString(),
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: 'Total Courses',
      value: reportData.platformOverview.totalCourses.toString(),
      icon: BookOpenIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      name: 'Certificates',
      value: reportData.platformOverview.certificatesIssued.toLocaleString(),
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Reports
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive analytics across the entire platform
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {platformStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="flex items-center p-6">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            System Health & Performance
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <ServerIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600 mb-1">
                {reportData.platformOverview.uptime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                System Uptime
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ClockIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {reportData.systemMetrics.avgResponseTime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Response Time
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <UserGroupIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {reportData.systemMetrics.activeConnections.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Connections
              </div>
            </div>

            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <GlobeAltIcon className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {reportData.systemMetrics.errorRate}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Error Rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Comparison */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Organization Performance Comparison
          </h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Completions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Growth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.organizationComparison.map((org, index) => {
                  const completionRate = ((org.completions / org.users) * 100).toFixed(1);
                  return (
                    <tr key={org.name} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {org.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {org.users.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {org.courses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {org.completions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">
                          {org.growth}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {completionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resource Usage */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Resource Usage
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Storage Used</span>
                  <span>{reportData.platformOverview.storageUsed} / 5TB</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '48%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Bandwidth Used</span>
                  <span>{reportData.platformOverview.bandwidthUsed} / 2TB</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Database Size</span>
                  <span>{reportData.systemMetrics.databaseSize} / 100GB</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Backup Status
                  </span>
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                    {reportData.systemMetrics.backupStatus}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Patterns */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Usage Patterns
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Peak Hours
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {reportData.usagePatterns.peakHours}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Most Active Day
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {reportData.usagePatterns.mostActiveDay}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Session Duration
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {reportData.usagePatterns.avgSessionDuration}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ServerIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Mobile Usage
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {reportData.usagePatterns.mobileUsage}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Peak Concurrent Users
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {reportData.systemMetrics.peakConcurrentUsers.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Analytics Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Platform Growth Analytics
          </h2>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                System-wide growth analytics placeholder
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Connect analytics service for comprehensive platform insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}