import { useUIStore } from '../stores/uiStore';
import { useEffect } from 'react';
import { UIState } from '../types';

interface UIContextType extends UIState {
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
}

// This hook maintains the same interface as the original useUI hook
export const useUI = (): UIContextType => {
  const {
    theme,
    sidebarCollapsed,
    loading,
    toggleTheme,
    toggleSidebar,
    setLoading
  } = useUIStore();

  // Load theme preference from localStorage on mount (similar to useEffect in UIContext)
  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return {
    theme,
    sidebarCollapsed,
    loading,
    toggleTheme,
    toggleSidebar,
    setLoading,
  };
};