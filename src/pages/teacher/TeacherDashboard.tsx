import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { RichTextDisplay } from '../../components/ui/RichTextEditor';
import { mockApi } from '../../services/mockApi';
import { teacherDashboardData, Organization } from '../../types';
import { organizationService } from '../../services/organizationService';
import {
  BookOpenIcon,
  AcademicCapIcon,
  UserGroupIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { DetailedAnalytics } from '../../components/teacher/DetailedAnalytics';
import { courseService } from '../../services/courseService';
import toast from 'react-hot-toast';

export function TeacherDashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<teacherDashboardData | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [_loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [courses, setCourses] = useState<any[]>([]);

  const loadOrganization = useCallback(async () => {
    if (!user?.organizationDetails?.id) return;

    try {
      const orgData = await organizationService.getOrganizationById(user?.organizationDetails?.id.toString());
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  }, [user?.organizationDetails?.id]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        const [statsResponse, coursesData] = await Promise.all([
          courseService.teacherDashboardStats(),
          mockApi.getCourses({ teacherId: user.id })
        ]);

        setDashboardData(statsResponse);
        setCourses(coursesData);
      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        toast.error(error?.message ?? 'Failed to load Dashboard Data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    loadOrganization();
  }, [user, loadOrganization]);

  const stats = [
    {
      name: 'Total Courses',
      value: dashboardData?.totalCourses ?? 0,
      icon: BookOpenIcon,
      description: 'All created courses',
      className: 'bg-gradient-to-br from-blue-600 to-indigo-700',
      iconBg: 'bg-white/20'
    },
    {
      name: 'Live Courses',
      value: dashboardData?.totalLiveCourses ?? 0,
      icon: EyeIcon,
      description: 'Currently active',
      className: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      iconBg: 'bg-white/20'
    },
    {
      name: 'Total Students',
      value: dashboardData?.totalStudents ?? 0,
      icon: UserGroupIcon,
      description: 'Across all courses',
      className: 'bg-gradient-to-br from-violet-600 to-purple-700',
      iconBg: 'bg-white/20'
    },
    {
      name: 'Avg Completion',
      value: `${dashboardData?.averageCompletions ?? 0}%`,
      icon: ChartBarIcon,
      description: 'Student progress',
      className: 'bg-gradient-to-br from-amber-500 to-orange-600',
      iconBg: 'bg-white/20'
    }
  ];

  return (
    <div className="space-y-10 pb-10">
      {/* Hero Section - Bolder & Taller */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-200 text-sm font-medium">
                <SparklesIcon className="h-4 w-4 mr-2 text-yellow-400" />
                <span>Instructor Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Welcome back, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {user?.firstName}!
                </span>
              </h1>
              <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                You have <span className="text-white font-semibold">{dashboardData?.totalLiveCourses ?? 0} live courses</span> and <span className="text-white font-semibold">{dashboardData?.totalStudents ?? 0} active students</span> this week.
              </p>

              {organization && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Organization</p>
                    <p className="text-white font-medium">{organization.name}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/teacher/courses/new">
                <Button className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-xl shadow-blue-500/30 transition-all hover:scale-105 hover:-translate-y-1 rounded-2xl">
                  <PlusIcon className="h-6 w-6 mr-2" />
                  Create New Course
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Modern Pill Style */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 inline-flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
          >
            Detailed Analytics
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-10">
          {/* Stats Grid - Full Gradient Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className={`relative overflow-hidden rounded-3xl p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${stat.className}`}
                >
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>

                  <div className="relative flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl ${stat.iconBg} backdrop-blur-sm`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-white/80 text-sm font-medium">{stat.name}</p>
                      <p className="text-white/60 text-xs mt-1">{stat.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions - App Widget Style */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/teacher/courses/new" className="group">
                <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group-hover:-translate-y-1">
                  <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6 group-hover:scale-110 transition-transform">
                    <PlusIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Course</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Start building a new course from scratch with our easy builder.</p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                    Start Creating <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>

              <Link to="/teacher/programs/new" className="group">
                <div className="h-full bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 p-8 rounded-3xl border border-purple-100 dark:border-purple-800/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group-hover:-translate-y-1">
                  <div className="h-14 w-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30 mb-6 group-hover:scale-110 transition-transform">
                    <AcademicCapIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Program</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Bundle multiple courses into a comprehensive learning path.</p>
                  <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                    Build Program <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>

              <Link to="/teacher/courses" className="group">
                <div className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group-hover:-translate-y-1">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-6 group-hover:scale-110 transition-transform">
                    <BookOpenIcon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Manage Courses</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Edit content, manage students, and track performance.</p>
                  <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-2 transition-transform">
                    View All <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Courses - Enhanced Cards */}
          {courses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Courses</h2>
                <Link to="/teacher/courses" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center hover:underline">
                  View All Courses <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={course.coverImage || 'https://picsum.photos/400/225'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md ${course.status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                          {course.status === 'published' ? 'live' : course.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 h-10">
                        <RichTextDisplay content={course.description} />
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                          <UserGroupIcon className="h-4 w-4 mr-2 text-blue-500" />
                          <span>24 Students</span>
                        </div>
                        <Link to={`/teacher/courses/${course.id}/edit`}>
                          <Button size="sm" variant="outline" className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 border-gray-200 dark:border-gray-700">
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <DetailedAnalytics />
      )}
    </div>
  );
}
