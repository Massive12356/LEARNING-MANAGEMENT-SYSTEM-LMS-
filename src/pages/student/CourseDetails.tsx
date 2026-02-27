import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { RichTextDisplay } from '../../components/ui/RichTextEditor';
import { mockApi } from '../../services/mockApi';
import { Course, Module } from '../../types';
import {
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
  PlayIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  PencilSquareIcon,
  PaperClipIcon,
  DocumentArrowDownIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CourseDetails() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedLessons] = useState<Set<string>>(new Set(['lesson-1', 'lesson-3']));

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
    const module = course?.modules.find((m: Module) => m.id === moduleId);
    if (!module) return false;

    return module.lessons.every((lesson: any) => completedLessons.has(lesson.id));
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
    <div className="space-y-10 pb-16">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('/grid-pattern.svg')] opacity-10"></div>

        <div className="relative p-10 md:p-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-6 max-w-2xl">
              <button
                onClick={() => navigate('/student/discover')}
                className="group inline-flex items-center px-4 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 text-sm font-bold hover:bg-white/10 transition-all"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Discovery
              </button>

              <div className="space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                  {(course as any).category || 'Professional Development'}
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                  {course.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <BookOpenIcon className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-slate-300 text-sm font-bold">{course.modules.length} Modules</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <TrophyIcon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-slate-300 text-sm font-bold">Certification</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                    <ClockIcon className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-sm font-bold">Self-paced</span>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-slate-800 rounded-3xl p-4 border border-white/10">
                <img
                  src={course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                  alt={course.title}
                  className="w-full md:w-64 h-40 object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              About this course
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              <RichTextDisplay content={course.description} />
              <p className="mt-4">
                This comprehensive course is designed to take you from foundational concepts to advanced practical implementation. Through a mix of high-quality video content, detailed readings, and hands-on projects, you'll gain the skills needed to excel in this field.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Course Curriculum
              </h2>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {course.modules.length} Modules &bull; 4 Weeks
              </div>
            </div>

            <div className="space-y-4">
              {course.modules.map((module: Module, moduleIndex: number) => {
                const isCompleted = isModuleCompleted(module.id);

                return (
                  <div
                    key={module.id}
                    className={`bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden border transition-all ${isCompleted
                      ? 'border-emerald-500/20 bg-emerald-50/10'
                      : 'border-gray-100 dark:border-gray-700 hover:border-blue-500/20'
                      }`}
                  >
                    <div className="p-6 md:p-8">
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex items-start gap-5">
                          <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl flex-shrink-0 transition-colors ${isCompleted
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                            {isCompleted ? <CheckCircleIcon className="h-7 w-7" /> : moduleIndex + 1}
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                              {module.title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-2">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="hidden sm:block text-right">
                          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                            {module.lessons.length} Lessons
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 space-y-2">
                        {module.lessons.map((lesson: any) => {
                          const Icon = getLessonIcon(lesson.type);
                          const isLessonDone = completedLessons.has(lesson.id);

                          return (
                            <div
                              key={lesson.id}
                              className="group flex items-center p-3 sm:p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900/50 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all cursor-default"
                            >
                              <div className={`p-2 rounded-xl mr-4 flex-shrink-0 transition-colors ${isLessonDone ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-slate-100 dark:bg-slate-800'
                                }`}>
                                <Icon className={`h-5 w-5 ${isLessonDone ? 'text-emerald-500' : 'text-slate-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-900 dark:text-white font-bold text-sm truncate">
                                    {lesson.title}
                                  </span>
                                  {lesson.isRequired && (
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  <p className="text-xs text-slate-500 font-medium truncate max-w-xs">
                                    {lesson.description || 'No description available for this lesson.'}
                                  </p>
                                  {lesson.duration && (
                                    <span className="flex items-center text-[10px] font-bold text-slate-400">
                                      <ClockIcon className="h-3 w-3 mr-1" />
                                      {lesson.duration}m
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRightIcon className="h-4 w-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-4" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to start?
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 text-sm font-medium">Price</span>
                <span className="text-green-600 font-black text-lg">FREE</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-gray-700">
                <span className="text-gray-500 text-sm font-medium">Certification</span>
                <span className="text-gray-900 dark:text-white font-bold text-sm">Included</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-500 text-sm font-medium">Access</span>
                <span className="text-gray-900 dark:text-white font-bold text-sm">Lifetime</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleEnroll}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-xl shadow-blue-500/25 transition-all text-base"
              >
                Enroll in Course
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full h-14 rounded-2xl border-2 border-gray-100 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all text-base"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Contact Instructor
              </Button>
            </div>

            {course.tags.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-50 dark:border-gray-700">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                  Course Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-tight bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}