import { useState, useEffect } from 'react';
import { TodoItem } from '../types';
import { todoService } from '../services/todoService';
import toast from 'react-hot-toast';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const useTodos = (userId: string, initialPage = 1, pageSize = 10) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: initialPage,
    limit: pageSize,
    totalPages: 1,
  });

  // Load todos on mount or when userId/page changes
  useEffect(() => {
    if (userId) {
      loadTodos(pagination.page, pagination.limit);
    }
  }, [userId, pagination.page, pagination.limit]);

  const loadTodos = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await todoService.getTodos(page, limit); // call your paginated service
      setTodos(response.todos);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const setPageSize = (limit: number) => {
    setPagination(prev => ({ ...prev, limit }));
  };

 const addTodo = async (
   todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
 ): Promise<TodoItem | null> => {
   try {
     const newTodo = await todoService.addTodo(todoData);
     await loadTodos(pagination.page, pagination.limit); // ≡ƒöä refresh from server
     toast.success('Todo added');
     return newTodo;
   } catch (error: any) {
     toast.error(error?.message || 'Failed to add todo');
     return null;
   }
 };

 const updateTodo = async (
   todoId: string,
   updates: Partial<TodoItem>
 ): Promise<TodoItem | null> => {
   try {
     const updatedTodo = await todoService.updateTodo(todoId, updates);
     if (updatedTodo) {
       await loadTodos(pagination.page, pagination.limit); // ≡ƒöä refresh
       toast.success('Todo updated');
       return updatedTodo;
     }
     return null;
   } catch (error: any) {
     toast.error(error?.message || 'Failed to update todo');
     return null;
   }
 };

 const deleteTodo = async (todoId: string): Promise<boolean> => {
   try {
     const success = await todoService.deleteTodo(todoId);
     if (success) {
       await loadTodos(pagination.page, pagination.limit); // ≡ƒöä refresh
       return true;
     }
     return false;
   } catch (error: any) {
     toast.error(error?.message || 'Failed to delete todo');
     return false;
   }
 };


  // Optional: your other helpers remain unchanged
  const getStats = () => todoService.getTodoStats(userId);
  const getOverdueTodos = () => todoService.getOverdueTodos(userId);
  const getTodosDueToday = () => todoService.getTodosDueToday(userId);
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

  const importTodos = (file: File) =>
    new Promise<{ success: boolean; imported: number; errors: string[] }>(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const content = e.target?.result as string;
          const result = todoService.importTodos(userId, content);

          if (result.success) {
            loadTodos(); // reload after import
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
    pagination,
    loadTodos,
    goToPage,
    setPageSize,
    addTodo,
    updateTodo,
    deleteTodo,
    getStats,
    getOverdueTodos,
    getTodosDueToday,
    exportTodos,
    importTodos,
    clearAllTodos,
  };
};
