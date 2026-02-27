import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
  AcademicCapIcon,
  UsersIcon,
  ClockIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format } from 'date-fns';

// Mock data for charts
const performanceData = [
  { name: 'Week 1', completion: 65, engagement: 45 },
  { name: 'Week 2', completion: 72, engagement: 55 },
  { name: 'Week 3', completion: 68, engagement: 60 },
  { name: 'Week 4', completion: 85, engagement: 75 },
  { name: 'Week 5', completion: 82, engagement: 70 },
  { name: 'Week 6', completion: 90, engagement: 85 },
];

const courseDistributionData = [
  { name: 'Web Dev', students: 120 },
  { name: 'Data Science', students: 85 },
  { name: 'UI/UX', students: 65 },
  { name: 'Mobile Dev', students: 45 },
];

export const TeacherReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  const loadReportData = useCallback(async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const stats = [
    {
      name: 'Total Students',
      value: '315',
      change: '+12%',
      trend: 'up',
      icon: UsersIcon,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      name: 'Course Completion',
      value: '85%',
      change: '+5%',
      trend: 'up',
      icon: AcademicCapIcon,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      name: 'Avg. Engagement',
      value: '4.2h',
      change: '-2%',
      trend: 'down',
      icon: ClockIcon,
      color: 'from-purple-500 to-fuchsia-600'
    },
    {
      name: 'Certificates Issued',
      value: '124',
      change: '+18%',
      trend: 'up',
      icon: TrophyIcon,
      color: 'from-amber-500 to-orange-600'
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
    <div className="space-y-8 pb-10">
      {/* Header - Taller & Bolder */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-indigo-200 text-sm font-medium">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                <span>Analytics & Insights</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Reports
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                Track student progress, course engagement, and performance metrics.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="week" className="text-gray-900">Last Week</option>
                <option value="month" className="text-gray-900">Last Month</option>
                <option value="quarter" className="text-gray-900">Last Quarter</option>
                <option value="year" className="text-gray-900">Last Year</option>
              </select>
              <Button
                variant="primary"
                className="bg-white text-slate-900 hover:bg-gray-100 border-none shadow-lg shadow-white/10"
              >
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Export Report
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
            className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${stat.color} shadow-lg transform hover:scale-[1.02] transition-all duration-300`}
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-white/20 backdrop-blur-sm text-white`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-sm font-medium text-white/80">{stat.name}</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Engagement Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Student Engagement
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Weekly completion and engagement rates
              </p>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completion"
                  name="Completion Rate"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  name="Engagement Score"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Course Enrollment
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Student distribution across top courses
              </p>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <UsersIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#4B5563"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar
                  dataKey="students"
                  name="Students"
                  fill="#8B5CF6"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Student Activity
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Latest actions and progress updates from your students
            </p>
          </div>
          <Button variant="outline" className="rounded-xl">
            View All Activity
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Course
                </th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-8 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        S{item}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">Student {item}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">student{item}@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">Advanced Web Development</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Module {item}</div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Completed Quiz {item}</span>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};