import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { exportToCSV } from '../../utils/csvParser';
import {
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  TrophyIcon,
  ArrowDownTrayIcon,
  ServerIcon,
  ClockIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { ActiveOrganizationStats, ActiveUserStats, PlatformStatsResponse } from '../../types';
import { adminService } from '../../services/adminService';
import { organizationService } from '../../services/organizationService';
import toast from 'react-hot-toast';

export function SystemReports() {
  const [totalOrgs, setTotalOrgs] = useState<ActiveOrganizationStats | null>(null);
  const [totalUsers, setTotalUsers] = useState<ActiveUserStats | null>(null);
  const [orgLoading, setOrgLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [systemLoading, setSystemLoading] = useState(false);
  const [platformHealth, setPlatformHealth] = useState<PlatformStatsResponse>({
    message: '',
    systemHealth: { percentage: 0, readableUptime: '' },
    responseTime: { value: 0, unit: 'ms' },
    userStatistics: {
      activeUsers: 0,
      totalUsers: 0,
    },
    storage: {
      nodeProcessMemory: { totalHeap: '', usedHeap: '' },
      systemMemory: { freeSystemMemory: '', totalSystemMemory: '' },
    },
  });
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState({
    platformOverview: {
      totalOrganizations: 0,
      totalUsers: 0,
      totalCourses: 0,
      certificatesIssued: 0,
      uptime: '',
      responseTime: '',
      storageUsed: '',
      bandwidthUsed: '',
    },
    systemMetrics: {
      avgResponseTime: '',
      activeConnections: 0,
      errorRate: '',
      peakConcurrentUsers: 0,
      databaseSize: '',
      backupStatus: '',
    },
    organizationPerformance: [] as any[],
    usagePatterns: {
      peakHours: '',
      mostActiveDay: '',
      avgSessionDuration: '',
      mobileUsage: '',
    },
  });
  const loadReportData = async () => {
    try {
      // Mock data loading - replace with real API calls
      const mockData = {
        platformOverview: {
          totalOrganizations: 24,
          totalUsers: 5847,
          totalCourses: 342,
          certificatesIssued: 1247,
          uptime: '99.9%',
          responseTime: '120ms',
          storageUsed: '2.4TB',
          bandwidthUsed: '1.2TB',
        },
        systemMetrics: {
          avgResponseTime: '120ms',
          activeConnections: 342,
          errorRate: '0.02%',
          peakConcurrentUsers: 1247,
          databaseSize: '45GB',
          backupStatus: 'Up to date',
        },
        organizationPerformance: [
          {
            name: 'Tech Academy',
            users: 1247,
            courses: 42,
            completions: 312,
            growth: '+12%',
            completionRate: '78%',
          },
          {
            name: 'Business Skills Institute',
            users: 892,
            courses: 38,
            completions: 268,
            growth: '+8%',
            completionRate: '74%',
          },
          {
            name: 'Creative Learning Hub',
            users: 634,
            courses: 31,
            completions: 197,
            growth: '+15%',
            completionRate: '82%',
          },
          {
            name: 'Healthcare Training Center',
            users: 445,
            courses: 27,
            completions: 156,
            growth: '+5%',
            completionRate: '71%',
          },
          {
            name: 'Engineering Excellence',
            users: 389,
            courses: 24,
            completions: 134,
            growth: '+22%',
            completionRate: '85%',
          },
        ],
        usagePatterns: {
          peakHours: '9AM-11AM, 2PM-4PM',
          mostActiveDay: 'Tuesday',
          avgSessionDuration: '24 minutes',
          mobileUsage: '34%',
        },
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } 
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      // Export as CSV
      const csvData = [
        // Platform overview
        { Metric: 'Total Organizations', Value: reportData.platformOverview.totalOrganizations },
        { Metric: 'Total Users', Value: reportData.platformOverview.totalUsers },
        { Metric: 'Total Courses', Value: reportData.platformOverview.totalCourses },
        { Metric: 'Certificates Issued', Value: reportData.platformOverview.certificatesIssued },
        { Metric: 'System Uptime', Value: reportData.platformOverview.uptime },
        { Metric: 'Avg Response Time', Value: reportData.platformOverview.responseTime },
        // System metrics
        { Metric: 'Active Connections', Value: reportData.systemMetrics.activeConnections },
        { Metric: 'Error Rate', Value: reportData.systemMetrics.errorRate },
        { Metric: 'Peak Concurrent Users', Value: reportData.systemMetrics.peakConcurrentUsers },
      ];

      exportToCSV(csvData, `system-report-${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      // Export as PDF (HTML for now, as per project requirements)
      const reportContent = generateReportHTML();
      const blob = new Blob([reportContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-report-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const generateReportHTML = (): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>System Reports</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2563eb; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f9fafb; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #1f2937; }
        .stat-label { font-size: 14px; color: #6b7280; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background: #f9fafb; font-weight: 600; }
        .generated-date { text-align: center; color: #6b7280; margin-top: 40px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>System Reports</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>Platform Overview</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${reportData.platformOverview.totalOrganizations}</div>
                <div class="stat-label">Organizations</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData.platformOverview.totalUsers.toLocaleString()}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData.platformOverview.totalCourses}</div>
                <div class="stat-label">Total Courses</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData.platformOverview.certificatesIssued.toLocaleString()}</div>
                <div class="stat-label">Certificates</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Organization Performance</h2>
        <table>
            <thead>
                <tr>
                    <th>Organization</th>
                    <th>Users</th>
                    <th>Courses</th>
                    <th>Completions</th>
                    <th>Growth</th>
                    <th>Completion Rate</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.organizationPerformance
                  .map(
                    org => `
                <tr>
                    <td>${org.name}</td>
                    <td>${org.users}</td>
                    <td>${org.courses}</td>
                    <td>${org.completions}</td>
                    <td>${org.growth}</td>
                    <td>${org.completionRate}</td>
                </tr>
                `
                  )
                  .join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>System Metrics</h2>
        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Average Response Time</td>
                    <td>${reportData.systemMetrics.avgResponseTime}</td>
                </tr>
                <tr>
                    <td>Active Connections</td>
                    <td>${reportData.systemMetrics.activeConnections}</td>
                </tr>
                <tr>
                    <td>Error Rate</td>
                    <td>${reportData.systemMetrics.errorRate}</td>
                </tr>
                <tr>
                    <td>Peak Concurrent Users</td>
                    <td>${reportData.systemMetrics.peakConcurrentUsers.toLocaleString()}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="generated-date">
        Report generated on ${new Date().toLocaleString()}
    </div>
</body>
</html>
    `;
  };

  const loadOrganization = async () => {
    try {
      setOrgLoading(true);
      const response = await organizationService.getTotalOrganizationActiveOnes();
      setTotalOrgs(response);
    } catch (error) {
      toast.error('failed to load total organization');
    } finally {
      setOrgLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUserLoading(true);
      const response = await adminService.getTotalUsers();
      setTotalUsers(response);
    } catch (error) {
      toast.error('failed to load Total Users');
    } finally {
      setUserLoading(false);
    }
  };

  const systemCheck = async () => {
    try {
      setSystemLoading(true);
      const response = await adminService.platformStats();
      setPlatformHealth(response);
    } catch (error) {
      toast.error('failed to load System Data');
    } finally {
      setSystemLoading(false);
    }
  };

  // useEffects
  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  useEffect(() => {
    loadOrganization();
    loadUsers();
    systemCheck();
  }, []);

  // System statistics Grid
  const platformStats = [
    {
      name: 'Organizations',
      value: orgLoading ? (
        <p className="text-sm text-gray-400"> Loading ...</p>
      ) : (
        totalOrgs?.totalOrganizations
      ),
      icon: BuildingOfficeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      name: 'Total Users',
      value: userLoading ? (
        <p className="text-sm text-gray-400"> Loading ...</p>
      ) : (
        totalUsers?.totalUsers
      ),
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      name: 'Total Courses',
      value: reportData.platformOverview.totalCourses.toString(),
      icon: BookOpenIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      name: 'Certificates',
      value: reportData.platformOverview.certificatesIssued.toLocaleString(),
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Reports</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive analytics across the entire platform
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
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
        {platformStats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <ServerIcon className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600 mb-1">
                {systemLoading ? (
                  <p className="text-sm text-green-600"> Loading ....</p>
                ) : (
                  <div className="text-2xl text-green-600">
                    {platformHealth.systemHealth?.percentage != null
                      ? `${platformHealth.systemHealth.percentage}%`
                      : 'N/A'}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
            </div>

            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ClockIcon className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {systemLoading ? (
                  <p className="text-sm text-blue-600"> Loading ....</p>
                ) : (
                  <p>{platformHealth.responseTime?.value ?? 0}{" "} {platformHealth.responseTime?.unit ?? "N/A"} </p>
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <UserGroupIcon className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {systemLoading ? (
                  <p className="text-sm text-purple-600"> Loading ....</p>
                ) : (
                  platformHealth.userStatistics?.activeUsers ?? 0
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Connections</div>
            </div>
                 
                 {/* Todo  system error section */}
            {/* <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <GlobeAltIcon className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {reportData.systemMetrics.errorRate}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Error Rate</div>
            </div> */}
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
                {reportData.organizationPerformance.map((org, index) => {
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
                        <span className="text-sm font-medium text-green-600">{org.growth}</span>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Resource Usage</h2>
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
                  <span className="text-sm text-gray-600 dark:text-gray-400">Backup Status</span>
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Usage Patterns</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Peak Hours</span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {reportData.usagePatterns.peakHours}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Most Active Day</span>
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
                  <span className="text-sm text-gray-600 dark:text-gray-400">Mobile Usage</span>
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
    </div>
  );
}
