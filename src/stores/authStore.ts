import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginForm, RegisterForm } from '../types';
import { authService } from '../services/authService';
import { mockApi } from '../services/mockApi';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  isViewingAs: boolean;
  originalUser: User | null;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  viewAsUser: (userId: string) => Promise<void>;
  exitViewAs: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      isViewingAs: false,
      originalUser: null,

      initializeAuth: async () => {
        try {
          const user = await authService.initialize();
          set({ user, loading: false });
        } catch (error) {
          console.error('Auth initialization error:', error);
          authService.logout();
          set({ user: null, loading: false });
        }
      },

      login: async (credentials: LoginForm) => {
        try {
          set({ loading: true });
          const response = await authService.login(credentials);
          set({ user: response.user, loading: false });
          toast.success('Login successful!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Login failed');
          throw error;
        }
      },

      register: async (userData: RegisterForm) => {
        try {
          set({ loading: true });
          const response = await authService.register(userData);
          set({ user: response.user, loading: false });
          toast.success('Registration successful!');
        } catch (error: any) {
          set({ loading: false });
          toast.error(error.message || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, isViewingAs: false, originalUser: null });
        toast.success('Logged out successfully');
      },

      updateUser: async (userData: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        try {
          // TODO: Replace with real API call
          const updatedUser = await mockApi.updateUser(user.id, userData);
          set({ user: updatedUser });
          toast.success('Profile updated successfully');
        } catch (error: any) {
          toast.error(error.message || 'Update failed');
          throw error;
        }
      },

      viewAsUser: async (userId: string) => {
        const { user } = get();
        if (!user || !['admin', 'superuser'].includes(user.role)) {
          throw new Error('Unauthorized');
        }

        try {
          // TODO: Replace with real API call
          const targetUser = await mockApi.getUserById(userId);
          set({ 
            user: targetUser, 
            originalUser: user,
            isViewingAs: true
          });
          toast.success(`Now viewing as ${targetUser.firstName} ${targetUser.lastName}`);
        } catch (error: any) {
          toast.error(error.message || 'Failed to view as user');
          throw error;
        }
      },

      exitViewAs: () => {
        const { originalUser } = get();
        if (originalUser) {
          set({ 
            user: originalUser, 
            originalUser: null, 
            isViewingAs: false 
          });
          toast.success('Returned to your account');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isViewingAs: state.isViewingAs,
        originalUser: state.originalUser
      }),
    }
  )
);