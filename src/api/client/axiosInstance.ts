import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../features/auth/store/authStore';

// In development, use empty base URL to leverage Vite proxy
// In production, use the full API URL
const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // labGate API v3 uses single Token
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh and errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        try {
          // labGate API v3 refresh endpoint
          const response = await axios.post(`${API_BASE_URL}/api/v3/authentication/refresh`, {
            Token: currentToken,
          });

          const { Token: newToken } = response.data;
          useAuthStore.getState().setToken(newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          return Promise.reject(refreshError);
        }
      } else {
        // No token, logout
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
