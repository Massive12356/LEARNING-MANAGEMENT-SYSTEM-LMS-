// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
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
  PlayIcon,
} from '@heroicons/react/24/outline';
import { courseService } from '../../../services/courseService';

export function MyCoursesPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEnrolledCourses = async () => {
      if (!user) return;

      try {
        const enrollmentData = await courseService.loadEnrolledCourses();
        console.log('ENROLLMENTS:', enrollmentData);
        setEnrollments(enrollmentData || []);
      } catch (error) {
        console.error('Failed to load enrolled courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnrolledCourses();
  }, [user]);


  const getProgress = (enrollment: any) => {
    return enrollment?.progress ?? 0;
  };

  const getCompletionStatus = (enrollment: any) => {
    return enrollment?.status === 'completed' ? 'completed' : 'in-progress';
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Courses</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Continue your learning journey</p>
      </div>

      {/* Course List */}
      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enrollment: any) => {
            const course = enrollment?.Course?.Course;
            const progress = getProgress(enrollment);
            const completionStatus = getCompletionStatus(enrollment);

            return (
              <Card key={enrollment.id} className="group hover:shadow-xl rounded-xl">
                <div className="relative">
                  <img
                    src={course?.images?.[0] || 'https://picsum.photos/400/225'}
                    alt={course?.courseTitle}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">{course?.courseTitle ?? 'Untitled Course'}</h3>

                  <p className="mt-2 text-gray-600 line-clamp-3">
                    {course?.description ?? 'No description available'}
                  </p>

                  <div className="mt-4 text-sm text-gray-500">
                    Modules: {enrollment?.Course?.courseModuleId?.length ?? 0}
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link to={`/student/course/${enrollment?.courseId}`}>
                      <Button size="sm">
                        {completionStatus === 'completed' ? 'Review' : 'Continue Learning'}
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
                <Button variant="primary">Discover Courses</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
