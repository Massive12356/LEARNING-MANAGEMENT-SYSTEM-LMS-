// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockApi } from '../../services/mockApi';
import { Program, Course } from '../../types';
import { 
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  LockClosedIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

export function ProgramViewer() {
  const { programId } = useParams<{ programId: string }>();
  const { user } = useAuthStore();
  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgram = async () => {
      if (!programId || !user?.organizationId) return;
      
      try {
        const [programData, allCourses] = await Promise.all([
          mockApi.getProgramById(programId),
          mockApi.getCourses({ 
            organizationId: user.organizationId // Only get courses from user's organization
          })
        ]);
        
        setProgram(programData);
        
        // Filter courses that belong to this program and are from the user's organization
        const programCourses = allCourses.filter(course => 
          programData.courseIds.includes(course.id)
        );
        setCourses(programCourses);
        
        // Mock completed courses
        setCompletedCourses(new Set(['course-1']));
      } catch (error) {
        console.error('Failed to load program:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [programId, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Program not found</h2>
        <Link to="/student/dashboard" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const completedCount = completedCourses.size;
  const totalCourses = courses.length;
  const progressPercent = totalCourses > 0 ? (completedCount / totalCourses) * 100 : 0;
  const isProgramComplete = completedCount === totalCourses;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Program Header */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/student/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span>{program.title}</span>
        </div>
        
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {program.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {program.description}
                </p>
                
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    {totalCourses} Courses
                  </div>
                  {program.requiresCertificate && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <TrophyIcon className="h-4 w-4 mr-2" />
                      Certificate Available
                    </div>
                  )}
                  {program.requiredOrder && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <LockClosedIcon className="h-4 w-4 mr-2" />
                      Sequential Order Required
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Program Progress
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {completedCount} of {totalCourses} courses completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>

                {/* Certificate Status */}
                {program.requiresCertificate && (
                  <div className={`p-4 rounded-lg ${
                    isProgramComplete 
                      ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' 
                      : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center">
                      <TrophyIcon className={`h-5 w-5 mr-3 ${
                        isProgramComplete ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          isProgramComplete ? 'text-green-800 dark:text-green-200' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {isProgramComplete ? 'Certificate Available!' : 'Certificate Pending'}
                        </p>
                        <p className={`text-sm ${
                          isProgramComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {isProgramComplete 
                            ? 'Congratulations! You can now download your certificate.' 
                            : 'Complete all courses to earn your certificate.'
                          }
                        </p>
                      </div>
                      {isProgramComplete && (
                        <Button className="ml-auto" size="sm">
                          Download Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {program.coverImage && (
                <div className="lg:w-64 mt-6 lg:mt-0">
                  <img
                    src={program.coverImage}
                    alt={program.title}
                    className="w-full h-48 lg:h-64 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Program Courses
        </h2>
        
        {courses.map((course, index) => {
          const isCompleted = completedCourses.has(course.id);
          const isLocked = program.requiredOrder && index > 0 && !completedCourses.has(courses[index - 1].id);
          const canAccess = !isLocked;

          return (
            <Card key={course.id} className={`${isLocked ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-6">
                  {/* Course Number */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    isCompleted 
                      ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                      : isLocked
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                      : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="h-6 w-6" />
                    ) : isLocked ? (
                      <LockClosedIcon className="h-6 w-6" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Course Image */}
                  {course.coverImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Course Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <BookOpenIcon className="h-4 w-4 mr-1" />
                        {course.modules.length} Modules
                      </div>
                      {course.requiresCertificate && (
                        <div className="flex items-center">
                          <TrophyIcon className="h-4 w-4 mr-1" />
                          Certificate
                        </div>
                      )}
                      {course.isGraded && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                          Graded
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {course.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Course Actions */}
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <div className="text-center">
                        <div className="text-green-600 dark:text-green-400 mb-2">
                          <CheckCircleIcon className="h-8 w-8 mx-auto" />
                        </div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          Completed
                        </p>
                        <Link to={`/student/course/${course.id}`}>
                          <Button variant="outline" size="sm" className="mt-2">
                            Review
                          </Button>
                        </Link>
                      </div>
                    ) : isLocked ? (
                      <div className="text-center">
                        <div className="text-gray-400 mb-2">
                          <LockClosedIcon className="h-8 w-8 mx-auto" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Locked
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Complete previous course
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Link to={`/student/course/${course.id}`}>
                          <Button className="mb-2">
                            <PlayIcon className="h-4 w-4 mr-2" />
                            Start Course
                          </Button>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ready to begin
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No courses in this program
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Courses will appear here when they are added to the program.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}