import axios from 'axios';

const TOKEN_KEY = 'authToken'; // must match authService.ts

const api = axios.create({
  // Use relative path so Vite dev proxy forwards /api/* to the backend.
  // In production, set VITE_API_BASE_URL to your real backend domain.
  baseURL: import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL : '',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Add Authorization header when token exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('refreshToken');
    }
    return Promise.reject(error);
  }
);

export default api;

