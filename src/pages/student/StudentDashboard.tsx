import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { organizationService } from '../../services/organizationService';
import { Course, Program, Enrollment, Organization, StudentOverview, CertResponse, CertDetails, CertPagination } from '../../types';
import { 
  BookOpenIcon, 
  AcademicCapIcon,
  ClockIcon,
  TrophyIcon,
  ChartBarIcon,
  PlayIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { courseService } from '../../services/courseService';
import { certificateService } from '../../services/certificateService';
import { generateCertificatePDF } from '../../utils/generateCertificatePDF.tsx';

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
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [studentOverview, setStudentOverview] = useState<StudentOverview | null>(null);

  const [certificates, setCertificates] = useState<CertDetails[]>([]);
const [certPagination, setCertPagination] = useState<CertPagination | null>(null);
const [certLoading, setCertLoading] = useState(false);



  const loadCertificates = async (page = 1, limit = 10) => {
  if (!user) return;
  setCertLoading(true);

  try {
    const response: CertResponse = await certificateService.studentGetCertificates({ page, limit });
    
    setCertificates(response.certificates); // paginated certificates
    setCertPagination(response.pagination); // pagination info for UI
  } catch (error: any) {
    console.error('Failed to load certificates:', error);
    toast.error(error?.message ?? 'Failed to load certificates');
  } finally {
    setCertLoading(false);
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
    loadOrganization();
    loadstudentOverview();
    loadCertificates();
  }, [user]);

  console.log('UsersDetails:', user);

  const enrolledCourses = courses.filter(course => 
    enrollments.some(enrollment => enrollment.courseId === course.id)
  );




  const handleDownloadCertificate = async (certificateId: string) => {
    const cert = certificates.find(c => c.id === certificateId);
    if (!cert) {
      toast.error('Certificate not found');
      return;
    }
    try {
      sessionStorage.setItem(`certificate_preview_${cert.id}`, JSON.stringify(cert));
      navigate(`/student/certificate/preview/${encodeURIComponent(cert.id)}`);
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to open certificate preview');
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
              <span>Learning with {organization?.name ?? 'Unknown Organization'}</span>
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
      {/* Certificates Section */}
{certificates.length > 0 && (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Certificates
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Total: {certPagination?.total ?? certificates.length}
        </span>
      </div>
    </CardHeader>
    <CardContent className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                {cert.certificateName}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">{cert.acquiredDate}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Issued by: {cert.organization?.name ?? 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Course: {cert.course?.courseTitle ?? 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Credential ID: {cert.credentialId}
            </p>
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={() => handleDownloadCertificate(cert.id)}>
                Preview & Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {certPagination && certPagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center space-x-2">
          <Button 
            size="sm" 
            disabled={certPagination.page === 1 || certLoading}
            onClick={() => loadCertificates((certPagination.page ?? 1) - 1)}
          >
            Previous
          </Button>
          <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
            Page {certPagination.page} of {certPagination.totalPages}
          </span>
          <Button 
            size="sm" 
            disabled={certPagination.page === certPagination.totalPages || certLoading}
            onClick={() => loadCertificates((certPagination.page ?? 1) + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
)}

    </div>
  );
};
