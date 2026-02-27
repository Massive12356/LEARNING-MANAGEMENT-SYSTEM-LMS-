import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { mockApi } from '../../services/mockApi';
import { Program, Course } from '../../types';
import {
  BookOpenIcon,
  CheckCircleIcon,
  TrophyIcon,
  LockClosedIcon,
  PlayIcon,
  ArrowLongLeftIcon,
  QueueListIcon,
  PresentationChartLineIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Premium V2 Program Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl mb-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]"></div>

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <svg className="h-full w-full" width="100%" height="100%">
            <defs>
              <pattern id="grid-header" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-header)" />
          </svg>
        </div>

        <div className="relative p-10 md:p-14">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-6 max-w-3xl">
              <Link
                to="/student/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-black uppercase tracking-widest transition-all"
              >
                <ArrowLongLeftIcon className="h-4 w-4" />
                Return to Dashboard
              </Link>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center px-4 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                    Learning Track
                  </div>
                  {program.requiresCertificate && (
                    <div className="inline-flex items-center px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <StarIcon className="h-3 w-3 mr-1" />
                      Certification Path
                    </div>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
                  {program.title}
                </h1>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                  {program.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <QueueListIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-bold text-slate-200">{totalCourses} Courses</span>
                </div>
                {program.requiredOrder && (
                  <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <LockClosedIcon className="h-5 w-5 text-amber-400" />
                    <span className="text-sm font-bold text-slate-200">Sequential Order</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-[400px] space-y-6">
              <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
                {/* Stats Decorative Element */}
                <div className="absolute top-0 right-0 p-4 opacity-10 transition-transform group-hover:scale-110">
                  <PresentationChartLineIcon className="h-24 w-24 text-white" />
                </div>

                <div className="relative space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Program Mastery</p>
                    <span className="text-2xl font-black text-blue-400">{Math.round(progressPercent)}%</span>
                  </div>

                  <div className="relative h-4 w-full bg-white/10 rounded-full overflow-hidden p-1">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="text-sm font-bold text-slate-300">
                    <span className="text-white">{completedCount}</span> out of {totalCourses} courses mastered
                  </p>

                  {program.requiresCertificate && (
                    <div className={`mt-6 p-5 rounded-3xl border-2 transition-all duration-500 ${isProgramComplete
                      ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 border-white/10 border-dashed'
                      }`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isProgramComplete ? 'bg-white shadow-xl' : 'bg-white/10'}`}>
                          <TrophyIcon className={`h-6 w-6 ${isProgramComplete ? 'text-emerald-500' : 'text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xs font-black uppercase tracking-widest ${isProgramComplete ? 'text-emerald-950' : 'text-slate-400'}`}>
                            {isProgramComplete ? 'Certification Unlocked' : 'Certification Status'}
                          </p>
                          <p className={`text-sm font-bold mt-0.5 ${isProgramComplete ? 'text-emerald-900' : 'text-slate-200'}`}>
                            {isProgramComplete ? 'Congratulations! Earned' : 'Master all modules to earn'}
                          </p>
                        </div>
                      </div>
                      {isProgramComplete && (
                        <Button className="w-full mt-4 bg-white text-emerald-600 hover:bg-emerald-50 h-12 rounded-2xl font-black uppercase tracking-tighter shadow-lg transition-transform active:scale-95 group">
                          <ArrowDownTrayIcon className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                          Claim Certificate
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course List - Modern Progress Track */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
            Program Curriculum
          </h2>
          <div className="px-5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800">
            {totalCourses} Modules Total
          </div>
        </div>

        <div className="space-y-4">
          {courses.map((course, index) => {
            const isCompleted = completedCourses.has(course.id);
            const isLocked = program.requiredOrder && index > 0 && !completedCourses.has(courses[index - 1].id);

            return (
              <div
                key={course.id}
                className={`group relative bg-white dark:bg-gray-800 rounded-[2rem] border-2 transition-all duration-300 ${isLocked
                  ? 'border-gray-50 dark:border-gray-800 opacity-60'
                  : isCompleted
                    ? 'border-emerald-500/10 hover:border-emerald-500/30 bg-emerald-50/10'
                    : 'border-gray-100 dark:border-gray-700 hover:border-blue-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1'
                  }`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Status Orb */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 ${isCompleted
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : isLocked
                          ? 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                          : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                        }`}>
                        {isCompleted ? (
                          <CheckCircleIcon className="h-10 w-10" />
                        ) : isLocked ? (
                          <LockClosedIcon className="h-8 w-8" />
                        ) : (
                          <span className="opacity-40 text-4xl absolute -bottom-1 -right-1 leading-none">{index + 1}</span>
                        )}
                        {!isCompleted && !isLocked && index + 1}
                      </div>

                      {isCompleted && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full border-4 border-emerald-500 flex items-center justify-center shadow-lg animate-bounce">
                          <StarIcon className="h-4 w-4 text-emerald-500" />
                        </div>
                      )}
                    </div>

                    {/* Course Thumbnail */}
                    {course.coverImage && (
                      <div className="relative flex-shrink-0 overflow-hidden rounded-2xl w-32 h-32 md:w-40 md:h-28 hidden md:block group-hover:scale-105 transition-transform duration-700">
                        <img
                          src={course.coverImage}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    )}

                    {/* Course Content Detail */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {course.isGraded && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-amber-500/20">
                            Graded Module
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20">
                            Mastered
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mt-1">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4 text-slate-300" />
                          {course.modules.length} Modules
                        </div>
                        {course.requiresCertificate && (
                          <div className="flex items-center gap-2">
                            <StarIcon className="h-3.5 w-3.5 text-amber-400" />
                            Certifiable
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dynamic Action Zone */}
                    <div className="flex-shrink-0 md:w-56 w-full pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-3">
                      {isCompleted ? (
                        <div className="text-center w-full">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Verification Complete</p>
                          <Link to={`/student/course/${course.id}`} className="block">
                            <Button
                              variant="outline"
                              className="w-full h-12 rounded-2xl border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 font-bold transition-all flex items-center justify-center gap-2"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                              Review Content
                            </Button>
                          </Link>
                        </div>
                      ) : isLocked ? (
                        <div className="text-center space-y-2 py-4">
                          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl w-fit mx-auto">
                            <LockClosedIcon className="h-6 w-6 text-slate-300" />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sequence Locked</p>
                        </div>
                      ) : (
                        <div className="w-full space-y-4">
                          <div className="flex items-center justify-center gap-1.5 text-blue-500 animate-pulse">
                            <PlayIcon className="h-4 w-4 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Available Now</span>
                          </div>
                          <Link to={`/student/course/${course.id}`} className="block">
                            <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 font-black uppercase tracking-tight transition-all active:scale-95">
                              Launch Module
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {courses.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700 p-20 text-center shadow-sm">
          <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-[2rem] w-fit mx-auto mb-8">
            <BookOpenIcon className="h-16 w-16 text-slate-300" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">
            Curriculum Pending
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium text-lg">
            This learning path is currently being updated. Check back soon for new modules.
          </p>
        </div>
      )}
    </div>
  );
}