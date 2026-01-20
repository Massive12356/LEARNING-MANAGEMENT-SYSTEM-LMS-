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
import { courseService } from '../../services/courseService';

export function CourseViewer() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null); // Using any since the actual API response doesn't match Course type
  const [currentLesson, setCurrentLesson] = useState<any>(null); // Using any since the actual API response doesn't match Lesson type
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);


  // Normalize the API response data structure to match the expected format
  const normalizeCourseData = (data: any) => {
    // Create a mapping of lesson IDs to lesson objects for easy lookup
    const lessonMap = new Map<number, any>();

    data.content.forEach((lesson: any) => {
      lessonMap.set(lesson.id, {
        id: lesson.id.toString(), // Convert to string to match expected type
        title: lesson.title,
        description: lesson.lessonDescription,
        type: lesson.lessonType,
        content: {
          html: lesson.textContent,
          url: lesson.videoUrl,
          pdfUrl: lesson.pdfUrl,
          fileUrl: lesson.fileAttachmentURL,
        },
        duration: lesson.videoDuration,
        lessonNumber: lesson.lessonNumber,
        quizPassingScore: lesson.quizPassingScore,
        quizDuration: lesson.quizDuration,
        quizMaxAttempts: lesson.quizMaxAttempts,
        reflectionPrompt: lesson.reflectionPrompt,
      });
    });

    // Process modules and associate lessons with each module
    const modules = data.modules.map((module: any) => ({
      id: module.id.toString(), // Convert to string to match expected type
      title: module.title,
      description: module.description,
      moduleNumber: module.moduleNumber,
      lessons: module.courseContentIds
        .map((id: number) => lessonMap.get(id))
        .filter((lesson: any) => lesson !== undefined),
    }));

    return {
      id: data.course.id.toString(), // Convert to string to match expected type
      title: data.course.title,
      description: data.course.description,
      coverImage: data.course.images?.[0], // Use first image as cover
      tags: data.course.tags || [],
      modules,
      settings: data.settings,
      teacher: data.teacher,
      organization: data.organization,
      enrollmentStats: data.enrollmentStats,
    };
  };


  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      
      try {
        const courseData = await courseService.getCourseById(courseId);
        
        const normalizedCourse = normalizeCourseData(courseData);
        setCourse(normalizedCourse);
        
        // Set first lesson as current if available
        if (normalizedCourse.modules.length > 0 && normalizedCourse.modules[0].lessons.length > 0) {
          setCurrentLesson(normalizedCourse.modules[0].lessons[0]);
        }
        
        // Initialize with any previously completed lessons if available in the API response
        // For now, using an empty set
        setCompletedLessons(new Set());
      } catch (error) {
        console.error('Failed to load course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  console.log("COURSE ID:", courseId);

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };
  
  // Get the current module and lesson indices to enable navigation
  const getCurrentIndices = () => {
    if (!course || !currentLesson) return { moduleIndex: -1, lessonIndex: -1 };
    
    for (let i = 0; i < course.modules.length; i++) {
      const module = course.modules[i];
      const lessonIndex = module.lessons.findIndex((lesson: any) => lesson.id === currentLesson.id);
      
      if (lessonIndex !== -1) {
        return { moduleIndex: i, lessonIndex };
      }
    }
    
    return { moduleIndex: -1, lessonIndex: -1 };
  };
  
  const goToNextLesson = () => {
    const { moduleIndex, lessonIndex } = getCurrentIndices();
    
    if (moduleIndex === -1 || lessonIndex === -1) return;
    
    const currentModule = course.modules[moduleIndex];
    
    // If there's a next lesson in the current module
    if (lessonIndex < currentModule.lessons.length - 1) {
      setCurrentLesson(currentModule.lessons[lessonIndex + 1]);
      return;
    }
    
    // If we're at the last lesson of this module, go to the first lesson of the next module
    if (moduleIndex < course.modules.length - 1) {
      const nextModule = course.modules[moduleIndex + 1];
      if (nextModule.lessons.length > 0) {
        setCurrentLesson(nextModule.lessons[0]);
      }
    }
  };
  
  const goToPreviousLesson = () => {
    const { moduleIndex, lessonIndex } = getCurrentIndices();
    
    if (moduleIndex === -1 || lessonIndex === -1) return;
    
    // If there's a previous lesson in the current module
    if (lessonIndex > 0) {
      const currentModule = course.modules[moduleIndex];
      setCurrentLesson(currentModule.lessons[lessonIndex - 1]);
      return;
    }
    
    // If we're at the first lesson of this module, go to the last lesson of the previous module
    if (moduleIndex > 0) {
      const previousModule = course.modules[moduleIndex - 1];
      if (previousModule.lessons.length > 0) {
        setCurrentLesson(previousModule.lessons[previousModule.lessons.length - 1]);
      }
    }
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
        return (
          <VideoPlayer
            content={currentLesson.content?.url || ''}
            className="mb-6"
          />
        );
        
      case 'text':
      case 'textContent':
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
              content={currentLesson.content?.html || currentLesson.description || '<p>Rich text content would appear here</p>'} 
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
                  src={currentLesson.content?.pdfUrl || '#'}
                  className="w-full h-96 border-0"
                  title={currentLesson.title}
                />
              </div>
              <Button onClick={() => window.open(currentLesson.content?.pdfUrl, '_blank')}>Download PDF</Button>
            </div>
          </div>
        );
        
      case 'attachment':
        return (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6">
            <PaperClipIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">File Attachment</p>
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 mb-4">File: {currentLesson.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{currentLesson.description}</p>
                <Button onClick={() => window.open(currentLesson.content?.fileUrl, '_blank')}>Open Attachment</Button>
              </div>
            </div>
          </div>
        );
        
      case 'quiz':
        // For now, we'll use mock questions since we don't have the actual quiz data structure
        const mockQuestions = [
          {
            id: 'q1',
            question: 'What have you learned in this lesson?',
            type: 'short-text' as const,
            correctAnswers: ['Sample answer'],
            explanation: 'This is a sample quiz question.',
            points: 10
          }
        ];
        
        return (
          <QuizComponent
            questions={mockQuestions}
            title="Knowledge Check"
            description={currentLesson.description || 'Test your understanding of the material covered in this lesson.'}
            timeLimit={currentLesson.quizDuration || 15} // 15 minutes
            maxAttempts={currentLesson.quizMaxAttempts || 3}
            passingScore={currentLesson.quizPassingScore || 70}
            onSubmit={(answers, score) => {
              console.log('Quiz submitted:', { answers, score });
              handleLessonComplete(currentLesson.id);
            }}
            onComplete={(passed, score) => {
              console.log('Quiz completed:', { passed, score });
              if (passed) {
                handleLessonComplete(currentLesson.id);
              }
            }}
          />
        );
        
      case 'reflection':
        return (
          <ReflectionSubmission
            lessonId={currentLesson.id}
            title="Reflection Exercise"
            description={currentLesson.reflectionPrompt || currentLesson.description || 'Share your thoughts and insights about this lesson.'}
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

  const totalLessons = course.modules.reduce((acc: number, module: any) => acc + module.lessons.length, 0);
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
                {course.modules.map((module: any) => (
                  <div key={module.id}>
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 font-medium text-sm text-gray-900 dark:text-white">
                      {module.title}
                    </div>
                    {module.lessons.map((lesson: any) => {
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={goToPreviousLesson}
                        disabled={getCurrentIndices().moduleIndex === 0 && getCurrentIndices().lessonIndex === 0}
                      >
                        Previous
                      </Button>
                      <Button 
                        size="sm"
                        onClick={goToNextLesson}
                        disabled={
                          (getCurrentIndices().moduleIndex === course.modules.length - 1 && 
                           getCurrentIndices().lessonIndex === course.modules[course.modules.length - 1].lessons.length - 1)
                        }
                      >
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