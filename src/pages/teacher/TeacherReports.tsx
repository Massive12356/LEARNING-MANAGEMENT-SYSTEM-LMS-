import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { courseService } from '../../services/courseService';
import toast from 'react-hot-toast';

export const TeacherReports: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await courseService.loadTeacherAnalytics();
        setAnalyticsData(data);
      } catch (error: any) {
        console.error('Failed to load analytics:', error);
        toast.error(error?.message ?? 'Failed to load teacher analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const stats = [
    {
      name: 'Total Revenue',
      value: `$${analyticsData?.totalRevenue || 0}`,
      change: '+12.5%',
      changeType: 'increase',
      icon: ChartBarIcon,
      className: 'bg-gradient-to-br from-blue-600 to-indigo-700'
    },
    {
      name: 'Active Enrollments',
      value: analyticsData?.activeEnrollments || 0,
      change: '+8.2%',
      changeType: 'increase',
      icon: UserGroupIcon,
      className: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      name: 'Course Completion',
      value: `${analyticsData?.courseCompletionRate || 0}%`,
      change: '+4.1%',
      changeType: 'increase',
      icon: AcademicCapIcon,
      className: 'bg-gradient-to-br from-violet-600 to-purple-700'
    },
    {
      name: 'Student Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      changeType: 'increase',
      icon: CalendarIcon,
      className: 'bg-gradient-to-br from-amber-500 to-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      {/* Header - Taller & Bolder */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-200 text-sm font-medium">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                <span>Advanced Analytics</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Reports & Performance
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Track your course performance, student engagement, and revenue growth in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="h-14 px-8 text-lg bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md rounded-2xl">
                <ArrowDownTrayIcon className="h-6 w-6 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Full Gradient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`relative overflow-hidden rounded-3xl p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${stat.className}`}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>

            <div className="relative flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                  <p className={`text-xs font-bold mt-1 ${stat.changeType === 'increase' ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {stat.change}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-white/80 text-sm font-medium">{stat.name}</p>
                <p className="text-white/60 text-xs mt-1">v.s previous period</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Monthly earnings and growth trends</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-gray-900 border-0 rounded-xl text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                <div className="text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Interactive Chart Integration Coming Soon</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Connecting to D3.js real-time analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h3>
              <Button variant="outline" size="sm" className="rounded-xl">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {analyticsData?.recentActivities?.map((activity: any, index: number) => (
                  <div key={index} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center border border-blue-100 dark:border-blue-800/30">
                        <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          <Card className="rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-0">
            <CardContent className="p-8">
              <SparklesIcon className="h-10 w-10 text-yellow-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Teaching Insight</h3>
              <p className="text-indigo-100 leading-relaxed text-sm">
                Your course "Advanced Web Development" has seen a 24% spike in engagement this week. Releasing a supplemental module could further increase retention.
              </p>
              <Button className="w-full mt-8 bg-white text-indigo-900 hover:bg-indigo-50 border-0 rounded-2xl font-bold">
                View Recommendations
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <CardHeader className="p-8 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Performing Courses</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {analyticsData?.topCourses?.map((course: any, index: number) => (
                  <div key={index} className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate pr-4">{course.title}</p>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{course.enrolled} Enrolled</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${(course.enrolled / (analyticsData?.activeEnrollments || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper component for the insight icon
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z"
    />
  </svg>
);
