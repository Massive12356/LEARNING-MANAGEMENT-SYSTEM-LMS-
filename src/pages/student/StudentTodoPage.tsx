import { StudentTodo } from '../../components/student/StudentTodo';
import { useAuthStore } from '../../stores/authStore';
import { ListBulletIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';

export const StudentTodoPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Premium V2 Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl mb-12">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px]"></div>

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <svg className="h-full w-full" width="100%" height="100%">
            <defs>
              <pattern id="todo-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#todo-grid)" />
          </svg>
        </div>

        <div className="relative p-10 md:p-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center px-4 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                  Personal Productivity
                </div>
                <div className="inline-flex items-center px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  Efficiency Mode
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
                  Master Task List
                </h1>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                  Organize your learning journey, track milestones, and stay ahead of your course schedule with precision and ease.
                </p>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <ListBulletIcon className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-bold text-slate-200">Track Progress</span>
                </div>
                <div className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-bold text-slate-200">Complete Goals</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <ListBulletIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white leading-none mb-1">Stay Focused</p>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Active Learning</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
        <StudentTodo userId={user?.id || ''} />
      </div>
    </div>
  );
};