import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { enrollmentService } from '../../../services/enrollmentService';
import { Course, Enrollment } from '../../../types';
import { 
  BookOpenIcon, 
  ArrowRightIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export const MyCoursesPage: React.FC = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEnrolledCourses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [courses, enrollmentData] = await Promise.all([
        enrollmentService.getEnrolledCourses(user.id),
        enrollmentService.getUserEnrollments(user.id)
      ]);
      
      setEnrolledCourses(courses);
      setEnrollments(enrollmentData);
    } catch (error) {
      console.error('Failed to load enrolled courses:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrolledCourses();
  }, [user]);

  const getProgressForCourse = (courseId: string): number => {
    const enrollment = enrollments.find(e => e.courseId === courseId);
    return enrollment?.progress || 0;
  };

  const getNextLessonForCourse = (course: Course): string => {
    // In a real implementation, this would determine the next lesson based on progress
    // For now, we'll just return a placeholder
    return "Introduction to React";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Courses
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Continue your learning journey with your enrolled courses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {enrolledCourses.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enrolled Courses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900">
                <ClockIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {enrollments.reduce((acc, e) => acc + e.timeSpent, 0)} min
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Time Spent Learning
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900">
                <UserIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / Math.max(enrolledCourses.length, 1))}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average Progress
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => {
            const progressPercent = getProgressForCourse(course.id);
            const nextLesson = getNextLessonForCourse(course);

            return (
              <Card key={course.id} hover>
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={course.coverImage || 'https://picsum.photos/400/225'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Next Lesson Preview */}
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Next Lesson
                    </p>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white truncate">
                      {nextLesson}
                    </p>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Link to={`/student/course/${course.id}`}>
                      <Button variant="primary" size="sm">
                        Continue Learning
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
            <p className="mt-2 text-gray-600 dark:text-gray-400">
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
};