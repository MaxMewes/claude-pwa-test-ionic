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

  console.log('[API] Platform detection:', {
    isNative,
    isDev,
    platform: Capacitor.getPlatform(),
    fullApiUrl,
  });

  // Native platforms don't have CORS - always use full URL
  if (isNative) {
    console.log('[API] Using full URL for native platform:', fullApiUrl);
    return fullApiUrl;
  }

  // Web: use proxy in dev, full URL in prod
  const url = isDev ? '' : fullApiUrl;
  console.log('[API] Using URL for web:', url || '(proxy)');
  return url;
};

const API_BASE_URL = getBaseUrl();
console.log('[API] Final baseURL:', API_BASE_URL);

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Enable credentials for CSRF token handling
  withCredentials: true,
});

// CSRF Token Management
let csrfToken: string | null = null;

// Request interceptor - add auth token, CSRF token, and log requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // labGate API v3 uses single Token
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing operations (POST, PUT, DELETE, PATCH)
    if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Log the full URL being requested
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    console.log('[API] Request:', config.method?.toUpperCase(), fullUrl);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track ongoing refresh request to prevent race conditions
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

// Response interceptor - handle token refresh, CSRF token extraction, and errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Extract CSRF token from response headers if present
    const newCsrfToken = response.headers['x-csrf-token'];
    if (newCsrfToken) {
      csrfToken = newCsrfToken;
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        try {
          // If already refreshing, wait for the ongoing refresh
          if (isRefreshing && refreshPromise) {
            const newToken = await refreshPromise;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }

          // Start refresh process
          isRefreshing = true;
          refreshPromise = (async () => {
            try {
              // labGate API v3 refresh endpoint
              const response = await axios.post(`${API_BASE_URL}/api/v3/authentication/refresh`, {
                Token: currentToken,
              });

              const { Token: newToken } = response.data;
              useAuthStore.getState().setToken(newToken);
              
              return newToken;
            } finally {
              isRefreshing = false;
              refreshPromise = null;
            }
          })();

          const newToken = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          isRefreshing = false;
          refreshPromise = null;
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
