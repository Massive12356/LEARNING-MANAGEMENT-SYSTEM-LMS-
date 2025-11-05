// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RichTextDisplay } from '../../components/ui/RichTextEditor';
import { VideoPlayer } from '../../components/VideoPlayer';
import { QuizComponent } from '../../components/QuizComponent';
import { ReflectionSubmission } from '../../components/ReflectionSubmission';
import { mockApi } from '../../services/mockApi';
import { Course, Module, Lesson } from '../../types';
import { 
  PlayIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  PaperClipIcon,
  QuestionMarkCircleIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

export function CourseViewer() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        const courseData = await mockApi.getCourseById(courseId);
        setCourse(courseData);
        
        // Set first lesson as current if available
        if (courseData.modules.length > 0 && courseData.modules[0].lessons.length > 0) {
          setCurrentLesson(courseData.modules[0].lessons[0]);
        }
        
        // Mock completed lessons
        setCompletedLessons(new Set(['lesson-1']));
      } catch (error) {
        console.error('Failed to load course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
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

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.type) {
      case 'video':
        const videoContent = currentLesson.content;
        return (
          <VideoPlayer
            content={videoContent}
            className="mb-6"
          />
        );
        
      case 'text':
        return (
          <div className="prose prose-lg max-w-none dark:prose-invert mb-6 
                          prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl 
                          prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 
                          prose-a:text-blue-600 dark:prose-a:text-blue-400 
                          prose-strong:text-gray-900 dark:prose-strong:text-white
                          prose-blockquote:border-l-4 prose-blockquote:border-blue-500
                          prose-blockquote:pl-4 prose-blockquote:text-gray-600
                          dark:prose-blockquote:text-gray-400">
            <RichTextDisplay 
              content={currentLesson.content?.html || '<p>Rich text content would appear here</p>'} 
            />
          </div>
        );
        
      case 'pdf':
        return (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6">
            <DocumentArrowDownIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">PDF Viewer</p>
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <iframe
                  src={currentLesson.content?.url || '#'}
                  className="w-full h-96 border-0"
                  title={currentLesson.title}
                />
              </div>
              <Button>Download PDF</Button>
            </div>
          </div>
        );
        
      case 'quiz':
        const mockQuestions = [
          {
            id: 'q1',
            question: 'What is React?',
            type: 'multiple-choice' as const,
            options: ['A JavaScript library', 'A database', 'A CSS framework', 'A server'],
            correctAnswer: 'A JavaScript library',
            explanation: 'React is a JavaScript library for building user interfaces, particularly web applications.',
            points: 10
          },
          {
            id: 'q2',
            question: 'What does JSX stand for?',
            type: 'short-text' as const,
            correctAnswer: ['JavaScript XML', 'JSX'],
            explanation: 'JSX stands for JavaScript XML, which allows you to write HTML-like syntax in JavaScript.',
            points: 5
          }
        ];
        
        return (
          <QuizComponent
            questions={mockQuestions}
            title="Knowledge Check"
            description={currentLesson.description}
            timeLimit={15} // 15 minutes
            passingScore={70}
            onSubmit={(answers, score) => {
              console.log('Quiz submitted:', { answers, score });
              if (score >= 70) {
                handleLessonComplete(currentLesson.id);
              }
            }}
            onComplete={(passed, score) => {
              console.log('Quiz completed:', { passed, score });
            }}
          />
        );
        
      case 'reflection':
        return (
          <ReflectionSubmission
            lessonId={currentLesson.id}
            title="Reflection Exercise"
            description={currentLesson.description || 'Share your thoughts and insights about this lesson.'}
            submissionType="both"
            maxFiles={3}
            wordLimit={500}
            onSubmit={async (submission) => {
              // Handle reflection submission
              console.log('Reflection submitted:', submission);
              handleLessonComplete(currentLesson.id);
            }}
            onSaveDraft={async (draft) => {
              // Handle draft saving
              console.log('Draft saved:', draft);
            }}
          />
        );
        
      default:
        return (
          <div className="text-center py-12">
            <BookOpenIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">Lesson content not available</p>
          </div>
        );
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

  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const completedCount = completedLessons.size;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/student/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span>{course.title}</span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg leading-relaxed">
              {course.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercent)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedCount}/{totalLessons}</div>
              <div className="text-sm text-gray-500">Lessons</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Course Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Course Content</h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {course.modules.map((module) => (
                  <div key={module.id}>
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 font-medium text-sm text-gray-900 dark:text-white">
                      {module.title}
                    </div>
                    {module.lessons.map((lesson) => {
                      const Icon = getLessonIcon(lesson.type);
                      const isCompleted = completedLessons.has(lesson.id);
                      const isCurrent = currentLesson?.id === lesson.id;
                      
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full px-6 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            isCurrent ? 'bg-blue-50 dark:bg-blue-900 border-r-2 border-blue-600' : ''
                          }`}
                        >
                          <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className={`flex-1 text-sm text-left ${isCurrent ? 'text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
                            {lesson.title}
                          </span>
                          {isCompleted && (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                          {lesson.duration && (
                            <div className="flex items-center text-xs text-gray-500 flex-shrink-0">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {lesson.duration}m
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {currentLesson ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
                      {currentLesson.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {currentLesson.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentLesson.duration && (
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {currentLesson.duration} min
                      </div>
                    )}
                    {currentLesson.isRequired && (
                      <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                        Required
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {renderLessonContent()}
                  
                  {/* Lesson Navigation */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      {completedLessons.has(currentLesson.id) && (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Previous
                      </Button>
                      <Button size="sm">
                        Next Lesson
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a lesson to begin
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a lesson from the course content to start learning.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}