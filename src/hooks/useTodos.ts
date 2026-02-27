import { useState, useEffect } from 'react';
import { TodoItem } from '../types';
import { todoService } from '../services/todoService';
import toast from 'react-hot-toast';

export const useTodos = (userId: string) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load todos on mount and when userId changes
  useEffect(() => {
    if (userId) {
      loadTodos();
    }
  }, [userId]);

  const loadTodos = () => {
    setLoading(true);
    try {
      const userTodos = todoService.getTodos(userId);
      setTodos(userTodos);
    } catch (error) {
      console.error('Error loading todos:', error);
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const addTodo = (todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const newTodo = todoService.addTodo(userId, todoData);
      setTodos(prev => [newTodo, ...prev]);
      return newTodo;
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Failed to add todo');
      return null;
    }
  };

  const updateTodo = (todoId: string, updates: Partial<TodoItem>) => {
    try {
      const updatedTodo = todoService.updateTodo(todoId, updates);
      if (updatedTodo) {
        setTodos(prev => 
          prev.map(todo => 
            todo.id === todoId ? updatedTodo : todo
          )
        );
        return updatedTodo;
      }
      return null;
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Failed to update todo');
      return null;
    }
  };

  const deleteTodo = (todoId: string) => {
    try {
      const success = todoService.deleteTodo(todoId);
      if (success) {
        setTodos(prev => prev.filter(todo => todo.id !== todoId));
        toast.success('Todo deleted');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete todo');
      return false;
    }
  };

  const getStats = () => {
    return todoService.getTodoStats(userId);
  };

  const getOverdueTodos = () => {
    return todoService.getOverdueTodos(userId);
  };

  const getTodosDueToday = () => {
    return todoService.getTodosDueToday(userId);
  };

  const exportTodos = () => {
    try {
      const todosJson = todoService.exportTodos(userId);
      const blob = new Blob([todosJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Todos exported successfully');
    } catch (error) {
      console.error('Error exporting todos:', error);
      toast.error('Failed to export todos');
    }
  };

  const importTodos = (file: File) => {
    return new Promise<{ success: boolean; imported: number; errors: string[] }>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const result = todoService.importTodos(userId, content);
          
          if (result.success) {
            loadTodos(); // Reload todos after import
            toast.success(`Imported ${result.imported} todos`);
            if (result.errors.length > 0) {
              console.warn('Import warnings:', result.errors);
            }
          } else {
            toast.error('Failed to import todos');
          }
          
          resolve(result);
        } catch (error) {
          console.error('Error importing todos:', error);
          toast.error('Failed to import todos');
          resolve({ success: false, imported: 0, errors: ['File reading error'] });
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        resolve({ success: false, imported: 0, errors: ['File reading error'] });
      };
      reader.readAsText(file);
    });
  };

  const clearAllTodos = () => {
    try {
      const success = todoService.clearAllTodos(userId);
      if (success) {
        setTodos([]);
        toast.success('All todos cleared');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing todos:', error);
      toast.error('Failed to clear todos');
      return false;
    }
  };

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    getStats,
    getOverdueTodos,
    getTodosDueToday,
    exportTodos,
    importTodos,
    clearAllTodos,
    refreshTodos: loadTodos
  };
};
