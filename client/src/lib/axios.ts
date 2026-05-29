import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

// Attach JWT token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed?.state?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // Ignore parse errors
      }
    }
  }
  return config;
});

// Handle global response errors (e.g., 401 Unauthorized vs 403 Forbidden)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute = error.config?.url?.includes('/api/auth/login') || error.config?.url?.includes('/api/auth/signup');
    const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login';

    if (status === 401 && !isAuthRoute && !isLoginPage) {
      // 401 Unauthorized: token expired or invalid -> clear auth and redirect to login
      if (typeof window !== 'undefined') {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }
    // 403 Forbidden: insufficient permissions -> do NOT clear auth or redirect.
    // Let the calling component catch and handle the error (e.g., show toast).
    return Promise.reject(error);
  }
);

export default api;
