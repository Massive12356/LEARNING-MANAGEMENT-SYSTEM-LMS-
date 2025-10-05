import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AuthContextType, LoginForm, RegisterForm } from '../types';
import { authService } from '../services/authService';
import { mockApi } from '../services/mockApi';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  isViewingAs: boolean;
  originalUser: User | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'VIEW_AS_USER'; payload: { user: User; originalUser: User } }
  | { type: 'EXIT_VIEW_AS' };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload, 
        loading: false,
        isViewingAs: false,
        originalUser: null
      };
    case 'VIEW_AS_USER':
      return {
        ...state,
        user: action.payload.user,
        originalUser: action.payload.originalUser,
        isViewingAs: true,
      };
    case 'EXIT_VIEW_AS':
      return {
        ...state,
        user: state.originalUser,
        originalUser: null,
        isViewingAs: false,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    isViewingAs: false,
    originalUser: null,
  });

  useEffect(() => {
    // Initialize authentication with JWT tokens
    const initializeAuth = async () => {
      try {
        const user = await authService.initialize();
        if (user) {
          dispatch({ type: 'SET_USER', payload: user });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginForm) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.login(credentials);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      toast.success('Login successful!');
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: RegisterForm) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await authService.register(userData);
      dispatch({ type: 'SET_USER', payload: response.user });
      
      toast.success('Registration successful!');
    } catch (error: any) {
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'SET_USER', payload: null });
    toast.success('Logged out successfully');
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      // TODO: Replace with real API call
      const updatedUser = await mockApi.updateUser(state.user!.id, userData);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
      throw error;
    }
  };

  const viewAsUser = async (userId: string) => {
    try {
      if (!state.user || !['admin', 'superuser'].includes(state.user.role)) {
        throw new Error('Unauthorized');
      }

      // TODO: Replace with real API call
      const targetUser = await mockApi.getUserById(userId);
      
      dispatch({ 
        type: 'VIEW_AS_USER', 
        payload: { 
          user: targetUser, 
          originalUser: state.user 
        } 
      });
      
      toast.success(`Now viewing as ${targetUser.firstName} ${targetUser.lastName}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to view as user');
      throw error;
    }
  };

  const exitViewAs = () => {
    dispatch({ type: 'EXIT_VIEW_AS' });
    toast.success('Returned to your account');
  };

  const value: AuthContextType = {
    user: state.user,
    loading: state.loading,
    login,
    register,
    logout,
    updateUser,
    viewAsUser,
    exitViewAs,
    isViewingAs: state.isViewingAs,
    originalUser: state.originalUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};