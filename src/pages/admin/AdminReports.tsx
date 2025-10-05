import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  TrophyIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

export function AdminReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    completedCourses: 0,
    totalEnrollments: 0,
    certificatesIssued: 0,
    averageCompletionRate: 0,
    averageTimeSpent: 0,
    userGrowth: [] as any[],
    coursePopularity: [] as any[],
    completionTrends: [] as any[]
  });

  useEffect(() => {
    loadReportData();
  }, [user, dateRange]);

  const loadReportData = async () => {
    try {
      // Mock data - replace with real API calls
      const mockData = {
        totalUsers: 1247,
        activeUsers: 892,
        totalCourses: 45,
        completedCourses: 1834,
        totalEnrollments: 3421,
        certificatesIssued: 567,
        averageCompletionRate: 73.5,
        averageTimeSpent: 2.4, // hours
        userGrowth: [
          { date: '2024-01-01', users: 1000 },
          { date: '2024-01-15', users: 1150 },
          { date: '2024-01-30', users: 1247 }
        ],
        coursePopularity: [
          { course: 'React Development', enrollments: 234 },
          { course: 'TypeScript Advanced', enrollments: 189 },
          { course: 'JavaScript Fundamentals', enrollments: 156 }
        ],
        completionTrends: [
          { week: 'Week 1', completions: 45 },
          { week: 'Week 2', completions: 52 },
          { week: 'Week 3', completions: 38 },
          { week: 'Week 4', completions: 61 }
        ]
      };

      setReportData(mockData);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'csv' | 'pdf') => {
    // TODO: Implement report export
    console.log(`Exporting report as ${format}`);
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
      name: 'Total Users',
      value: reportData.totalUsers.toLocaleString(),
      change: '+12%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      name: 'Active Users',
      value: reportData.activeUsers.toLocaleString(),
      change: '+8%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: 'Course Completions',
      value: reportData.completedCourses.toLocaleString(),
      change: '+15%',
      changeType: 'positive',
      icon: BookOpenIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      name: 'Certificates Issued',
      value: reportData.certificatesIssued.toLocaleString(),
      change: '+23%',
      changeType: 'positive',
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
            Analytics & Reports
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive insights into your organization's learning activities
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.name}
                      </p>
                      <span className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              User Growth Trend
            </h2>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  User growth chart placeholder
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Connect chart library for interactive visualization
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Completion Rate */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Course Completion Rate
            </h2>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {reportData.averageCompletionRate}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Average completion rate
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Across all courses in the last {dateRange} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular Courses */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Most Popular Courses
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.coursePopularity.map((course, index) => (
                <div key={course.course} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {course.course}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {course.enrollments} enrollments
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Learning Activity
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {reportData.averageTimeSpent}h
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average time spent per user
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Peak learning hours
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    2-4 PM
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Most active day
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Wednesday
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Avg. courses per user
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    2.7
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'completion', user: 'John Doe', course: 'React Basics', time: '2 hours ago' },
                { type: 'enrollment', user: 'Jane Smith', course: 'TypeScript Advanced', time: '4 hours ago' },
                { type: 'certificate', user: 'Mike Johnson', course: 'JavaScript Fundamentals', time: '6 hours ago' },
                { type: 'completion', user: 'Sarah Wilson', course: 'React Advanced', time: '8 hours ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'completion' ? 'bg-green-100 dark:bg-green-900' :
                    activity.type === 'enrollment' ? 'bg-blue-100 dark:bg-blue-900' :
                    'bg-yellow-100 dark:bg-yellow-900'
                  }`}>
                    {activity.type === 'completion' && <BookOpenIcon className="h-4 w-4 text-green-600" />}
                    {activity.type === 'enrollment' && <UserGroupIcon className="h-4 w-4 text-blue-600" />}
                    {activity.type === 'certificate' && <TrophyIcon className="h-4 w-4 text-yellow-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span>
                      {activity.type === 'completion' && ' completed '}
                      {activity.type === 'enrollment' && ' enrolled in '}
                      {activity.type === 'certificate' && ' earned certificate for '}
                      <span className="font-medium">{activity.course}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Engagement Metrics
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {((reportData.activeUsers / reportData.totalUsers) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                User Engagement Rate
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {(reportData.completedCourses / reportData.totalEnrollments * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Course Completion Rate
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {(reportData.totalEnrollments / reportData.totalUsers).toFixed(1)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg. Enrollments per User
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {(reportData.certificatesIssued / reportData.completedCourses * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Certificate Completion Rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}