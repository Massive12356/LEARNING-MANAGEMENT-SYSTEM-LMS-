import React from 'react';
import { TodoList } from '../ui/TodoList';
import { useTodos } from '../../hooks/useTodos';

interface StudentTodoProps {
  userId: string;
  className?: string;
}

export const StudentTodo: React.FC<StudentTodoProps> = ({ userId, className = '' }) => {
  const { todos, loading, addTodo, updateTodo, deleteTodo } = useTodos(userId);

  return (
    <div className={`space-y-6 ${className}`}>
      <TodoList
        todos={todos}
        loading={loading}
        pagination={{
          total: todos.length,
          page: 1,
          limit: todos.length || 10,
          totalPages: 1
        }}
        goToPage={() => { }}
        onAdd={addTodo}
        onUpdate={updateTodo}
        onDelete={deleteTodo}
        userId={userId}
        showAddButton={true}
        maxHeight="600px"
      />
    </div>
  );
};