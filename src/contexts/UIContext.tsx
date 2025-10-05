import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UIState } from '../types';

interface UIContextType extends UIState {
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}

type UIAction =
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_LOADING'; payload: boolean };

const UIContext = createContext<UIContextType | undefined>(undefined);

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      return { 
        ...state, 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      };
    case 'TOGGLE_SIDEBAR':
      return { 
        ...state, 
        sidebarCollapsed: !state.sidebarCollapsed 
      };
    case 'SET_LOADING':
      return { 
        ...state, 
        loading: action.payload 
      };
    default:
      return state;
  }
};

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, {
    theme: 'light',
    sidebarCollapsed: false,
    loading: false,
  });

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      dispatch({ type: 'TOGGLE_THEME' });
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });
  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });

  const value: UIContextType = {
    ...state,
    toggleTheme,
    toggleSidebar,
    setLoading,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};