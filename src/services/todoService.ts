import { TodoItem, TodoList as TodoListType } from '../types';
import { notificationService } from './notificationService';

const TODO_STORAGE_KEY = 'lms_todos';

class TodoService {
  // Get all todos for a user
  getTodos(userId: string): TodoItem[] {
    try {
      const stored = localStorage.getItem(TODO_STORAGE_KEY);
      if (!stored) return [];
      
      const allTodos: TodoItem[] = JSON.parse(stored);
      return allTodos
        .filter(todo => todo.userId === userId)
        .map(todo => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
        }));
    } catch (error) {
      console.error('Error loading todos:', error);
      return [];
    }
  }

  // Add a new todo
  addTodo(userId: string, todoData: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): TodoItem {
    const newTodo: TodoItem = {
      ...todoData,
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.saveTodo(newTodo);
    
    // Create notification for high-priority todos if settings allow
    if (todoData.priority === 'high') {
      // Check if user wants to receive todo notifications
      const settingsStr = localStorage.getItem(`notification_settings_${userId}`);
      let shouldNotify = true;
      
      if (settingsStr) {
        try {
          const settings = JSON.parse(settingsStr);
          // For todos, we'll use assignment reminders setting as it's the closest match
          shouldNotify = settings.assignmentReminders !== false;
        } catch (error) {
          console.error('Error parsing notification settings:', error);
        }
      }
      
      if (shouldNotify) {
        notificationService.createUserNotification(
          userId,
          `High Priority Task: ${todoData.title}`,
          todoData.description || `You have a new high priority task: ${todoData.title}`,
          'info',
          'high',
          'system',
          'Task Manager'
        );
      }
    }
    
    return newTodo;
  }

  // Update an existing todo
  updateTodo(todoId: string, updates: Partial<TodoItem>): TodoItem | null {
    try {
      const stored = localStorage.getItem(TODO_STORAGE_KEY);
      if (!stored) return null;

      const allTodos: TodoItem[] = JSON.parse(stored);
      const todoIndex = allTodos.findIndex(todo => todo.id === todoId);
      
      if (todoIndex === -1) return null;

      const originalTodo = allTodos[todoIndex];
      const updatedTodo = {
        ...allTodos[todoIndex],
        ...updates,
        updatedAt: new Date()
      };

      allTodos[todoIndex] = updatedTodo;
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(allTodos));

      // Create notification if priority was changed to high
      if (updates.priority === 'high' && originalTodo.priority !== 'high') {
        // Check if user wants to receive todo notifications
        const settingsStr = localStorage.getItem(`notification_settings_${updatedTodo.userId}`);
        let shouldNotify = true;
        
        if (settingsStr) {
          try {
            const settings = JSON.parse(settingsStr);
            // For todos, we'll use assignment reminders setting as it's the closest match
            shouldNotify = settings.assignmentReminders !== false;
          } catch (error) {
            console.error('Error parsing notification settings:', error);
          }
        }
        
        if (shouldNotify) {
          notificationService.createUserNotification(
            updatedTodo.userId,
            `High Priority Task: ${updatedTodo.title}`,
            updatedTodo.description || `You have a new high priority task: ${updatedTodo.title}`,
            'info',
            'high',
            'system',
            'Task Manager'
          );
        }
      }

      return {
        ...updatedTodo,
        createdAt: new Date(updatedTodo.createdAt),
        updatedAt: new Date(updatedTodo.updatedAt),
        dueDate: updatedTodo.dueDate ? new Date(updatedTodo.dueDate) : undefined
      };
    } catch (error) {
      console.error('Error updating todo:', error);
      return null;
    }
  }

  // Delete a todo
  deleteTodo(todoId: string): boolean {
    try {
      const stored = localStorage.getItem(TODO_STORAGE_KEY);
      if (!stored) return false;

      const allTodos: TodoItem[] = JSON.parse(stored);
      const filteredTodos = allTodos.filter(todo => todo.id !== todoId);
      
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(filteredTodos));
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return false;
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
  getTodosByStatus(userId: string, status: string): TodoItem[] {
    const todos = this.getTodos(userId);
    return todos.filter(todo => todo.status === status);
  }

  // Get overdue todos
  getOverdueTodos(userId: string): TodoItem[] {
    const todos = this.getTodos(userId);
    const now = new Date();
    
    return todos.filter(todo => 
      todo.dueDate && 
      new Date(todo.dueDate) < now && 
      todo.status !== 'completed'
    );
  }

  // Get todos due today
  getTodosDueToday(userId: string): TodoItem[] {
    const todos = this.getTodos(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return todos.filter(todo => {
      if (!todo.dueDate) return false;
      const dueDate = new Date(todo.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate >= today && dueDate < tomorrow && todo.status !== 'completed';
    });
  }

  // Get todo statistics
  getTodoStats(userId: string) {
    const todos = this.getTodos(userId);
    const completed = todos.filter(todo => todo.status === 'completed').length;
    const pending = todos.filter(todo => todo.status === 'pending').length;
    const inProgress = todos.filter(todo => todo.status === 'in-progress').length;
    const overdue = this.getOverdueTodos(userId).length;
    const dueToday = this.getTodosDueToday(userId).length;

    return {
      total: todos.length,
      completed,
      pending,
      inProgress,
      overdue,
      dueToday,
      completionRate: todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0
    };
  }

  // Export todos to JSON
  exportTodos(userId: string): string {
    const todos = this.getTodos(userId);
    return JSON.stringify(todos, null, 2);
  }

  // Import todos from JSON
  importTodos(userId: string, todosJson: string): { success: boolean; imported: number; errors: string[] } {
    try {
      const importedTodos: TodoItem[] = JSON.parse(todosJson);
      const errors: string[] = [];
      let imported = 0;

      for (const todo of importedTodos) {
        // Validate todo structure
        if (!todo.title) {
          errors.push(`Todo at index ${imported} is missing title`);
          continue;
        }

        // Add todo with userId
        this.addTodo(userId, {
          title: todo.title,
          description: todo.description,
          status: todo.status || 'pending',
          priority: todo.priority || 'medium',
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          tags: todo.tags || [],
          courseId: todo.courseId,
          lessonId: todo.lessonId
        });
        imported++;
      }

      return { success: errors.length === 0, imported, errors };
    } catch (error) {
      console.error('Error importing todos:', error);
      return { success: false, imported: 0, errors: ['Invalid JSON format'] };
    }
  }
}

export const todoService = new TodoService();
