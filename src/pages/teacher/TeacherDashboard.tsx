import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RichTextDisplay } from '../../components/ui/RichTextEditor';
import { mockApi } from '../../services/mockApi';
import { Course, Organization } from '../../types';
import { organizationService } from '../../services/organizationService';
import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { DetailedAnalytics } from '../../components/teacher/DetailedAnalytics';

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        const [coursesData, programsData] = await Promise.all([
          mockApi.getCourses({ teacherId: user.id }),
          mockApi.getPrograms()
        ]);
        
        setCourses(coursesData);
        // programsData is not used, so we don't need to store it
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    loadOrganization();
  }, [user]);

  const loadOrganization = async () => {
    if (!user?.organizationDetails?.id) return;
    
    try {
      const orgData = await organizationService.getOrganizationById(user?.organizationDetails?.id.toString());
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const liveCourses = courses.filter(course => course.status === 'live');
  const totalStudents = 156; // Mock data
  const avgCompletion = 78; // Mock data

  const stats = [
    {
      name: 'Total Courses',
      value: courses.length.toString(),
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      name: 'Live Courses',
      value: liveCourses.length.toString(),
      icon: EyeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: 'Total Students',
      value: totalStudents.toString(),
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    },
    {
      name: 'Avg Completion',
      value: `${avgCompletion}%`,
      icon: ChartBarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    }
  ];

  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Header with Organization Context */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage your courses and track student progress
            </p>
            {organization ? (
              <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                <span>Teaching at {organization.name}</span>
              </div>
            ) : (
              <div className="mt-2 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                <span>No organization assigned - contact your admin</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/teacher/courses/new">
              <Button disabled={!organization}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Detailed Analytics
            </button>
          </nav>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quick Actions
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/teacher/courses/new">
                    <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                      <div className="text-center">
                        <PlusIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <h3 className="font-medium text-gray-900 dark:text-white">Create New Course</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Start building your next course
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/teacher/programs/new">
                    <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                      <div className="text-center">
                        <AcademicCapIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <h3 className="font-medium text-gray-900 dark:text-white">Create Program</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Group courses into a program
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link to="/teacher/courses">
                    <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                      <div className="text-center">
                        <BookOpenIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <h3 className="font-medium text-gray-900 dark:text-white">Manage Courses</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Edit or publish your courses
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Courses */}
            {courses.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Courses
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.slice(0, 3).map((course) => (
                      <div 
                        key={course.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className="aspect-w-16 aspect-h-9">
                          <img
                            src={course.coverImage || 'https://picsum.photos/400/225'}
                            alt={course.title}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                            {course.title}
                          </h3>
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            <RichTextDisplay content={course.description} />
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              course.status === 'live' 
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            }`}>
                              {course.status}
                            </span>
                            <div className="flex space-x-2">
                              <Link to={`/student/course/${course.id}`}>
                                <Button variant="outline" size="sm">
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/teacher/courses/${course.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <DetailedAnalytics />
        )}
      </div>
    </div>
  );
}
