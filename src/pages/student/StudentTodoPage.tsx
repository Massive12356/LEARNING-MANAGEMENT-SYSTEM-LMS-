import React from 'react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { StudentTodo } from '../../components/student/StudentTodo';
import { useAuth } from '../../contexts/AuthContext';

export const StudentTodoPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Todo List</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your tasks and track your progress
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Tasks
          </h2>
        </CardHeader>
        <CardContent>
          <StudentTodo userId={user?.id || ''} />
        </CardContent>
      </Card>
    </div>
  );
};