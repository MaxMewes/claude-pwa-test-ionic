/**
 * Centralized API endpoint constants
 * 
 * This file contains all API endpoint definitions to avoid hardcoded strings
 * throughout the codebase and provide a single source of truth for API paths.
 */

// API Version Constants
export const API_V2 = '/api/v2';
export const API_V3 = '/api/v3';

// Auth Endpoints (v3)
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_V3}/auth/login`,
  LOGOUT: `${API_V3}/auth/logout`,
  REFRESH: `${API_V3}/auth/refresh`,
  TWO_FACTOR: `${API_V3}/auth/twofactor`,
  REGISTER: `${API_V3}/auth/register`,
  RESET_PASSWORD: `${API_V3}/auth/reset-password`,
  CHANGE_PASSWORD: `${API_V3}/auth/change-password`,
  PASSWORD_RULES: `${API_V3}/auth/password-rules`,
} as const;

// Results Endpoints (v3)
export const RESULTS_ENDPOINTS = {
  LIST: `${API_V3}/results`,
  DETAIL: (id: number | string) => `${API_V3}/results/${id}`,
  COUNTER: `${API_V3}/results/counter`,
  MARK_READ: (id: number | string) => `${API_V3}/results/${id}/read`,
  MARK_FAVORITE: (id: number | string) => `${API_V3}/results/${id}/favorite`,
  ARCHIVE: (id: number | string) => `${API_V3}/results/${id}/archive`,
  PDF: (id: number | string) => `${API_V3}/results/${id}/pdf`,
} as const;

// Patients Endpoints (v3)
export const PATIENTS_ENDPOINTS = {
  LIST: `${API_V3}/patients`,
  DETAIL: (id: number | string) => `${API_V3}/patients/${id}`,
  RESULTS: (id: number | string) => `${API_V3}/patients/${id}/results`,
  CREATE: `${API_V3}/patients`,
  UPDATE: (id: number | string) => `${API_V3}/patients/${id}`,
  DELETE: (id: number | string) => `${API_V3}/patients/${id}`,
} as const;

// Laboratories Endpoints (v3)
export const LABORATORIES_ENDPOINTS = {
  LIST: `${API_V3}/laboratories`,
  DETAIL: (id: number | string) => `${API_V3}/laboratories/${id}`,
  SERVICE_CATALOG: (id: number | string) => `${API_V3}/laboratories/${id}/catalog`,
  SEND_MESSAGE: `${API_V3}/laboratories/messages`,
} as const;

// Senders Endpoints (v3)
export const SENDERS_ENDPOINTS = {
  LIST: `${API_V3}/senders`,
  DETAIL: (id: number | string) => `${API_V3}/senders/${id}`,
} as const;

// News Endpoints (v3)
export const NEWS_ENDPOINTS = {
  LIST: `${API_V3}/news`,
  DETAIL: (id: number | string) => `${API_V3}/news/${id}`,
  MARK_READ: (id: number | string) => `${API_V3}/news/${id}/read`,
} as const;

// Settings Endpoints (v3)
export const SETTINGS_ENDPOINTS = {
  FAQ: `${API_V3}/settings/faq`,
  FEEDBACK: `${API_V3}/settings/feedback`,
  UPDATE_INFO: `${API_V3}/settings/update-info`,
} as const;

// User Endpoints (v3)
export const USER_ENDPOINTS = {
  PROFILE: `${API_V3}/user/profile`,
  SETTINGS: `${API_V3}/user/settings`,
  PREFERENCES: `${API_V3}/user/preferences`,
  AVATAR: `${API_V3}/user/avatar`,
} as const;

// Push Notification Endpoints (v3)
export const PUSH_ENDPOINTS = {
  SUBSCRIBE: `${API_V3}/push/subscribe`,
  UNSUBSCRIBE: `${API_V3}/push/unsubscribe`,
  UPDATE: `${API_V3}/push/update`,
} as const;
