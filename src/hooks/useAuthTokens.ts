import { useCallback } from 'react';
import { authService } from '../services/authService';

interface UseAuthTokensReturn {
  getAccessToken: () => string | null;
  isAuthenticated: () => boolean;
  logout: () => void;
}

export const useAuthTokens = (): UseAuthTokensReturn => {
  const getAccessToken = useCallback(() => {
    return authService.getAccessToken();
  }, []);

  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  const logout = useCallback(() => {
    authService.logout();
  }, []);

  return {
    getAccessToken,
    isAuthenticated,
    logout
  };
};

// HTTP interceptor utility for adding auth headers
export const createAuthenticatedFetch = () => {
  return async (url: string, options: RequestInit = {}) => {
    const token = authService.getAccessToken();
    
    const authenticatedOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const response = await fetch(url, authenticatedOptions);

    // Handle token expiry
    if (response.status === 401) {
      try {
        await authService.refreshAccessToken();
        // Retry the request with new token
        const newToken = authService.getAccessToken();
        if (newToken) {
          const retryOptions: RequestInit = {
            ...authenticatedOptions,
            headers: {
              ...authenticatedOptions.headers,
              Authorization: `Bearer ${newToken}`
            }
          };
          return fetch(url, retryOptions);
        }
      } catch {
        authService.logout();
        window.location.href = '/login';
      }
    }

    return response;
  };
};

export const authenticatedFetch = createAuthenticatedFetch();