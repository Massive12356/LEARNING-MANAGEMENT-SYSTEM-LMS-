import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginForm, RegisterPayload } from '../types';
import { authService } from '../services/authService';
import { mockApi } from '../services/mockApi';

interface AuthState {
  user: User | null;
  isViewingAs: boolean;
  originalUser: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
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
      isViewingAs: false,
      originalUser: null,
      isAuthenticated: false,

      initializeAuth: async () => {
        try {
          const user = await authService.initialize();
          set({
            user,
            isViewingAs: false,
            isAuthenticated: !!user,
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          authService.logout();
          set({ user: null, isViewingAs: false, isAuthenticated: false });
        }
      },

      login: async (credentials: LoginForm) => {
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            isAuthenticated: true,
          });
          console.log("Response From Backend", response.user )
        } catch (error: any) {
          console.log('Error From Backend', error);
          throw error;
        }
      },

      register: async (userData: RegisterPayload) => {
        try {
          const response = await authService.register(userData);
          set({ user: response.user});
          console.log("Reponse from Backend", response.user )
        } catch (error: any) {
          console.log(error.message || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, isViewingAs: false, originalUser: null });
      },

      updateUser: async (userData: Partial<User>) => {
        const { user } = get();
        if (!user) return;

        try {
          // TODO: Replace with real API call
          const updatedUser = await mockApi.updateUser(user.id, userData);
          set({ user: updatedUser });
          // toast.success('Profile updated successfully');
        } catch (error: any) {
          // toast.error(error.message || 'Update failed');
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
            isViewingAs: true,
          });
          // toast.success(`Now viewing as ${targetUser.firstName} ${targetUser.lastName}`);
        } catch (error: any) {
          // toast.error(error.message || 'Failed to view as user');
          throw error;
        }
      },

      exitViewAs: () => {
        const { originalUser } = get();
        if (originalUser) {
          set({
            user: originalUser,
            originalUser: null,
            isViewingAs: false,
          });
          // toast.success('Returned to your account');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        user: state.user,
        isViewingAs: state.isViewingAs,
        originalUser: state.originalUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
