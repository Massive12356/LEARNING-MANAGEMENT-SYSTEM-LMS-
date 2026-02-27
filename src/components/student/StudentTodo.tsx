import React from 'react';
import { TodoList } from '../ui/TodoList';
import { useTodos } from '../../hooks/useTodos';

interface StudentTodoProps {
  userId: string;
  className?: string;
}

export const StudentTodo: React.FC<StudentTodoProps> = ({ userId, className = '' }) => {
  const { todos, addTodo, updateTodo, deleteTodo } = useTodos(userId);

  return (
    <div className={`space-y-6 ${className}`}>
      <TodoList
        items={todos}
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