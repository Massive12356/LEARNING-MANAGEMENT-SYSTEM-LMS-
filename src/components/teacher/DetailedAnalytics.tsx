import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/mockApi';
import { 
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  avgTimeSpent: number;
  certificatesIssued: number;
  studentEngagement: number;
  weeklyActivity: Array<{
    week: string;
    enrollments: number;
    completions: number;
    activeUsers: number;
  }>;
  popularCourses: Array<{
    courseId: string;
    title: string;
    enrollments: number;
    completionRate: number;
  }>;
}

export const DetailedAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data - in a real app, this would come from an API
      const mockData: AnalyticsData = {
        totalStudents: 156,
        activeStudents: 89,
        completionRate: 78.5,
        avgTimeSpent: 142,
        certificatesIssued: 122,
        studentEngagement: 85,
        weeklyActivity: [
          { week: 'Week 1', enrollments: 12, completions: 3, activeUsers: 45 },
          { week: 'Week 2', enrollments: 8, completions: 5, activeUsers: 52 },
          { week: 'Week 3', enrollments: 15, completions: 7, activeUsers: 61 },
          { week: 'Week 4', enrollments: 10, completions: 9, activeUsers: 58 },
        ],
        popularCourses: [
          { courseId: 'course-1', title: 'Complete React Development', enrollments: 67, completionRate: 82.1 },
          { courseId: 'course-2', title: 'Advanced TypeScript', enrollments: 45, completionRate: 71.3 },
          { courseId: 'course-3', title: 'JavaScript Fundamentals', enrollments: 89, completionRate: 92.7 },
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <ChartBarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          No analytics data available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Students
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
              <BookOpenIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analyticsData.completionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
              <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Time Spent (hrs)
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(analyticsData.avgTimeSpent / 60)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Weekly Activity
        </h3>
        <div className="space-y-4">
          {analyticsData.weeklyActivity.map((week, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-900 dark:text-white">{week.week}</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {week.activeUsers} active, {week.enrollments} new, {week.completions} completed
                </span>
              </div>
              <div className="flex h-8 space-x-1">
                <div 
                  className="bg-blue-500 rounded-l flex items-center justify-center text-xs text-white"
                  style={{ width: `${(week.activeUsers / 100) * 100}%` }}
                >
                  {week.activeUsers > 10 && week.activeUsers}
                </div>
                <div 
                  className="bg-green-500 flex items-center justify-center text-xs text-white"
                  style={{ width: `${(week.enrollments / 20) * 100}%` }}
                >
                  {week.enrollments > 5 && week.enrollments}
                </div>
                <div 
                  className="bg-purple-500 rounded-r flex items-center justify-center text-xs text-white"
                  style={{ width: `${(week.completions / 15) * 100}%` }}
                >
                  {week.completions > 3 && week.completions}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center mt-4 space-x-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
            <span>Active Users</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
            <span>New Enrollments</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
            <span>Completions</span>
          </div>
        </div>
      </div>

      {/* Popular Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Popular Courses
        </h3>
        <div className="space-y-4">
          {analyticsData.popularCourses.map((course, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{course.title}</h4>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <span>{course.enrollments} enrolled</span>
                  <span>•</span>
                  <span>{course.completionRate.toFixed(1)}% completion</span>
                </div>
              </div>
              <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${course.completionRate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};