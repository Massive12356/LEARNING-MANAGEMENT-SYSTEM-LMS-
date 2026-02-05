// services/apiClient.ts
import axios from 'axios';
import toast from 'react-hot-toast';

// ✅ Create Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor — attach token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Development-only detailed logging
  if (import.meta.env.DEV) {
    console.log('🚀 [API REQUEST]', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: (config.baseURL || '') + (config.url || ''),
      hasToken: !!token,
      token: token ? token.slice(0, 20) + '...' : 'NO TOKEN FOUND',
    });
  }

  return config;
});

// ✅ Response Interceptor — handle responses and errors
apiClient.interceptors.response.use(
  response => {
    // Log only in dev mode
    if (import.meta.env.DEV) {
      console.log('✅ [API RESPONSE]', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  error => {
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    if (import.meta.env.DEV) {
      console.error('❌ [API ERROR]', {
        url: error.config?.url,
        method: error.config?.method,
        status,
        data: error.response?.data,
        message: error.message,
      });
    }

    // ✅ Handle specific HTTP status codes
    switch (status) {
      case 401:
        // Prevent redirect loop if already on login page
        if (currentPath !== '/login') {
          toast.error('Session expired. Please log in again.');

          // Clear tokens/session
          localStorage.removeItem('token');
          localStorage.removeItem('authTokens');
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('lms_access_token');
          localStorage.removeItem('lms_refresh_token');
          sessionStorage.clear();

          // Redirect to login
          window.location.href = '/login';
        }
        break;

      case 403:
        toast.error('You don’t have permission to perform this action.');
        break;

      case 404:
        // Ignore quiz results 404
        if (error.config?.url?.startsWith('/quiz/results/')) {
          console.log('Ignored 404 for quiz results');
          break;
        }
        toast.error('Requested resource not found.');
        break;

      case 500:
        toast.error('Server error occurred. Please try again later.');
        break;

      default:
        // General fallback message
        toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
        break;
    }

    return Promise.reject(error);
  }
);

export default apiClient;
