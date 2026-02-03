import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Capacitor } from '@capacitor/core';
import { useAuthStore } from '../../features/auth/store/authStore';

// API Base URL configuration:
// - Native apps (Android/iOS): Always use full URL (no CORS restrictions)
// - Web development: Empty URL to use Vite proxy
// - Web production: Full URL
const getBaseUrl = (): string => {
  const fullApiUrl = import.meta.env.VITE_API_URL || 'https://demo.labgate.net';
  const isNative = Capacitor.isNativePlatform();
  const isDev = import.meta.env.DEV;

  if (isDev) {
    console.log('[API] Platform:', isNative ? Capacitor.getPlatform() : 'web');
  }

  // Native platforms don't have CORS - always use full URL
  if (isNative) {
    return fullApiUrl;
  }

  // Web: use proxy in dev, full URL in prod
  return isDev ? '' : fullApiUrl;
};

const API_BASE_URL = getBaseUrl();

// Token refresh deduplication: prevents multiple simultaneous refresh requests
let refreshPromise: Promise<string> | null = null;

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

    // Only log in development mode
    if (import.meta.env.DEV) {
      console.log('[API] Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Deduplicated token refresh function
const refreshToken = async (): Promise<string> => {
  const currentToken = useAuthStore.getState().token;
  if (!currentToken) {
    throw new Error('No token available for refresh');
  }

  // labGate API v3 refresh endpoint
  const response = await axios.post(`${API_BASE_URL}/api/v3/authentication/refresh`, {
    Token: currentToken,
  });

  const { Token: newToken } = response.data;
  useAuthStore.getState().setToken(newToken);
  return newToken;
};

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
          // Use deduplication: if a refresh is already in progress, wait for it
          if (!refreshPromise) {
            refreshPromise = refreshToken().finally(() => {
              refreshPromise = null;
            });
          }

          const newToken = await refreshPromise;
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
