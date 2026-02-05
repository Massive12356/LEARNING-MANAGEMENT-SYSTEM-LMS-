import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RichTextDisplay } from '../../components/ui/RichTextEditor';
import { VideoPlayer } from '../../components/VideoPlayer';
import { QuizComponent } from '../../components/QuizComponent';
import { ReflectionSubmission } from '../../components/ReflectionSubmission';
import {
  QuizAnswerValue,
  StudentCourseProgressResponse,
  SubmitQuizPayload,
  ProgressRecord,
} from '../../types';
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
} from '@heroicons/react/24/outline';
import { courseService } from '../../services/courseService';
import { sanitizeHTML } from '../../utils/sanitization';
import { toast } from 'react-hot-toast';
import { normalizeCourseData } from '../../utils/normalizeData';

export function CourseViewer() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<any>(null); // Using any since the actual API response doesn't match Course type
  const [currentLesson, setCurrentLesson] = useState<any>(null); // Using any since the actual API response doesn't match Lesson type
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  // const [quizStarted, setQuizStarted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingLesson, setIsSubmittingLesson] = useState<string | null>(null);
  const [courseProgressData, setCourseProgressData] =
    useState<StudentCourseProgressResponse | null>(null);
  const [isSubmittingModule, setIsSubmittingModule] = useState(false);
  const [isSubmittingCourse, setIsSubmittingCourse] = useState(false);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  const [uiCompletedModules, setUiCompletedModules] = useState<Set<string>>(new Set());
  const [uiCourseCompleted, setUiCourseCompleted] = useState(false);

  console.log('userDetails:', user);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;

      try {
        const courseData = await courseService.getCourseById(courseId);
        const progressData = await courseService.getStudentCourseProgress(courseId);

        setCourseProgressData(progressData);

        const normalizedCourse = normalizeCourseData(courseData);
        setCourse(normalizedCourse);

        // ✅ completed lessons
        setCompletedLessons(new Set(progressData?.data?.completedContentIds?.map(String) ?? []));

        // ✅ completed modules
        const manuallyCompletedModules =
          progressData?.data?.progressRecords
            ?.filter((r: ProgressRecord) => r.trackModuleId !== null)
            .map((r: ProgressRecord) => String(r.trackModuleId)) ?? [];

        setCompletedModules(new Set(manuallyCompletedModules));

        // ✅ course completed
        setIsCourseCompleted(!!progressData?.data?.isCourseCompleted);

        setUiCompletedModules(new Set(progressData?.data?.completedModuleIds?.map(String) ?? []));

        setUiCourseCompleted(!!progressData?.data?.isCourseCompleted);

        // initial lesson
        if (normalizedCourse.modules.length > 0) {
          const firstLesson = normalizedCourse.modules[0].lessons[0];
          setCurrentLesson(firstLesson);
          setModuleId(firstLesson.moduleId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  useEffect(() => {
    setQuizResult(null);
    setSubmissionId(null); // Reset submissionId

    const fetchQuizResult = async () => {
      if (currentLesson?.type === 'quiz') {
        try {
          const data = await courseService.getQuizResults(currentLesson.id);
          if (data) {
            setQuizResult(data);
          }
        } catch (err) {
          console.error('Failed to fetch quiz results:', err);
        }
      }
    };

    fetchQuizResult();
  }, [currentLesson?.id]);

  // Mark a specific lesson as done
  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  // Mark a lesson as done via API call
  const markLessonAsDone = async (lessonId: string) => {
    if (!courseId) return;

    try {
      setIsSubmittingLesson(lessonId);

      await courseService.markContentAsDone(lessonId);

      toast.success('Lesson marked as completed');

      // ✅ ALWAYS refresh progress from backend
      await refreshCourseProgress();
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark lesson as completed');
    } finally {
      setIsSubmittingLesson(null);
    }
  };

  const refreshCourseProgress = async () => {
    if (!courseId) return;

    try {
      const progressData = await courseService.getStudentCourseProgress(courseId);

      setCourseProgressData(progressData);

      setCompletedLessons(new Set(progressData?.data?.completedContentIds?.map(String) ?? []));

      setCompletedModules(new Set(progressData?.data?.completedModuleIds?.map(String) ?? []));

      const courseCompleted = !!progressData?.data?.isCourseCompleted;

      // ✅ backend truth
      setIsCourseCompleted(courseCompleted);

      // ✅ KEEP UI IN SYNC WITH BACKEND
      setUiCourseCompleted(courseCompleted);
    } catch (error: any) {
      console.error(error?.message ?? 'Failed to refresh course progress');
    }
  };


  // Manually mark a module as done (for manual user action)
  const markModuleAsDone = async () => {
    if (!moduleId || !courseId) return;

    try {
      setIsSubmittingModule(true);
      await courseService.markModuleAsCompleted(moduleId, courseId);

      setUiCompletedModules(prev => new Set([...prev, moduleId]));
      toast.success('Module marked as completed manually!');
    } catch {
      toast.error('Failed to mark module');
    } finally {
      setIsSubmittingModule(false);
    }
  };

  // Mark the entire course as completed via API call
  const markCourseAsCompleted = async () => {
    if (!courseId) return;

    try {
      setIsSubmittingCourse(true);
      await courseService.markCourseAsCompleted(courseId);

      setUiCourseCompleted(true);
      toast.success('Course marked as completed!');
    } catch {
      toast.error('Failed to mark course');
    } finally {
      setIsSubmittingCourse(false);
    }
  };

  //handle start  handler
  const handleStartQuiz = async () => {
    if (!currentLesson || currentLesson.type !== 'quiz') {
      toast.error('This Lesson is not a quiz');
      return;
    }
    const quizContentId = currentLesson.id;
    console.log('Starting quiz with content ID:', quizContentId);

    try {
      setQuizResult(null);
      const response = await courseService.startQuizAttempt(quizContentId);
      // setQuizStarted(true);  Mark the quiz as started to show the timer
      setSubmissionId(response?.submissionId ?? null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to start quiz');
    }
  };

  // a function to submit a quiz attempt
  const handleSubmitQuiz = async (answers: Record<string, QuizAnswerValue>) => {
    if (!submissionId) {
      toast.error('Click start quiz first');
      return;
    }

    // 🔍 DEBUG – this is important
    console.log('RAW ANSWERS FROM UI:', answers);

    // Convert answers to proper backend format
    const payload: SubmitQuizPayload = {
      submissionId,
      answers: Object.fromEntries(
        Object.entries(answers).map(([questionId, value]) => [
          questionId,
          // Always wrap in array for multiple-choice questions
          Array.isArray(value) ? value : [value],
        ])
      ),
    };

    console.log('FORMATTED ANSWERS FOR API:', payload);

    try {
      setIsSubmitting(true);

      await courseService.submitQuizAttempt(payload);

      toast.success('Quiz submitted successfully');

      // 🔹 Fetch the results immediately after submission
      const resultData = await courseService.getQuizResults(currentLesson.id);
      setQuizResult(resultData);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const markQuizAsDone = async () => {
    if (!currentLesson || currentLesson.type !== 'quiz') return;

    try {
      setIsSubmittingLesson(currentLesson.id);
      await courseService.markContentAsDone(currentLesson.id);
      toast.success('Quiz marked as completed');
      await refreshCourseProgress();
    } catch (error: any) {
      toast.error(error?.message ?? 'Failed to mark quiz as completed');
    } finally {
      setIsSubmittingLesson(null);
    }
  };

  // Auto-submit quiz when time runs out
  const handleAutoSubmitQuiz = async (answers: Record<string, QuizAnswerValue>) => {
    if (!submissionId) {
      console.error('No submission ID available for auto-submit');
      return;
    }

    try {
      setIsSubmitting(true);

      // Convert answers to proper backend format
      const payload: SubmitQuizPayload = {
        submissionId,
        answers: Object.fromEntries(
          Object.entries(answers).map(([questionId, value]) => [
            questionId,
            // Always wrap in array for multiple-choice questions
            Array.isArray(value) ? value : [value],
          ])
        ),
      };

      console.log('Auto-submitting quiz with payload:', payload); // Debug log

      const response = await courseService.submitQuizAttempt(payload);

      console.log('Auto-submit quiz response:', response); // Debug log

      // Handle the response appropriately
      if (response) {
        toast.success('Quiz automatically submitted due to time limit');
        await refreshCourseProgress();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to auto-submit quiz');
      console.error('Quiz auto-submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // all the Ids needed are logged here

  // this Id if for General Course ID
  console.log('COURSE ID:', courseId);

  // this is for submitting a quiz
  console.log('sumissionId:', submissionId);

  // this is id is for Module ID
  console.log('Module ID:', moduleId);

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
      // setQuizStarted(false); // Reset quiz started state when changing lessons
      setSubmissionId(null); // Reset submission ID when changing lessons
      setIsSubmitting(false); // Reset submitting state when changing lessons
      return;
    }

    // If we're at the last lesson of this module, go to the first lesson of the next module
    if (moduleIndex < course.modules.length - 1) {
      const nextModule = course.modules[moduleIndex + 1];
      if (nextModule.lessons.length > 0) {
        setCurrentLesson(nextModule.lessons[0]);
        // setQuizStarted(false); // Reset quiz started state when changing lessons
        setSubmissionId(null); // Reset submission ID when changing lessons
        setIsSubmitting(false); // Reset submitting state when changing lessons
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
      // setQuizStarted(false); // Reset quiz started state when changing lessons
      setSubmissionId(null); // Reset submission ID when changing lessons
      setIsSubmitting(false); // Reset submitting state when changing lessons
      return;
    }

    // If we're at the first lesson of this module, go to the last lesson of the previous module
    if (moduleIndex > 0) {
      const previousModule = course.modules[moduleIndex - 1];
      if (previousModule.lessons.length > 0) {
        setCurrentLesson(previousModule.lessons[previousModule.lessons.length - 1]);
        // setQuizStarted(false); // Reset quiz started state when changing lessons
        setSubmissionId(null); // Reset submission ID when changing lessons
        setIsSubmitting(false); // Reset submitting state when changing lessons
      }
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return PlayIcon;
      case 'text':
        return DocumentTextIcon;
      case 'pdf':
        return DocumentArrowDownIcon;
      case 'attachment':
        return PaperClipIcon;
      case 'quiz':
        return QuestionMarkCircleIcon;
      case 'reflection':
        return PencilSquareIcon;
      default:
        return BookOpenIcon;
    }
  };

  useEffect(() => {
    setQuizResult(null);
  }, [currentLesson?.id]);

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.type) {
      case 'video':
        return (
          <div>
            <VideoPlayer content={currentLesson.content} className="mb-6" />
            {!completedLessons.has(currentLesson.id) && (
              <Button
                onClick={() => markLessonAsDone(currentLesson.id)}
                disabled={isSubmittingLesson === currentLesson.id}
              >
                {isSubmittingLesson === currentLesson.id ? 'Marking...' : 'Mark as Done'}
              </Button>
            )}
            {completedLessons.has(currentLesson.id) && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        );

      case 'text':
      case 'textContent':
        return (
          <div>
            <div
              className="prose prose-lg max-w-none dark:prose-invert mb-6 
                            prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl 
                            prose-h3:text-xl prose-p:text-gray-700 dark:prose-p:text-gray-300 
                            prose-a:text-blue-600 dark:prose-a:text-blue-400 
                            prose-strong:text-gray-900 dark:prose-strong:text-white
                            prose-blockquote:border-l-4 prose-blockquote:border-blue-500
                            prose-blockquote:pl-4 prose-blockquote:text-gray-600
                            dark:prose-blockquote:text-gray-400"
            >
              <RichTextDisplay
                content={
                  currentLesson.content?.html ||
                  currentLesson.description ||
                  '<p>Rich text content would appear here</p>'
                }
              />
            </div>
            {!completedLessons.has(currentLesson.id) && (
              <Button
                onClick={() => markLessonAsDone(currentLesson.id)}
                loading={isSubmittingLesson === currentLesson.id}
                disabled={isSubmittingLesson === currentLesson.id}
              >
                Mark as Done
              </Button>
            )}
            {completedLessons.has(currentLesson.id) && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6">
              <DocumentArrowDownIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">PDF Viewer</p>
              <div className="space-y-4">
                {currentLesson.content?.pdfUrl ? (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <iframe
                      src={currentLesson.content.pdfUrl}
                      className="w-full h-96 border-0"
                      title={currentLesson?.title ?? 'N/A'}
                      onError={e => {
                        console.error('PDF failed to load:', e);
                        // Handle PDF loading error
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      No PDF file available for this lesson.
                    </p>
                  </div>
                )}
                {currentLesson.content?.pdfUrl && (
                  <Button onClick={() => window.open(currentLesson.content.pdfUrl, '_blank')}>
                    Download PDF
                  </Button>
                )}
              </div>
            </div>
            {!completedLessons.has(currentLesson.id) && (
              <Button onClick={() => markLessonAsDone(currentLesson.id)}>Mark as Done</Button>
            )}
            {completedLessons.has(currentLesson.id) && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        );

      case 'attachment':
        return (
          <div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center mb-6">
              <PaperClipIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">File Attachment</p>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    File: {currentLesson?.title ?? 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {currentLesson?.description ?? 'N/A'}
                  </p>
                  <Button onClick={() => window.open(currentLesson.content?.fileUrl, '_blank')}>
                    Open Attachment
                  </Button>
                </div>
              </div>
            </div>
            {!completedLessons.has(currentLesson.id) && (
              <Button onClick={() => markLessonAsDone(currentLesson.id)}>Mark as Done</Button>
            )}
          </div>
        );

      case 'quiz':
        console.log('Rendering quiz lesson'); // Debug log
        console.log('Current lesson:', currentLesson); // Debug log
        console.log('Submission ID:', submissionId); // Debug log
        const isCompleted = completedLessons.has(currentLesson.id);

        // For now, we'll use mock questions since we don't have the actual quiz data structure
        const mockQuestions = [
          {
            id: 'q1',
            question: 'What have you learned in this lesson?',
            type: 'short-text' as const,
            correctAnswers: ['Sample answer'],
            explanation: 'This is a sample quiz question.',
            points: 10,
          },
        ];

        return (
          <div>
            <div>Debug: Quiz lesson rendered</div> {/* Debug element */}
            <QuizComponent
              quizContentId={currentLesson.id}
              submissionId={submissionId || undefined} // Pass the submissionId from state
              result={quizResult}
              questions={(() => {
                const quizQuestions = currentLesson.quizQuestions ?? mockQuestions;
                // Filter out any undefined questions
                const filteredQuestions = quizQuestions.filter((q: any) => q !== undefined);
                console.log('Passing quiz questions to QuizComponent:', filteredQuestions); // Debug log
                console.log(
                  'Quiz question IDs:',
                  filteredQuestions.map((q: any) => q?.id)
                ); // Debug log
                return filteredQuestions;
              })()}
              title="Knowledge Check"
              description={
                currentLesson.description ??
                'Test your understanding of the material covered in this lesson.'
              }
              timeLimit={currentLesson.quizDuration ?? 15} // 15 minutes
              maxAttempts={currentLesson.quizMaxAttempts ?? 3}
              quizPassingScore={currentLesson.quizPassingScore ?? 70}
              showStartButton={true}
              onStartQuiz={handleStartQuiz}
              onSubmit={answers => {
                console.log('Quiz submitted:', { answers });
                console.log('Current lesson ID:', currentLesson.id);
                console.log('Quiz questions:', currentLesson.quizQuestions); // Debug log
                console.log(
                  'Quiz question IDs:',
                  currentLesson.quizQuestions?.map((q: any) => q.id)
                ); // Debug log
                handleSubmitQuiz(answers);
              }}
              onComplete={(passed, score) => {
                console.log('Quiz completed:', { passed, score });
              }}
              disabled={isSubmitting}
            />
            {/* ✅ MANUAL COMPLETION */}
            {!isCompleted && quizResult && (
              <Button onClick={markQuizAsDone} disabled={isSubmittingLesson === currentLesson.id}>
                {isSubmittingLesson === currentLesson.id ? 'Marking...' : 'Mark Quiz as Done'}
              </Button>
            )}
            {isCompleted && (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        );

      case 'reflection':
        return (
          <div>
            <ReflectionSubmission
              lessonId={currentLesson.id}
              title="Reflection Exercise"
              description={
                currentLesson.reflectionPrompt ||
                currentLesson.description ||
                'Share your thoughts and insights about this lesson.'
              }
              submissionType="both"
              maxFiles={3}
              wordLimit={500}
              onSubmit={async submission => {
                // Handle reflection submission
                console.log('Reflection submitted:', submission);
                await markLessonAsDone(currentLesson.id);
              }}
              onSaveDraft={async draft => {
                // Handle draft saving
                console.log('Draft saved:', draft);
              }}
            />
            {!completedLessons.has(currentLesson.id) && (
              <div className="mt-4">
                <Button onClick={() => markLessonAsDone(currentLesson.id)}>Mark as Done</Button>
              </div>
            )}
          </div>
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
        <Link
          to="/student/dashboard"
          className="text-blue-600 hover:text-blue-500 mt-4 inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link to="/student/dashboard" className="hover:text-gray-700 dark:hover:text-gray-300">
            Dashboard
          </Link>
          <span className="mx-2">/</span>
          <span>{course?.title ?? 'N/A'}</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1
              className="text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(course?.title ?? 'N/A') }}
            ></h1>
            <div className="text-gray-600 dark:text-gray-400 mb-4 text-lg leading-relaxed">
              <p
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(course?.description ?? 'N/A') }}
              ></p>
            </div>
          </div>

          {/* progress course details */}
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {courseProgressData?.data?.progressPercentage ?? 0}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {courseProgressData?.data?.completedContent ?? 0}/
                {courseProgressData?.data?.totalContent ?? 0}
              </div>
              <div className="text-sm text-gray-500">Lessons</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${courseProgressData?.data?.progressPercentage ?? 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Course Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                Course Content
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {course.modules.map((module: any) => (
                  <div key={module.id}>
                    <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 font-medium text-sm text-gray-900 dark:text-white">
                      {module?.title ?? 'N/A'}
                    </div>
                    {module.lessons.map((lesson: any) => {
                      const Icon = getLessonIcon(lesson.type);
                      const isCompleted = completedLessons.has(lesson.id);
                      const isCurrent = currentLesson?.id === lesson.id;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setCurrentLesson(lesson);
                            // Set the module ID from the lesson's own moduleId property
                            if (lesson.moduleId) {
                              setModuleId(lesson.moduleId);
                            }
                            // setQuizStarted(false); // Reset quiz started state when changing lessons
                            setSubmissionId(null); // Reset submission ID when changing lessons
                            setIsSubmitting(false); // Reset submitting state when changing lessons
                          }}
                          className={`w-full px-6 py-3 text-left flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 dark:bg-blue-900 border-r-2 border-blue-600'
                              : ''
                          }`}
                        >
                          <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span
                            className={`flex-1 text-sm text-left ${isCurrent ? 'text-blue-600 font-medium' : 'text-gray-700 dark:text-gray-300'}`}
                          >
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
                      {currentLesson?.title ?? 'N/A'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {currentLesson?.description ?? 'N/A'}
                    </p>
                  </div>

                  <div
                    className={` ${currentLesson?.lessonType === 'quiz' ? 'hidden' : 'flex'} text-xl font-semibold text-gray-900 dark:text-white leading-tight`}
                  >
                    {' '}
                    Quiz Attempts: {currentLesson?.quizMaxAttempts ?? 0}
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentLesson.duration && (
                      <div className="flex items-center text-sm text-gray-500">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {currentLesson?.duration ?? 0} min
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
                  <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousLesson}
                        disabled={
                          getCurrentIndices().moduleIndex === 0 &&
                          getCurrentIndices().lessonIndex === 0
                        }
                      >
                        Previous
                      </Button>
                      {!uiCompletedModules.has(moduleId || '') && (
                        <Button
                          size="sm"
                          onClick={markModuleAsDone}
                          disabled={!moduleId || isSubmittingModule}
                        >
                          {isSubmittingModule ? 'Marking Module...' : 'Mark Module as Done'}
                        </Button>
                      )}

                      {uiCompletedModules.has(moduleId || '') && (
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">Module Completed</span>
                        </div>
                      )}

                      {!uiCourseCompleted && !isCourseCompleted && (
                        <Button
                          size="sm"
                          onClick={markCourseAsCompleted}
                          disabled={!courseId || isSubmittingCourse}
                        >
                          {isSubmittingCourse ? 'Marking Course...' : 'Mark Course as Completed'}
                        </Button>
                      )}

                      {uiCourseCompleted && (
                        <div className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          <span className="text-sm font-medium">Course Completed</span>
                        </div>
                      )}

                      <Button
                        size="sm"
                        onClick={goToNextLesson}
                        disabled={
                          getCurrentIndices().moduleIndex === course.modules.length - 1 &&
                          getCurrentIndices().lessonIndex ===
                            course.modules[course.modules.length - 1].lessons.length - 1
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
