// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { mockApi } from '../../../services/mockApi';
import { Course, Enrollment } from '../../../types';
import { 
  BookOpenIcon,
  ClockIcon,
  UserIcon,
  TrophyIcon,
  ArrowRightIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export function MyCoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEnrolledCourses = async () => {
      if (!user) return;
      
      try {
        // First get user's enrollments
        const enrollmentData = await mockApi.getUserEnrollments(user.id);
        
        // Then get all courses (filtered by organization)
        const coursesData = await mockApi.getCourses({ 
          status: 'live',
          organizationId: user.organizationId 
        });
        
        // Filter courses to only include enrolled ones
        const enrolled = coursesData.filter(course => 
          enrollmentData.some(enrollment => enrollment.courseId === course.id)
        );
        
        setEnrollments(enrollmentData);
        setAllCourses(coursesData);
        setEnrolledCourses(enrolled);
      } catch (error) {
        console.error('Failed to load enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnrolledCourses();
  }, [user]);

  const getProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment ? enrollment.progress : 0;
  };

  const getCompletionStatus = (courseId: string) => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.completedAt ? 'completed' : 'in-progress';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Continue your learning journey
        </p>
      </div>

      {/* Course List */}
      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course) => {
            const progress = getProgress(course.id);
            const completionStatus = getCompletionStatus(course.id);
            
            return (
              <Card 
                key={course.id} 
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl"
              >
                <div className="relative">
                  <img
                    src={course.coverImage || 'https://picsum.photos/400/225'}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  {completionStatus === 'completed' && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      COMPLETED
                    </div>
                  )}
                </div>
                
                <CardContent className="p-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 mb-2">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-3 text-base leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <BookOpenIcon className="h-4 w-4 mr-1" />
                      {course.modules.length} modules
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      4 weeks
                    </div>
                    {course.requiresCertificate && (
                      <div className="flex items-center">
                        <TrophyIcon className="h-4 w-4 mr-1" />
                        Certificate
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          completionStatus === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Link to={`/student/course/${course.id}`}>
                      <Button variant="primary" size="sm">
                        {completionStatus === 'completed' ? 'Review' : 'Continue Learning'}
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No enrolled courses
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-base leading-relaxed">
              You haven't enrolled in any courses yet. Discover new courses to get started!
            </p>
            <div className="mt-6">
              <Link to="/student/discover">
                <Button variant="primary">
                  Discover Courses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}