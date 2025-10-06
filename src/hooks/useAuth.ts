import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';
import { AuthContextType } from '../types';

// This hook maintains the same interface as the original useAuth hook
// making it easier to migrate from Context API to Zustand
export const useAuth = (): AuthContextType => {
  const {
    user,
    loading,
    isViewingAs,
    originalUser,
    login,
    register,
    logout,
    updateUser,
    viewAsUser,
    exitViewAs,
    initializeAuth
  } = useAuthStore();

  // Initialize auth on mount (similar to useEffect in AuthContext)
  useEffect(() => {
    if (user === null && loading) {
      initializeAuth();
    }
  }, [user, loading, initializeAuth]);

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    viewAsUser,
    exitViewAs,
    isViewingAs,
    originalUser,
  };
};