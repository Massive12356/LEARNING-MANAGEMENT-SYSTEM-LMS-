// services/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optionally attach token if you use authentication
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

   console.log('🚀 [API REQUEST]', {
     url: config.url,
     method: config.method,
     baseURL: config.baseURL,
     fullURL: (config.baseURL || '') + (config.url || ''),
     hasToken: !!token,
     token: token ? token.slice(0, 20) + '...' : 'NO TOKEN FOUND',
   });

  return config;
});

// Log responses
apiClient.interceptors.response.use(
  response => {
    console.log('✅ [API RESPONSE]', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('❌ [API ERROR]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default apiClient;