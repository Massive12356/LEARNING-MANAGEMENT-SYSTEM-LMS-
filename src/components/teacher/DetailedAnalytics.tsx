import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { mockApi } from '../../services/mockApi';
import {
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';
import {
  DashboardAnalyticsData,
  DashboardAnalyticsResponse,
  dashboardAnalyticsResponse,
  PopularCourse,
} from '../../types';
import { toast } from 'react-hot-toast';
import { courseService } from '../../services/courseService';
import { EmptyState } from '../ui';

export const DetailedAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [analyticsData, setAnalyticsData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<dashboardAnalyticsResponse | null>(null);
  const [popularCourses, setPopularCourses] = useState<PopularCourse[]>([]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await courseService.loadDashStat();
      setAnalyticsData(response);
      return response;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadDashStats = async () => {
    if (!user) {
      toast.error('Please login to continue');
    }

    try {
      const response = await courseService.loadDashboardAnalytics();
      setDashboardStats(response);
      return response;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const loadPopularCourses = async () => {
    try {
      const response = await courseService.PopularCourses();
      setPopularCourses(response);
      return response;
    } catch (error: any) {
      toast.error(error.message || 'Failed to load popular courses');
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadDashStats();
    loadPopularCourses();
  }, []);

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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>

              {loading ? (
                <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats?.totalStudents ?? 0}
                </p>
              )}
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

              {loading ? (
                <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardStats?.completionRate?.toFixed(1) ?? 0}%
                </p>
              )}
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
              {loading ? (
                <div className="h-4 w-24 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round((dashboardStats?.averageTimeSpentHours ?? 0) / 60)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Weekly Activity</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg
                className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          ) : analyticsData?.dailyBreakdown.length === 0 ? (
            <EmptyState
              title="No  Weekly Activity Yet"
              description="Student Weekly activities will appear here once learners start interacting with your courses."
            />
          ) : (
            analyticsData?.dailyBreakdown?.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-900 dark:text-white">{day?.date}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {day?.activeUsers} active, {day?.newEnrollments} new, {day?.completions}{' '}
                    completed
                  </span>
                </div>
                <div className="flex h-8 space-x-1">
                  <div
                    className="bg-blue-500 rounded-l flex items-center justify-center text-xs text-white"
                    style={{ width: `${(day?.activeUsers / 100) * 100}%` }}
                  >
                    {day?.activeUsers > 10 && day?.activeUsers}
                  </div>
                  <div
                    className="bg-green-500 flex items-center justify-center text-xs text-white"
                    style={{ width: `${(day?.newEnrollments / 20) * 100}%` }}
                  >
                    {day?.newEnrollments > 5 && day?.newEnrollments}
                  </div>
                  <div
                    className="bg-purple-500 rounded-r flex items-center justify-center text-xs text-white"
                    style={{ width: `${(day?.completions / 15) * 100}%` }}
                  >
                    {day?.completions > 3 && day?.completions}
                  </div>
                </div>
              </div>
            ))
          )}
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Popular Courses</h3>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg
                className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            </div>
          ) : popularCourses.length === 0 ? (
            <EmptyState title="No Popular Courses" description="No popular courses found." />
          ) : (
            popularCourses.map((course, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {course?.courseName ?? 'N/A'}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <span>{course?.enrolledStudents ?? 0} enrolled</span>
                    <span>•</span>
                    <span>{course?.completionRate.toFixed(1)}% completion</span>
                  </div>
                </div>
                <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${course?.completionRate ?? 0}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
