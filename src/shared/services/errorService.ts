/**
 * Centralized Error Handling Service
 *
 * Provides consistent error handling, categorization, and user-friendly messages
 * across the application.
 */

import { AxiosError } from 'axios';
import i18n from 'i18next';

// Error categories for different handling strategies
export type ErrorCategory =
  | 'network'      // Network/connection errors
  | 'auth'         // Authentication/authorization errors
  | 'validation'   // Input validation errors
  | 'notFound'     // Resource not found
  | 'serverError'  // Server-side errors (5xx)
  | 'rateLimit'    // Rate limiting
  | 'timeout'      // Request timeout
  | 'unknown';     // Unknown/unhandled errors

export interface AppError {
  /** Original error object */
  originalError: unknown;
  /** Error category for handling logic */
  category: ErrorCategory;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** User-friendly error message (translated) */
  message: string;
  /** Technical details for debugging (only in dev) */
  details?: string;
  /** Whether this error should be reported to error tracking */
  shouldReport: boolean;
  /** Whether user should retry the action */
  isRetryable: boolean;
}

/**
 * Default error messages by category (i18n keys)
 */
const ERROR_MESSAGES: Record<ErrorCategory, string> = {
  network: 'errors.network',
  auth: 'errors.auth',
  validation: 'errors.validation',
  notFound: 'errors.notFound',
  serverError: 'errors.server',
  rateLimit: 'errors.rateLimit',
  timeout: 'errors.timeout',
  unknown: 'errors.unknown',
};

/**
 * Fallback messages when i18n is not available
 */
const FALLBACK_MESSAGES: Record<ErrorCategory, string> = {
  network: 'Keine Internetverbindung. Bitte überprüfen Sie Ihre Verbindung.',
  auth: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
  validation: 'Die eingegebenen Daten sind ungültig.',
  notFound: 'Die angeforderte Ressource wurde nicht gefunden.',
  serverError: 'Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
  rateLimit: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
  timeout: 'Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut.',
  unknown: 'Ein unerwarteter Fehler ist aufgetreten.',
};

/**
 * Categorize an error based on its type and properties
 */
function categorizeError(error: unknown): { category: ErrorCategory; statusCode?: number } {
  // Axios errors
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;

    // Network error (no response)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return { category: 'timeout' };
      }
      return { category: 'network' };
    }

    const status = axiosError.response.status;

    // Status code based categorization
    if (status === 401 || status === 403) {
      return { category: 'auth', statusCode: status };
    }
    if (status === 404) {
      return { category: 'notFound', statusCode: status };
    }
    if (status === 422 || status === 400) {
      return { category: 'validation', statusCode: status };
    }
    if (status === 429) {
      return { category: 'rateLimit', statusCode: status };
    }
    if (status >= 500) {
      return { category: 'serverError', statusCode: status };
    }

    return { category: 'unknown', statusCode: status };
  }

  // Standard Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return { category: 'network' };
    }
    if (message.includes('timeout')) {
      return { category: 'timeout' };
    }
  }

  return { category: 'unknown' };
}

/**
 * Extract server error message from API response
 */
function extractServerMessage(error: AxiosError): string | undefined {
  const data = error.response?.data;
  if (data && typeof data === 'object') {
    // Common API error response formats
    if ('Message' in data && typeof data.Message === 'string') {
      return data.Message;
    }
    if ('message' in data && typeof data.message === 'string') {
      return data.message;
    }
    if ('error' in data && typeof data.error === 'string') {
      return data.error;
    }
  }
  return undefined;
}

/**
 * Get translated error message
 */
function getErrorMessage(category: ErrorCategory, serverMessage?: string): string {
  // Use server message if available and meaningful
  if (serverMessage && !serverMessage.includes('<!DOCTYPE')) {
    return serverMessage;
  }

  // Try i18n translation
  const i18nKey = ERROR_MESSAGES[category];
  const translated = i18n.t(i18nKey);

  // If i18n returns the key (not found), use fallback
  if (translated === i18nKey) {
    return FALLBACK_MESSAGES[category];
  }

  return translated;
}

/**
 * Process an error into a standardized AppError object
 */
export function processError(error: unknown): AppError {
  const { category, statusCode } = categorizeError(error);

  let serverMessage: string | undefined;
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    serverMessage = extractServerMessage(error as AxiosError);
  }

  const message = getErrorMessage(category, serverMessage);

  // Determine if error should be reported
  const shouldReport = category === 'serverError' || category === 'unknown';

  // Determine if error is retryable
  const isRetryable = ['network', 'timeout', 'serverError', 'rateLimit'].includes(category);

  // Include technical details only in development
  let details: string | undefined;
  if (import.meta.env.DEV && error instanceof Error) {
    details = error.stack || error.message;
  }

  return {
    originalError: error,
    category,
    statusCode,
    message,
    details,
    shouldReport,
    isRetryable,
  };
}

/**
 * Log error with appropriate level based on environment
 */
export function logError(error: AppError, context?: string): void {
  // In production, only log critical errors
  if (!import.meta.env.DEV) {
    if (error.shouldReport) {
      // Here you would integrate with error tracking service (Sentry, etc.)
      // For now, just log to console in a minimal way
      console.error(`[Error] ${context || 'Unknown'}: ${error.category}`);
    }
    return;
  }

  // In development, log full details
  console.group(`🔴 Error: ${context || 'Unknown context'}`);
  console.log('Category:', error.category);
  console.log('Message:', error.message);
  if (error.statusCode) {
    console.log('Status:', error.statusCode);
  }
  if (error.details) {
    console.log('Details:', error.details);
  }
  console.log('Retryable:', error.isRetryable);
  console.log('Should Report:', error.shouldReport);
  console.groupEnd();
}

/**
 * Handle an error: process, log, and return user-friendly message
 */
export function handleError(error: unknown, context?: string): AppError {
  const appError = processError(error);
  logError(appError, context);
  return appError;
}

/**
 * Check if an error is a specific category
 */
export function isErrorCategory(error: unknown, category: ErrorCategory): boolean {
  const processed = processError(error);
  return processed.category === category;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return isErrorCategory(error, 'auth');
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return isErrorCategory(error, 'network');
}

/**
 * Create a user-friendly error message from any error
 */
export function getErrorMessageFromError(error: unknown): string {
  return processError(error).message;
}
