// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RichTextDisplay } from '../../components/ui/RichTextEditor';
import { mockApi } from '../../services/mockApi';
import { Course, Module } from '../../types';
import { 
  BookOpenIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  TrophyIcon,
  PlayIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  PencilSquareIcon,
  PaperClipIcon,
  DocumentArrowDownIcon,
  ArrowLeftIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(['lesson-1', 'lesson-3']));

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        const courseData = await mockApi.getCourseById(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Failed to load course:', error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return PlayIcon;
      case 'text': return DocumentTextIcon;
      case 'pdf': return DocumentArrowDownIcon;
      case 'attachment': return PaperClipIcon;
      case 'quiz': return QuestionMarkCircleIcon;
      case 'reflection': return PencilSquareIcon;
      default: return DocumentTextIcon;
    }
  };

  const isModuleCompleted = (moduleId: string) => {
    const module = course?.modules.find(m => m.id === moduleId);
    if (!module) return false;
    
    return module.lessons.every(lesson => completedLessons.has(lesson.id));
  };

  const handleEnroll = async () => {
    try {
      // Mock enrollment
      toast.success('Successfully enrolled in course!');
      navigate(`/student/course/${courseId}`);
    } catch (error) {
      toast.error('Failed to enroll in course');
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course not found</h2>
          <Link to="/student/discover" className="text-blue-600 hover:text-blue-500 mt-4 inline-block">
            Browse Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/student/discover')}
          className="flex items-center"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      {/* Course Header */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-6">
            <img
              src={course.coverImage || 'https://picsum.photos/300/200'}
              alt={course.title}
              className="w-full md:w-48 h-32 object-cover rounded-lg flex-shrink-0"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {course.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <BookOpenIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">{course.modules.length} Modules</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">4 weeks</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Self-paced</span>
                </div>
                {course.requiresCertificate && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <TrophyIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Certificate</span>
                  </div>
                )}
                {course.isGraded && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                    Graded
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleEnroll}
                  className="flex-1 sm:flex-none"
                >
                  Enroll Now
                </Button>
                <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Contact Instructor
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Modules */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Course Content
        </h2>
        
        {course.modules.map((module, moduleIndex) => {
          const isCompleted = isModuleCompleted(module.id);
          
          return (
            <Card key={module.id} className={`${isCompleted ? 'ring-2 ring-green-200 dark:ring-green-800' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
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
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {module.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {module.lessons.length} lessons
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const Icon = getLessonIcon(lesson.type);
                    const isCompleted = completedLessons.has(lesson.id);
                    
                    return (
                      <div 
                        key={lesson.id} 
                        className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Icon className={`h-5 w-5 mr-3 flex-shrink-0 ${
                          isCompleted 
                            ? 'text-green-500' 
                            : 'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <span className="text-gray-900 dark:text-white font-medium truncate">
                              {lesson.title}
                            </span>
                            {lesson.isRequired && (
                              <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {lesson.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                          {lesson.duration && (
                            <div className="flex items-center text-sm text-gray-500">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {lesson.duration}m
                            </div>
                          )}
                          {isCompleted && (
                            <CheckCircleIcon className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Course Tags */}
      {course.tags.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 text-lg">
              Course Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium"
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