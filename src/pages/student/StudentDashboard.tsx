import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';

import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { Course, Program, Enrollment, Certificate, Organization } from '../../types';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Radial progress component
const RadialProgress: React.FC<{ percentage: number; size?: number }> = ({ percentage, size = 120 }) => {
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-600 transition-all duration-300"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {Math.round(percentage)}%
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Complete
        </span>
      </div>
    </div>
  );
};

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const [enrollmentsData, coursesData, programsData, certificatesData] = await Promise.all([
        mockApi.getUserEnrollments(user.id),
        mockApi.getCourses({
          status: 'live',
          organizationId: user.id // Only get courses from user's organization
        }),
        mockApi.getPrograms({
          status: 'live',
          organizationId: user.id // Only get programs from user's organization
        }),
        mockApi.getCertificates(user.id)
      ]);

      setEnrollments(enrollmentsData);
      setCourses(coursesData);
      setPrograms(programsData);
      setCertificates(certificatesData);

      // Mock recent activity data
      const activity = [];
      for (const enrollment of enrollmentsData.slice(0, 3)) {
        const course = coursesData.find(c => c.id === enrollment.courseId);
        if (course) {
          // Find a random lesson from the course
          let lessonTitle = "Introduction";
          if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
            lessonTitle = course.modules[0].lessons[0].title;
          }

          activity.push({
            id: `activity-${Date.now()}-${Math.random()}`,
            courseId: course.id,
            courseTitle: course.title,
            lessonTitle,
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random time within last week
            progress: enrollment.progress || 0
          });
        }
      }
      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrganization = async () => {
    if (!user?.organizationDetails?.id) return;

    try {
      const orgData = await organizationService.getOrganizationById(user?.organizationDetails?.id.toString()
      );
      setOrganization(orgData);
    } catch (error) {
      console.error('Failed to load organization:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadOrganization();
  }, [user]);

  const enrolledCourses = courses.filter(course =>
    enrollments.some(enrollment => enrollment.courseId === course.id)
  );

  const enrolledPrograms = programs.filter(program =>
    enrollments.some(enrollment => enrollment.programId === program.id)
  );

  const availableCourses = courses.filter(course =>
    !enrollments.some(enrollment => enrollment.courseId === course.id)
  ).slice(0, 6);

  const handleEnrollCourse = async (courseId: string) => {
    try {
      await mockApi.enrollUser(user!.id, courseId);
      toast.success('Successfully enrolled in course!');
      // Reload data to show the newly enrolled course
      loadDashboardData();
    } catch (error) {
      console.error('Enrollment failed:', error);
      toast.error('Failed to enroll in course');
    }
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      // TODO: Replace with real certificate download API
      const certificate = certificates.find(c => c.id === certificateId);
      if (certificate?.downloadUrl) {
        window.open(certificate.downloadUrl, '_blank');
        toast.success('Certificate downloaded!');
      }
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return PlayIcon;
      case 'text': return DocumentTextIcon;
      case 'quiz': return QuestionMarkCircleIcon;
      default: return DocumentTextIcon;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overallProgress = enrolledCourses.length > 0
    ? enrolledCourses.reduce((acc, course) => {
      const enrollment = enrollments.find(e => e.courseId === course.id);
      return acc + (enrollment?.progress || 0);
    }, 0) / enrolledCourses.length
    : 0;

  const stats = [
    {
      name: 'Enrolled Courses',
      value: enrolledCourses.length.toString(),
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      name: 'Programs',
      value: enrolledPrograms.length.toString(),
      icon: AcademicCapIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: 'Hours Learned',
      value: Math.round(enrollments.reduce((acc, e) => acc + e.timeSpent, 0) / 60).toString(),
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      name: 'Certificates',
      value: certificates.length.toString(),
      icon: TrophyIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-blue-200 text-sm font-medium">
                <AcademicCapIcon className="h-4 w-4 mr-2" />
                <span>Student Hub</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Welcome back, {user?.firstName}!
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                  Continue your learning journey and explore new horizons.
                </p>
                {organization && (
                  <div className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                    <span>{organization.name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/student/discover">
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/20 rounded-xl px-6 h-12 font-bold transition-all backdrop-blur-sm">
                  Browse Courses
                </Button>
              </Link>
              <Link to="/student/todo">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl px-6 h-12 font-bold transition-all">
                  My Todo List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bgColor.replace('bg-', 'bg-')}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.name}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Focus Area: Progress */}
      {enrolledCourses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-10 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-shrink-0">
              <RadialProgress percentage={overallProgress} size={180} />
            </div>
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Your Learning Velocity
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
                You're maintaining a steady pace! Complete your remaining modules to unlock your certificates and achieve your learning goals for this month.
              </p>
              <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
                <div className="px-5 py-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                  <span className="block text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Status</span>
                  <span className="text-blue-700 dark:text-blue-300 font-bold">On Track</span>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                  <span className="block text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Next Milestone</span>
                  <span className="text-indigo-700 dark:text-indigo-300 font-bold">Course Completion</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Learning */}
      {enrolledCourses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <PlayIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Continue Learning
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.slice(0, 3).map((course) => {
              const enrollment = enrollments.find(e => e.courseId === course.id);
              return (
                <div
                  key={course.id}
                  className="group bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer"
                  onClick={() => navigate(`/student/course/${course.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700">
                      <img
                        src={course.coverImage || 'https://picsum.photos/80/60'}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug mb-3">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${enrollment?.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 w-8">
                          {Math.round(enrollment?.progress || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
                <BookOpenIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Available Courses
              </h2>
            </div>
            <Link to="/student/discover" className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              View all courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                className="group flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={course.coverImage || 'https://picsum.photos/400/225'}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                      New Course
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6">
                    {course.description}
                  </p>
                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center text-gray-400 text-xs font-medium">
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      {course.modules.length} modules
                    </div>
                    <Button
                      size="sm"
                      className="rounded-xl px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all hover:translate-y-[-1px] active:translate-y-[1px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnrollCourse(course.id);
                      }}
                    >
                      Enroll Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <ClockIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Recent Activity
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getLessonIcon('text');
                return (
                  <div key={activity.id} className="group flex items-start p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-all">
                    <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {activity.lessonTitle}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {activity.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        in {activity.courseTitle}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${activity.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500">
                          {Math.round(activity.progress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certificates */}
        {certificates.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                <TrophyIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Your Certificates
              </h2>
            </div>
            <div className="space-y-4">
              {certificates.slice(0, 3).map((certificate) => (
                <div
                  key={certificate.id}
                  className="group flex items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-yellow-500/30 transition-all"
                >
                  <div className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm group-hover:bg-yellow-50 dark:group-hover:bg-yellow-900/20 transition-colors">
                    <TrophyIcon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {certificate.templateData.course || certificate.templateData.program}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Issued on {new Date(certificate.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-4 rounded-xl px-4 h-9 bg-white dark:bg-gray-800 text-xs font-bold transition-all hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleDownloadCertificate(certificate.id)}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};