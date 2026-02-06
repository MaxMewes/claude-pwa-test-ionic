/**
 * Query Key Factory
 * 
 * Centralized query key management for React Query.
 * Provides type-safe, consistent naming convention for all queries.
 * 
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

import type { ResultFilter } from './types/results';
import type { ResultPeriodFilter } from '../shared/store/useSettingsStore';

/**
 * Auth query keys
 */
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  passwordRules: () => [...authKeys.all, 'password-rules'] as const,
} as const;

/**
 * Results query keys
 */
export const resultsKeys = {
  all: ['results'] as const,
  lists: () => [...resultsKeys.all, 'list'] as const,
  list: (filters?: ResultFilter, period?: ResultPeriodFilter) => 
    [...resultsKeys.lists(), { filters, period }] as const,
  details: () => [...resultsKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...resultsKeys.details(), id] as const,
  counters: (period?: ResultPeriodFilter) => [...resultsKeys.all, 'counters', { period }] as const,
  documents: (resultId: number | string) => [...resultsKeys.detail(resultId), 'documents'] as const,
} as const;

/**
 * Patients query keys
 */
export const patientsKeys = {
  all: ['patients'] as const,
  lists: () => [...patientsKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...patientsKeys.lists(), filters] as const,
  details: () => [...patientsKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...patientsKeys.details(), id] as const,
  results: (patientId: number | string) => 
    [...patientsKeys.detail(patientId), 'results'] as const,
  labTrends: (patientId: number | undefined) => 
    patientId ? [...patientsKeys.detail(patientId), 'lab-trends'] as const : ['patients', 'lab-trends', undefined] as const,
} as const;

/**
 * Laboratories query keys
 */
export const laboratoriesKeys = {
  all: ['laboratories'] as const,
  lists: () => [...laboratoriesKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...laboratoriesKeys.lists(), filters] as const,
  details: () => [...laboratoriesKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...laboratoriesKeys.details(), id] as const,
  serviceCatalog: (id: number | string) => 
    [...laboratoriesKeys.detail(id), 'catalog'] as const,
} as const;

/**
 * Senders query keys
 */
export const sendersKeys = {
  all: ['senders'] as const,
  lists: () => [...sendersKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...sendersKeys.lists(), filters] as const,
  details: () => [...sendersKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...sendersKeys.details(), id] as const,
} as const;

/**
 * News query keys
 */
export const newsKeys = {
  all: ['news'] as const,
  lists: () => [...newsKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...newsKeys.lists(), filters] as const,
  details: () => [...newsKeys.all, 'detail'] as const,
  detail: (id: number | string) => [...newsKeys.details(), id] as const,
} as const;

/**
 * Settings query keys
 */
export const settingsKeys = {
  all: ['settings'] as const,
  faq: () => [...settingsKeys.all, 'faq'] as const,
  updateInfo: () => [...settingsKeys.all, 'update-info'] as const,
} as const;

/**
 * User query keys
 */
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  settings: () => [...userKeys.all, 'settings'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
} as const;
