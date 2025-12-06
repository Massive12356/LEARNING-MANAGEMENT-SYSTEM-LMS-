import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginForm, RegisterPayload } from '../types';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';

interface AuthState {
  user: User | null;
  isViewingAs: boolean;
  originalUser: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  viewAsUser: (userId: string) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  exitViewAs: () => void;
  initializeAuth: () => Promise<void>;
}

/** Normalizes any backend user object to match frontend User type safely */
export function normalizeUser(user: any): User {
  return {
    id: String(user.id),
    email: user.email ?? '',
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    role: user.role ?? 'student',
    organizationId: user.organizationId ?? undefined,
    images: user.images ?? null,
    birthday: user.birthday ?? null,
    country: user.country ?? null,
    gender: user.gender ?? null,
    levelOfEducation: user.levelOfEducation ?? null,
    isArchived: user.isArchived ?? false,
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
    updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
    organizationDetails: user.organizationDetails ?? undefined,
    newStatus: user.newStatus ?? 'pending',
    status: user.status ?? 'pending',
    isVerified: user.isVerified ?? false,
    isDeleted: user.isDeleted ?? false,

    // ✅ ADD THESE
    emailNotificationEnabler: user.emailNotificationEnabler ?? false,
    smsNotificationEnabler: user.smsNotificationEnabler ?? false,
    pushNotificationEnabler: user.pushNotificationEnabler ?? false,
  };
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
            user: user ? normalizeUser(user) : null,
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
            user: normalizeUser(response.user),
            isAuthenticated: true,
          });
          console.log('Response From Backend', response.user);
        } catch (error: any) {
          console.log('Error From Backend', error);
          throw error;
        }
      },

      register: async (userData: RegisterPayload) => {
        try {
          const response = await authService.register(userData);
          set({ user: normalizeUser(response.user) });
          console.log('Response from Backend', response.user);
        } catch (error: any) {
          console.log(error.message || 'Registration failed');
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, isViewingAs: false, originalUser: null });
      },

      fetchUserById: async (id: string) => {
        try {
          const fullUser = await adminService.getUserById(id);
          set({ user: normalizeUser(fullUser), isAuthenticated: true });
        } catch (error: any) {
          console.error(error?.message || 'Failed to fetch user by ID:');
          throw error;
        }
      },

      updateUser: (updatedUser: User) => {
        const { user } = get();
        if (!user) return;

        set({ user: normalizeUser(updatedUser) });
      },

      viewAsUser: async (userId: string) => {
        const { user } = get();
        if (!user || !['admin', 'superuser'].includes(user.role)) {
          throw new Error('Unauthorized');
        }

        try {
          const targetUser = await adminService.getUserById(userId);
          set({
            user: normalizeUser(targetUser),
            originalUser: user,
            isViewingAs: true,
          });
        } catch (error: any) {
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
