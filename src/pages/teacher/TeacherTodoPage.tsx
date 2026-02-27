import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { StudentTodo } from '../../components/student/StudentTodo';
import { useAuthStore } from '../../stores/authStore';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export const TeacherTodoPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* V2 Header - Bold and Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white shadow-2xl">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <CheckCircleIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Task Management
              </h1>
              <p className="text-lg text-blue-200 mt-1">
                Stay organized and track your daily progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Keeping Card structure for consistency */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h2>
        </CardHeader>
        <CardContent>
          {/* CRITICAL: Preserving exact same props and userId */}
          <StudentTodo userId={user?.id || ''} />
        </CardContent>
      </Card>
    </div>
  );
};