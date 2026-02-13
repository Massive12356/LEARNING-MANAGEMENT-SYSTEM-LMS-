import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

import { mockApi } from '../../services/mockApi';
import { organizationService } from '../../services/organizationService';
import { Course, Program, Enrollment, Certificate, Organization, StudentOverview } from '../../types';
import { 
  BookOpenIcon, 
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { courseService } from '../../services/courseService';

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
  const [studentOverview, setStudentOverview] = useState<StudentOverview | null>(null);

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

   const loadstudentOverview = async () => {
        if (!user) return;
    try {
      const response = await courseService.getStudentDashOverviewStats();
      setStudentOverview(response);
    }catch (error:any) {
      toast.error(error?.message ?? 'Failed to load dashboard overview stats');
    }
   }

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
    loadstudentOverview();
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
      value: studentOverview?.enrolledCourses ?? 0,
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      name: 'Programs',
      value: studentOverview?.programs ?? 0,
      icon: AcademicCapIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      name: 'Hours Learned',
      value: studentOverview?.hoursLearned ?? '0',
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    },
    {
      name: 'Certificates',
      value: studentOverview?.certificates ?? 0,
      icon: TrophyIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section with Organization Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Continue your learning journey
          </p>
          {organization ? (
            <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>Learning with {organization?.name}</span>
            </div>
          ) : (
            <div className="mt-2 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              <span>No organization enrollment found</span>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <Link to="/student/discover">
            <Button variant="outline">
              Browse Courses
            </Button>
          </Link>
          <Link to="/student/todo">
            <Button>
              My Todo List
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center">
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall Progress */}
      {enrolledCourses.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Overall Progress
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6">
            <RadialProgress percentage={overallProgress} />
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-center">
              You're making great progress! Keep going to reach your learning goals.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Continue Learning */}
      {enrolledCourses.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Continue Learning
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 3).map((course) => {
                const enrollment = enrollments.find(e => e.courseId === course.id);
                return (
                  <div 
                    key={course.id} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/student/course/${course.id}`)}
                  >
                    <div className="flex items-start">
                      <img
                        src={course.coverImage || 'https://picsum.photos/80/60'}
                        alt={course.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="ml-4 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                          {course.title}
                        </h3>
                        <div className="mt-2 flex items-center">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${enrollment?.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            {Math.round(enrollment?.progress || 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Available Courses
              </h2>
              <Link to="/student/discover" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
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
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {course.modules.length} modules
                      </span>
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnrollCourse(course.id);
                        }}
                      >
                        Enroll
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getLessonIcon('text'); // Default to text icon
                return (
                  <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.lessonTitle}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        in {activity.courseTitle}
                      </p>
                      <div className="mt-2 flex items-center">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${activity.progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                          {Math.round(activity.progress)}% complete
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Certificates
            </h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.slice(0, 3).map((certificate) => (
                <div 
                  key={certificate.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                      <TrophyIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {certificate.templateData.course || certificate.templateData.program}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {certificate.templateData.name}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(certificate.generatedAt).toLocaleDateString()}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadCertificate(certificate.id)}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};