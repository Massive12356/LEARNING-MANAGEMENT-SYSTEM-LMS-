import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../services/analyticsService';
import { mockApi } from '../../services/mockApi';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { organizationService } from '../../services/organizationService';

interface OrganizationStats {
  users: number;
  teachers: number;
  students: number;
  courses: number;
  programs: number;
}

export function OrganizationAnalytics() {
  const { user } = useAuth();
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrganizationStats>({
    users: 0,
    teachers: 0,
    students: 0,
    courses: 0,
    programs: 0
  });
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [orgId]);

  const loadAnalyticsData = async () => {
    if (!orgId && !user?.organizationId) {
      setLoading(false);
      return;
    }

    try {
      const organizationId = orgId || user?.organizationId;
      
      // Load organization data
      if (organizationId) {
        const orgData = await  organizationService.getOrganizationById(organizationId);
        setOrganization(orgData);
      }
      
      // Load stats
      const statsData = await analyticsService.getOrganizationStats(organizationId!);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.users, 
      icon: UserGroupIcon, 
      color: 'bg-blue-500',
      description: 'All users in organization'
    },
    { 
      title: 'Teachers', 
      value: stats.teachers, 
      icon: AcademicCapIcon, 
      color: 'bg-green-500',
      description: 'Instructor accounts'
    },
    { 
      title: 'Students', 
      value: stats.students, 
      icon: BookOpenIcon, 
      color: 'bg-purple-500',
      description: 'Learner accounts'
    },
    { 
      title: 'Courses', 
      value: stats.courses, 
      icon: BookOpenIcon, 
      color: 'bg-yellow-500',
      description: 'Active courses'
    },
    { 
      title: 'Programs', 
      value: stats.programs, 
      icon: ChartBarIcon, 
      color: 'bg-red-500',
      description: 'Learning programs'
    }
  ];

  const chartData = [
    { name: 'Teachers', count: stats.teachers },
    { name: 'Students', count: stats.students },
    { name: 'Courses', count: stats.courses },
    { name: 'Programs', count: stats.programs }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organization Analytics
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {organization ? organization.name : 'Organization'} overview and statistics
          </p>
        </div>
        <Button onClick={() => navigate('/admin/organization-settings')}>
          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Organization Overview
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Distribution of teachers, students, courses, and programs
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              User Distribution
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Teachers
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stats.teachers} ({stats.users > 0 ? Math.round((stats.teachers / stats.users) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${stats.users > 0 ? (stats.teachers / stats.users) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Students
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stats.students} ({stats.users > 0 ? Math.round((stats.students / stats.users) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${stats.users > 0 ? (stats.students / stats.users) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Content Overview
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <BookOpenIcon className="h-5 w-5 text-yellow-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Total Courses</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.courses}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">Total Programs</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stats.programs}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}