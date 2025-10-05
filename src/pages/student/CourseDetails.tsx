import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockApi } from '../../services/mockApi';
import { Course, Module, Lesson, LessonProgress } from '../../types';
import { 
  PlayIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  PaperClipIcon,
  QuestionMarkCircleIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseDetails = async () => {
      if (!courseId || !user) return;
      
      try {
        const [courseData, progressData] = await Promise.all([
          mockApi.getCourseById(courseId),
          mockApi.getStudentProgress(user.id, courseId)
        ]);
        
        setCourse(courseData);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to load course details:', error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    loadCourseDetails();
  }, [courseId, user]);

  const handleMarkModuleComplete = async (moduleId: string) => {
    if (!user || !courseId) return;

    try {
      await mockApi.updateProgress(user.id, moduleId, { completed: true });
      
      // Update local progress state
      setProgress(prev => [
        ...prev.filter(p => p.lessonId !== moduleId),
        {
          id: `progress-${Date.now()}`,
          userId: user.id,
          lessonId: moduleId,
          completed: true,
          timeSpent: 0,
          completedAt: new Date()
        }
      ]);
      
      toast.success('Module marked as complete!');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const isModuleCompleted = (moduleId: string) => {
    return progress.some(p => p.lessonId === moduleId && p.completed);
  };

  const getCompletedModulesCount = () => {
    if (!course) return 0;
    return course.modules.filter(module => isModuleCompleted(module.id)).length;
  };

  const getProgressPercentage = () => {
    if (!course || course.modules.length === 0) return 0;
    return Math.round((getCompletedModulesCount() / course.modules.length) * 100);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return PlayIcon;
      case 'text': return DocumentTextIcon;
      case 'pdf': return DocumentArrowDownIcon;
      case 'attachment': return PaperClipIcon;
      case 'quiz': return QuestionMarkCircleIcon;
      case 'reflection': return PencilSquareIcon;
      default: return BookOpenIcon;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course not found</h2>
        <Link to="/student/dashboard" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const progressPercent = getProgressPercentage();
  const completedModules = getCompletedModulesCount();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/student/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300">
          Dashboard
        </Link>
        <span>/</span>
        <span>Course Details</span>
      </div>

      {/* Course Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <img
              src={course.coverImage || 'https://picsum.photos/300/200'}
              alt={course.title}
              className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {course.description}
              </p>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  {course.modules.length} Modules
                </div>
                {course.requiresCertificate && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <TrophyIcon className="h-4 w-4 mr-2" />
                    Certificate Available
                  </div>
                )}
                {course.isGraded && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                    Graded
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course Progress
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {completedModules} of {course.modules.length} modules completed
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
                    {progressPercent}%
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Link to={`/student/course/${course.id}`}>
                  <Button>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    {progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                </Link>
                <Link to="/student/dashboard">
                  <Button variant="outline">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Modules */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Course Content
        </h2>
        
        {course.modules.map((module, moduleIndex) => {
          const isCompleted = isModuleCompleted(module.id);
          
          return (
            <Card key={module.id} className={`${isCompleted ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted 
                        ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        moduleIndex + 1
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {module.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleMarkModuleComplete(module.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {module.lessons.length > 0 && (
                <CardContent>
                  <div className="space-y-3">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const Icon = getLessonIcon(lesson.type);
                      
                      return (
                        <div key={lesson.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Icon className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {lessonIndex + 1}. {lesson.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="capitalize">{lesson.type}</span>
                              {lesson.duration && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    {lesson.duration} min
                                  </div>
                                </>
                              )}
                              {lesson.isRequired && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-600 dark:text-red-400">Required</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Course Tags */}
      {course.tags.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Course Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}