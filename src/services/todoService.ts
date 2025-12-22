import { AxiosError } from 'axios';
import { TodoItem, TodoList as TodoListType } from '../types';
import apiClient from './apiClient';
import { notificationService } from './notificationService';

const TODO_STORAGE_KEY = 'lms_todos';

class TodoService {
  // Get all todos for a user
  async getTodos(page= 1, limit=10){
    try {
     const response = await apiClient.get(`/todos`,{params: {page , limit},});
     console.log("[todoService] RESPONSE FROM SERVICE", response?.data)
     const data = response?.data?.data
     return {
      todos: data.todos,
      pagination: data.pagination
     }
    } catch (error) {
      const err = error as AxiosError<{message?:string}>
      console.error('Error loading todos:', err?.response?.data || err?.message);
      throw new Error(err?.response?.data?.message || err?.message)
    }
  }

  // Add a new todo
  async addTodo(
    todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ): Promise<TodoItem> {
    try {
      const response = await apiClient.post('/todos', todoData);
      console.log('[todoService] RESPONSE FROM SERVER:', response?.data);
      return response?.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      console.log(
        '[todoService] ERROR RESPONSE FROM SERVER',
        err?.response?.data?.message || err?.message
      );
      throw new Error(err?.response?.data?.message || err?.message);
    }
  }

  // Update an existing todo
  async updateTodo(id: string, updates: Partial<TodoItem>): Promise< TodoItem | null> {
      try {
        const response = await apiClient.patch(`/todo/${id}`, updates);
        console.log("[todoService] RESPONSE FROM SERVICE", response?.data)
        return response?.data
      } catch (error) {
        const err = error as AxiosError<{message?:string}>
        console.log("[todoService] RESPONSE FROM SERVER", err?.response?.data?.message || err?.message)
        throw new Error(err?.message || err?.response?.data?.message)
      }
  }

  // Delete a todo
   async deleteTodo(todoId: string){
    try {
      const response = await apiClient.delete(`/todo/${todoId}`);
      console.log("[todoService] RESPONSE FROM SERVER",response?.data)
      return response?.data
    } catch (error) {
      const err = error as AxiosError<{message?:string}>
      console.log("[todoService] RESPONSE FROM SERVER", err?.response?.data?.message || err?.message)
    }
  }

  // Private method to save a todo
  private saveTodo(todo: TodoItem): void {
    try {
      const stored = localStorage.getItem(TODO_STORAGE_KEY);
      const allTodos: TodoItem[] = stored ? JSON.parse(stored) : [];

      allTodos.push(todo);
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(allTodos));
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  }

  // Get todos by status
  // getTodosByStatus(userId: string, status: string): TodoItem[] {
  //   const todos = this.getTodos(userId);
  //   return todos.filter(todo => todo.status === status);
  // }

  // Get overdue todos
  // getOverdueTodos(userId: string): TodoItem[] {
  //   const todos = this.getTodos(userId);
  //   const now = new Date();

  //   return todos.filter(
  //     todo => todo.dueDate && new Date(todo.dueDate) < now && todo.status !== 'completed'
  //   );
  // }

  // Get todos due today
  // getTodosDueToday(userId: string): TodoItem[] {
  //   const todos = this.getTodos(userId);
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);

  //   const tomorrow = new Date(today);
  //   tomorrow.setDate(tomorrow.getDate() + 1);

  //   return todos.filter(todo => {
  //     if (!todo.dueDate) return false;
  //     const dueDate = new Date(todo.dueDate);
  //     dueDate.setHours(0, 0, 0, 0);
  //     return dueDate >= today && dueDate < tomorrow && todo.status !== 'completed';
  //   });
  // }

  // Get todo statistics
  // getTodoStats(userId: string) {
  //   const todos = this.getTodos(userId);
  //   const completed = todos.filter(todo => todo.status === 'completed').length;
  //   const pending = todos.filter(todo => todo.status === 'pending').length;
  //   const inProgress = todos.filter(todo => todo.status === 'in-progress').length;
  //   const overdue = this.getOverdueTodos(userId).length;
  //   const dueToday = this.getTodosDueToday(userId).length;

  //   return {
  //     total: todos.length,
  //     completed,
  //     pending,
  //     inProgress,
  //     overdue,
  //     dueToday,
  //     completionRate: todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0,
  //   };
  // }

  // Export todos to JSON
  // exportTodos(userId: string): string {
  //   const todos = this.getTodos(userId);
  //   return JSON.stringify(todos, null, 2);
  // }

  // Import todos from JSON
  // importTodos(
  //   userId: string,
  //   todosJson: string
  // ): { success: boolean; imported: number; errors: string[] } {
  //   try {
  //     const importedTodos: TodoItem[] = JSON.parse(todosJson);
  //     const errors: string[] = [];
  //     let imported = 0;

  //     for (const todo of importedTodos) {
  //       // Validate todo structure
  //       if (!todo.title) {
  //         errors.push(`Todo at index ${imported} is missing title`);
  //         continue;
  //       }

        // Add todo with userId
      //   this.addTodo(userId, {
      //     title: todo.title,
      //     description: todo.description,
      //     status: todo.status || 'pending',
      //     priority: todo.priority || 'medium',
      //     dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
      //     tags: todo.tags || [],
      //     courseId: todo.courseId,
      //     lessonId: todo.lessonId,
      //   });
      //   imported++;
      // }

  //     return { success: errors.length === 0, imported, errors };
  //   } catch (error) {
  //     console.error('Error importing todos:', error);
  //     return { success: false, imported: 0, errors: ['Invalid JSON format'] };
  //   }
  // }
}

export const todoService = new TodoService();
