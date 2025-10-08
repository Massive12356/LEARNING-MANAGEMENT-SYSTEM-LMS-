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
     hasToken: !!token,
     token: token ? token.slice(0, 20) + '...' : 'NO TOKEN FOUND',
   });

  return config;
});

export default apiClient;
