import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { RichTextDisplay } from '../../components/ui/RichTextEditor';
import { VideoPlayer } from '../../components/VideoPlayer';
import { QuizComponent } from '../../components/QuizComponent';
import { ReflectionSubmission } from '../../components/ReflectionSubmission';
import { mockApi } from '../../services/mockApi';
import { Course, Lesson } from '../../types';
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
  ChevronRightIcon,
  ChevronLeftIcon,
  AcademicCapIcon,
  ListBulletIcon,
  ArrowLongLeftIcon
} from '@heroicons/react/24/outline';

export function CourseViewer() {
  const { courseId } = useParams<{ courseId: string }>();
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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Dynamic V2 Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl mb-10">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <Link
                to="/student/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all"
              >
                <ArrowLongLeftIcon className="h-4 w-4" />
                Back to Dashboard
              </Link>

              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-3">
                  In Progress
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {course.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6">
              <div className="space-y-2 text-center">
                <p className="text-3xl font-black text-white">{Math.round(progressPercent)}%</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed</p>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div className="space-y-2 text-center">
                <p className="text-3xl font-black text-blue-400">{completedCount}/{totalLessons}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lessons</p>
              </div>
            </div>
          </div>

          <div className="mt-8 relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar - Modern Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm sticky top-8">
            <div className="p-8 border-b border-gray-50 dark:border-gray-700 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
                  <ListBulletIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Course Map</h3>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-400px)] custom-scrollbar">
              {course.modules.map((module) => (
                <div key={module.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <div className="px-8 py-4 bg-slate-50/30 dark:bg-slate-900/30">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{module.title}</p>
                  </div>
                  <div className="py-2">
                    {module.lessons.map((lesson) => {
                      const Icon = getLessonIcon(lesson.type);
                      const isCompleted = completedLessons.has(lesson.id);
                      const isCurrent = currentLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setCurrentLesson(lesson)}
                          className={`w-full px-8 py-4 text-left flex items-start gap-4 transition-all group ${isCurrent
                            ? 'bg-blue-500/10 border-r-4 border-blue-500'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                            }`}
                        >
                          <div className={`mt-1 flex-shrink-0 p-1.5 rounded-lg transition-colors ${isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold leading-tight line-clamp-2 transition-colors ${isCurrent ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-500'
                              }`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5">
                              {isCompleted && (
                                <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                  <CheckCircleIcon className="h-3 w-3" />
                                  Done
                                </div>
                              )}
                              {lesson.duration && (
                                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                  <ClockIcon className="h-3 w-3" />
                                  {lesson.duration}m
                                </div>
                              )}
                            </div>
                          </div>

                          <ChevronRightIcon className={`h-4 w-4 mt-1 transition-all ${isCurrent ? 'text-blue-500 translate-x-1' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                            }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {currentLesson ? (
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="p-8 md:p-10 border-b border-gray-50 dark:border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                          {currentLesson.type}
                        </span>
                        {currentLesson.isRequired && (
                          <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-rose-500/20">
                            Required
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                        {currentLesson.title}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-3xl line-clamp-2">
                        {currentLesson.description}
                      </p>
                    </div>

                    {currentLesson.duration && (
                      <div className="flex-shrink-0 px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] border border-gray-50 dark:border-gray-700 text-center">
                        <ClockIcon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                        <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{currentLesson.duration}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Minutes</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <div className="mb-10">
                    {renderLessonContent()}
                  </div>

                  {/* Premium Lesson Navigation */}
                  <div className="flex items-center justify-between pt-10 border-t border-gray-50 dark:border-gray-700">
                    <div>
                      {completedLessons.has(currentLesson.id) && (
                        <div className="inline-flex items-center gap-3 px-5 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Lesson Completed</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-14 px-8 rounded-2xl border-gray-200 dark:border-gray-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center gap-2"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center gap-2"
                      >
                        Next Lesson
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] text-center py-24 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] w-fit mx-auto mb-8">
                <AcademicCapIcon className="h-20 w-20 text-slate-300" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">
                Welcome to the Classroom
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium text-lg">
                Your learning journey starts here. Select a lesson from the menu on the left to begin.
              </p>
              <div className="mt-12 flex items-center justify-center gap-3 text-blue-500 animate-bounce">
                <ChevronLeftIcon className="h-5 w-5" />
                <span className="font-bold uppercase tracking-widest text-xs">Pick a lesson</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}